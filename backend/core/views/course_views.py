from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Q, Count, Avg, Exists, OuterRef, Value, BooleanField, Prefetch, Subquery, IntegerField
from ..models import Course, Lesson, Section, Enrollment, Notification, User, Resource, Review, LessonProgress, AssignmentSubmission
from ..serializers import CourseSerializer, LessonSerializer, UserSerializer, ResourceSerializer
from ..permissions import IsInstructorOrReadOnly

class CourseListView(generics.ListCreateAPIView):
    serializer_class = CourseSerializer
    permission_classes = (permissions.IsAuthenticatedOrReadOnly,)

    def get_queryset(self):
        user = self.request.user
        
        # Base queryset with efficient related lookups
        queryset = Course.objects.all().select_related('instructor').prefetch_related(
            'sections__lessons'
        )

        # Optimization: Move expensive calculations to DB level
        queryset = queryset.annotate(
            enrollment_count=Count('enrollments', distinct=True),
            average_rating=Avg('reviews__rating')
        )

        # Optimization: is_enrolled Exists subquery
        if user.is_authenticated:
            enrollments = Enrollment.objects.filter(user=user, course=OuterRef('pk'))
            queryset = queryset.annotate(annotated_is_enrolled=Exists(enrollments))
        else:
            queryset = queryset.annotate(annotated_is_enrolled=Value(False, output_field=BooleanField()))

        # Filtering
        search = self.request.query_params.get('search')
        category = self.request.query_params.get('category')
        level = self.request.query_params.get('level')
        is_featured = self.request.query_params.get('is_featured')
        instructor = self.request.query_params.get('instructor')

        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) | 
                Q(description__icontains=search) |
                Q(instructor__username__icontains=search)
            )
        
        if category:
            queryset = queryset.filter(category__iexact=category)
        
        if level:
            queryset = queryset.filter(level__iexact=level)

        if is_featured:
            queryset = queryset.filter(is_featured=(is_featured.lower() == 'true'))
            
        if instructor:
            queryset = queryset.filter(instructor_id=instructor)

        # Enrolled filter
        if self.request.query_params.get('enrolled') and user.is_authenticated:
            queryset = queryset.filter(enrollments__user=user)

        # Published only for students or anonymous users
        is_student = getattr(user, 'role', None) == 'student'
        if not user.is_authenticated or is_student:
            if user.is_authenticated:
                queryset = queryset.filter(Q(is_published=True) | Q(enrollments__user=user)).distinct()
            else:
                queryset = queryset.filter(is_published=True)

        # Ordering
        ordering = self.request.query_params.get('ordering', '-created_at')
        if ordering == 'trending':
            queryset = queryset.order_by('-enrollment_count')
        elif ordering:
            queryset = queryset.order_by(ordering)
            
        return queryset

    def perform_create(self, serializer):
        serializer.save(instructor=self.request.user)

class CourseDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CourseSerializer
    permission_classes = (IsInstructorOrReadOnly,)
    lookup_field = 'pk'

    def get_queryset(self):
        user = self.request.user
        
        # Optimize Lesson queryset for prefetching
        lessons_qs = Lesson.objects.all().select_related('quiz', 'assignment')
        
        if user.is_authenticated:
            # Annotate completion and submissions per user
            progress = LessonProgress.objects.filter(user=user, lesson=OuterRef('pk'), is_completed=True)
            submissions = AssignmentSubmission.objects.filter(student=user, assignment__lesson=OuterRef('pk'))
            lessons_qs = lessons_qs.annotate(
                annotated_is_completed=Exists(progress),
                annotated_submission_id=Subquery(submissions.values('id')[:1])
            )
        else:
            lessons_qs = lessons_qs.annotate(
                annotated_is_completed=Value(False, output_field=BooleanField()),
                annotated_submission_id=Value(None, output_field=IntegerField(null=True))
            )

        queryset = Course.objects.all().select_related('instructor').prefetch_related(
            Prefetch('sections__lessons', queryset=lessons_qs),
            'sections__lessons__resources',
            'sections__lessons__quiz__questions__choices',
            'enrollments',
            'reviews__user'
        ).annotate(
            enrollment_count=Count('enrollments', distinct=True),
            average_rating=Avg('reviews__rating')
        )

        if user.is_authenticated:
            enrollments = Enrollment.objects.filter(user=user, course=OuterRef('pk'))
            queryset = queryset.annotate(annotated_is_enrolled=Exists(enrollments))
        else:
            queryset = queryset.annotate(annotated_is_enrolled=Value(False, output_field=BooleanField()))
            
        return queryset

