from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Count, Exists, OuterRef, Value, BooleanField, Prefetch
from ..models import (
    Discussion, DiscussionReply, Review, 
    Conversation, Message, User, Course, Notification
)
from ..serializers import (
    DiscussionSerializer, DiscussionReplySerializer, 
    ReviewSerializer, ConversationSerializer, MessageSerializer, UserSerializer
)

class DiscussionListView(generics.ListCreateAPIView):
    serializer_class = DiscussionSerializer
    permission_classes = (permissions.IsAuthenticatedOrReadOnly,)

    def get_queryset(self):
        user = self.request.user
        queryset = Discussion.objects.all().select_related('author', 'course').annotate(
            annotated_replies_count=Count('replies', distinct=True)
        )

        if user.is_authenticated:
            likes = Discussion.objects.filter(pk=OuterRef('pk'), liked_by=user)
            queryset = queryset.annotate(annotated_is_liked=Exists(likes))
        else:
            queryset = queryset.annotate(annotated_is_liked=Value(False, output_field=BooleanField()))

        # Simple search/filter
        course_id = self.request.query_params.get('course')
        if course_id:
            queryset = queryset.filter(course_id=course_id)
            
        return queryset

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

class DiscussionDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = DiscussionSerializer
    permission_classes = (permissions.IsAuthenticatedOrReadOnly,)
    
    def get_queryset(self):
        user = self.request.user
        
        # Optimize replies prefetch with like status
        replies_qs = DiscussionReply.objects.all().select_related('author')
        if user.is_authenticated:
            reply_likes = DiscussionReply.objects.filter(pk=OuterRef('pk'), liked_by=user)
            replies_qs = replies_qs.annotate(annotated_is_liked=Exists(reply_likes))
        else:
            replies_qs = replies_qs.annotate(annotated_is_liked=Value(False, output_field=BooleanField()))

        queryset = Discussion.objects.all().select_related('author', 'course').prefetch_related(
            Prefetch('replies', queryset=replies_qs)
        ).annotate(
            annotated_replies_count=Count('replies', distinct=True)
        )

        if user.is_authenticated:
            likes = Discussion.objects.filter(pk=OuterRef('pk'), liked_by=user)
            queryset = queryset.annotate(annotated_is_liked=Exists(likes))
        else:
            queryset = queryset.annotate(annotated_is_liked=Value(False, output_field=BooleanField()))
            
        return queryset

    def perform_update(self, serializer):
        discussion = self.get_object()
        if discussion.author != self.request.user:
            if not discussion.course or discussion.course.instructor != self.request.user:
                 raise permissions.exceptions.PermissionDenied("You do not have permission to update this discussion.")
        serializer.save()

class ReplyCreateView(generics.CreateAPIView):
    serializer_class = DiscussionReplySerializer
    permission_classes = (permissions.IsAuthenticated,)

    def perform_create(self, serializer):
        discussion_id = self.kwargs.get('pk')
        try:
            discussion = Discussion.objects.get(pk=discussion_id)
            serializer.save(author=self.request.user, discussion=discussion)
        except Discussion.DoesNotExist:
            return Response({"error": "Discussion not found"}, status=404)

class LikeDiscussionView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request, pk):
        try:
            discussion = Discussion.objects.get(pk=pk)
            if discussion.liked_by.filter(id=request.user.id).exists():
                discussion.liked_by.remove(request.user)
                return Response({'likes_count': discussion.likes_count, 'is_liked': False})
            else:
                discussion.liked_by.add(request.user)
                return Response({'likes_count': discussion.likes_count, 'is_liked': True})
        except Discussion.DoesNotExist:
            return Response({'error': 'Discussion not found'}, status=404)

class LikeReplyView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request, pk):
        try:
            reply = DiscussionReply.objects.get(pk=pk)
            if reply.liked_by.filter(id=request.user.id).exists():
                reply.liked_by.remove(request.user)
                return Response({'likes_count': reply.likes_count, 'is_liked': False})
            else:
                reply.liked_by.add(request.user)
                return Response({'likes_count': reply.likes_count, 'is_liked': True})
        except DiscussionReply.DoesNotExist:
            return Response({'error': 'Reply not found'}, status=404)

class LeaderboardView(generics.ListAPIView):
    queryset = User.objects.all().order_by('-xp_points')[:10]
    serializer_class = UserSerializer
    permission_classes = (permissions.IsAuthenticatedOrReadOnly,)

class ReviewListView(generics.ListCreateAPIView):
    serializer_class = ReviewSerializer
    permission_classes = (permissions.IsAuthenticatedOrReadOnly,)

    def get_queryset(self):
        return Review.objects.filter(course_id=self.kwargs['course_pk'])

    def perform_create(self, serializer):
        try:
            course = Course.objects.get(pk=self.kwargs['course_pk'])
            serializer.save(user=self.request.user, course=course)
        except Course.DoesNotExist:
            return Response({"error": "Course not found"}, status=404)

class ConversationListView(generics.ListCreateAPIView):
    serializer_class = ConversationSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return Conversation.objects.filter(participants=self.request.user).distinct()

    def create(self, request, *args, **kwargs):
        participant_email = request.data.get('email')
        participant_id = request.data.get('user_id')
        
        target_user = None
        if participant_id:
            try:
                target_user = User.objects.get(id=participant_id)
            except User.DoesNotExist:
                pass
        elif participant_email:
             try:
                target_user = User.objects.get(email=participant_email)
             except User.DoesNotExist:
                pass

        if not target_user:
             return Response({"error": "User not found"}, status=404)
        
        if target_user == request.user:
             return Response({"error": "Cannot message yourself"}, status=400)

        conversations = Conversation.objects.filter(participants=request.user).filter(participants=target_user)
        
        if conversations.exists():
            conversation = conversations.first()
            return Response(ConversationSerializer(conversation, context={'request': request}).data)
        
        conversation = Conversation.objects.create()
        conversation.participants.add(request.user, target_user)
        return Response(ConversationSerializer(conversation, context={'request': request}).data, status=201)

class MessageListView(generics.ListCreateAPIView):
    serializer_class = MessageSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        conversation_id = self.kwargs['pk']
        try:
            conversation = Conversation.objects.get(pk=conversation_id)
            if self.request.user not in conversation.participants.all():
                return Message.objects.none()
            return Message.objects.filter(conversation=conversation)
        except Conversation.DoesNotExist:
            return Message.objects.none()

    def perform_create(self, serializer):
        conversation_id = self.kwargs['pk']
        try:
            conversation = Conversation.objects.get(pk=conversation_id)
            if self.request.user not in conversation.participants.all():
                 raise permissions.exceptions.PermissionDenied("You are not a participant in this conversation")
            
            serializer.save(sender=self.request.user, conversation=conversation)
            conversation.save()
            
            for participant in conversation.participants.exclude(id=self.request.user.id):
                 Notification.objects.create(
                     user=participant,
                     type='message',
                     title=f"New message from {self.request.user.username}",
                     description=serializer.validated_data.get('content', '')[:50],
                     link=f"/messages?conversation={conversation.id}"
                 )
        except Conversation.DoesNotExist:
            return Response({"error": "Conversation not found"}, status=404)

class MarkMessagesReadView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request, pk):
        try:
            conversation = Conversation.objects.get(pk=pk)
            if request.user not in conversation.participants.all():
                return Response({"error": "Permission denied"}, status=403)
            
            conversation.messages.filter(is_read=False).exclude(sender=request.user).update(is_read=True)
            return Response({"status": "marked as read"})
        except Conversation.DoesNotExist:
            return Response({"error": "Conversation not found"}, status=404)
