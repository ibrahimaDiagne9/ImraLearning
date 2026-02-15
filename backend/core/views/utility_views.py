from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
import datetime
from ..models import Notification, QuizAttempt, Discussion, Course, Assignment

class NotificationListView(generics.ListAPIView):
    serializer_class = None # Set later or use custom response
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        from ..serializers import NotificationSerializer
        notifications = request.user.notifications.all().order_by('-created_at')
        return Response(NotificationSerializer(notifications, many=True).data)

class MarkNotificationReadView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request, pk):
        try:
            notification = Notification.objects.get(pk=pk, user=request.user)
            notification.is_read = True
            notification.save()
            return Response({'status': 'read'})
        except Notification.DoesNotExist:
            return Response({'error': 'Notification not found'}, status=404)

class MarkAllNotificationsReadView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        request.user.notifications.filter(is_read=False).update(is_read=True)
        return Response({'status': 'all_read'})

class ClearNotificationsView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        request.user.notifications.all().delete()
        return Response({'status': 'cleared'})

class PendingTasksView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        tasks = []
        if request.user.role == 'teacher':
            quiz_attempts_count = QuizAttempt.objects.filter(quiz__lesson__section__course__instructor=request.user).count()
            if quiz_attempts_count > 0:
                 tasks.append({
                    "id": "grading-1",
                    "title": "Review Quiz Attempts",
                    "description": f"{quiz_attempts_count} quiz submissions across your courses",
                    "type": "grading",
                    "urgency": "medium",
                    "time": "Today"
                 })

            unanswered_discussions = Discussion.objects.filter(
                course__instructor=request.user, 
                replies__isnull=True
            ).distinct()
            
            for discussion in unanswered_discussions[:3]:
                if discussion.course:
                    tasks.append({
                        "id": f"community-{discussion.id}",
                        "title": "Unanswered Question",
                        "description": f"New question in {discussion.course.title}",
                        "type": "community",
                        "urgency": "high",
                        "time": discussion.created_at.strftime("%H:%M")
                    })

            empty_courses = Course.objects.filter(instructor=request.user, sections__isnull=True)
            for course in empty_courses:
                 tasks.append({
                    "id": f"setup-{course.id}",
                    "title": "Complete Course Setup",
                    "description": f"Add sections to '{course.title}'",
                    "type": "setup",
                    "urgency": "low",
                    "time": course.created_at.strftime("%b %d")
                })
        else:
            now = timezone.now()
            three_days_later = now + datetime.timedelta(days=3)
            
            upcoming_assignments = Assignment.objects.filter(
                lesson__section__course__enrollments__user=request.user,
                due_date__gte=now,
                due_date__lte=three_days_later
            ).exclude(
                submissions__student=request.user
            ).select_related('lesson__section__course')
            
            for assignment in upcoming_assignments:
                course_title = assignment.lesson.section.course.title if assignment.lesson and assignment.lesson.section and assignment.lesson.section.course else "Unknown Course"
                tasks.append({
                    "id": f"assignment-{assignment.id}",
                    "title": "Upcoming Deadline",
                    "description": f"{assignment.title} is due soon in {course_title}",
                    "type": "grading",
                    "urgency": "high",
                    "time": assignment.due_date.strftime("%b %d")
                })
            
            from ..models import Enrollment
            enrollments = Enrollment.objects.filter(user=request.user, progress__gt=0, progress__lt=100).order_by('-updated_at')[:2]
            for enrollment in enrollments:
                tasks.append({
                    "id": f"continue-{enrollment.id}",
                    "title": "Continue Learning",
                    "description": f"You were last studying {enrollment.course.title}.",
                    "type": "setup",
                    "urgency": "medium",
                    "time": "Active"
                })
            
        return Response(tasks)