class LessonCreateView(generics.CreateAPIView):
    queryset = Lesson.objects.all()
    serializer_class = LessonSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def perform_create(self, serializer):
        section_id = self.request.data.get('section')
        if not section_id:
             return Response({"error": "Section ID is required"}, status=400)
        try:
            section = Section.objects.get(pk=section_id)
            if section.course.instructor != self.request.user:
                 raise permissions.exceptions.PermissionDenied("You are not the instructor of this course")
            serializer.save(section=section)
        except Section.DoesNotExist:
             return Response({"error": "Section not found"}, status=404)

class LessonVideoUploadView(APIView):
    permission_classes = (permissions.IsAuthenticated,)
    
    def post(self, request, pk):
        try:
            lesson = Lesson.objects.get(pk=pk)
            if lesson.section.course.instructor != request.user:
                return Response({"error": "Permission denied"}, status=403)
            
            video_file = request.FILES.get('video_file')
            if not video_file:
                return Response({"error": "No file uploaded"}, status=400)
            
            lesson.video_file = video_file
            lesson.lesson_type = 'video'
            lesson.save()
            return Response({"video_url": lesson.video_file.url, "message": "Video uploaded successfully"})
        except Lesson.DoesNotExist:
            return Response({"error": "Lesson not found"}, status=404)

class ResourceCreateView(generics.CreateAPIView):
    serializer_class = ResourceSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def perform_create(self, serializer):
        lesson_id = self.kwargs.get('lesson_pk')
        try:
            lesson = Lesson.objects.get(pk=lesson_id)
            if lesson.section.course.instructor != self.request.user:
                raise permissions.exceptions.PermissionDenied("You are not the instructor of this course.")
            serializer.save(lesson=lesson)
        except Lesson.DoesNotExist:
            return Response({"error": "Lesson not found"}, status=404)

class ResourceDeleteView(generics.DestroyAPIView):
    queryset = Resource.objects.all()
    permission_classes = (permissions.IsAuthenticated,)

    def get_object(self):
        obj = super().get_object()
        if obj.lesson.section.course.instructor != self.request.user:
            raise permissions.exceptions.PermissionDenied("You are not the instructor of this course.")
        return obj

class InvitationView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        if request.user.role != 'teacher':
            return Response({"error": "Only instructors can invite students"}, status=403)
            
        email = request.data.get('email')
        course_id = request.data.get('course_id')

        if not email or not course_id:
            return Response({"error": "Missing required fields"}, status=400)

        try:
            course = Course.objects.get(pk=course_id, instructor=request.user)
            student, created = User.objects.get_or_create(
                email=email,
                defaults={'username': email.split('@')[0], 'role': 'student'}
            )
            
            Enrollment.objects.get_or_create(user=student, course=course)
            
            Notification.objects.create(
                user=student,
                type='course',
                title=f"Invited to {course.title}",
                description=f"You have been invited to join {course.title} by {request.user.username}.",
                link=f"/learn/{course.id}"
            )

            return Response({
                "message": "Invitation sent successfully",
                "student": UserSerializer(student).data
            }, status=201)
            
        except Course.DoesNotExist:
            return Response({"error": "Course not found or permission denied"}, status=404)
        except Exception as e:
            return Response({"error": str(e)}, status=500)
