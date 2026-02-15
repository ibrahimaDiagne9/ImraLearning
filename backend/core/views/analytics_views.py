import datetime
from django.utils import timezone
from django.db.models import Sum, Avg, Count
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import permissions
from ..models import Course, Enrollment, Assignment, QuizAttempt, LessonProgress, Certificate

class AnalyticsView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        if request.user.role != 'teacher':
            return Response({"error": "Only instructors can access analytics"}, status=403)

        courses = Course.objects.filter(instructor=request.user)
        total_students = Enrollment.objects.filter(course__instructor=request.user).values('user').distinct().count()
        total_assignments = Assignment.objects.filter(lesson__section__course__instructor=request.user).count()
        
        gross_revenue = Enrollment.objects.filter(course__instructor=request.user).aggregate(total=Sum('course__price'))['total'] or 0
        net_revenue = float(gross_revenue) * 0.9
        
        enrollments = Enrollment.objects.filter(course__instructor=request.user)
        avg_completion_rate = enrollments.aggregate(avg=Avg('progress'))['avg'] or 0 if enrollments.exists() else 0
        
        last_7_days = []
        for i in range(6, -1, -1):
            date = timezone.now().date() - datetime.timedelta(days=i)
            day_name = date.strftime('%a')
            daily_gross = Enrollment.objects.filter(
                course__instructor=request.user, 
                enrolled_at__date=date
            ).aggregate(total=Sum('course__price'))['total'] or 0
            
            daily_net = float(daily_gross) * 0.9
            
            last_7_days.append({
                "name": day_name,
                "revenue": daily_net,
                "users": Enrollment.objects.filter(course__instructor=request.user, enrolled_at__date=date).count()
            })

        top_courses = []
        courses_query = Course.objects.filter(instructor=request.user).annotate(
            sales=Count('enrollments'),
            revenue=Sum('enrollments__course__price')
        ).order_by('-revenue')[:3]
        
        for course in courses_query:
            top_courses.append({
                "title": course.title,
                "sales": course.sales or 0,
                "revenue": float(course.revenue or 0) * 0.9,
                "growth": "+5%"
            })

        return Response({
            "total_revenue": net_revenue,
            "total_students": total_students,
            "total_assignments": total_assignments,
            "avg_completion_rate": round(float(avg_completion_rate), 1),
            "revenue_data": last_7_days,
            "top_courses": top_courses
        })

class StudentReportView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        user = request.user
        enrollments = Enrollment.objects.filter(user=user).select_related('course')
        course_progress = []
        for enrollment in enrollments:
            course_progress.append({
                "course_id": enrollment.course.id,
                "course_title": enrollment.course.title,
                "progress": enrollment.progress,
                "enrolled_at": enrollment.enrolled_at,
            })
            
        quiz_attempts = QuizAttempt.objects.filter(user=user).select_related('quiz')
        quiz_stats = []
        for attempt in quiz_attempts:
            quiz_stats.append({
                "quiz_id": attempt.quiz.id,
                "quiz_title": attempt.quiz.title,
                "score": attempt.score,
                "total": attempt.total_questions,
                "percentage": (attempt.score / attempt.total_questions * 100) if attempt.total_questions > 0 else 0,
                "date": attempt.completed_at
            })
            
        certificates = Certificate.objects.filter(user=user).select_related('course')
        cert_data = []
        for cert in certificates:
            cert_data.append({
                "id": cert.certificate_id,
                "course_title": cert.course.title,
                "issued_at": cert.issued_at
            })
            
        total_courses = enrollments.count()
        completed_courses = enrollments.filter(progress=100).count()
        avg_quiz_score = sum(q['percentage'] for q in quiz_stats) / len(quiz_stats) if quiz_stats else 0
        
        return Response({
            "summary": {
                "total_courses": total_courses,
                "completed_courses": completed_courses,
                "avg_quiz_score": round(avg_quiz_score, 1),
                "total_certificates": len(cert_data),
                "xp_points": user.xp_points
            },
            "course_progress": course_progress,
            "quiz_performance": quiz_stats,
            "certificates": cert_data
        })

class StudentAnalyticsView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        enrollments = Enrollment.objects.filter(user=request.user)
        enrolled_count = enrollments.count()
        certificates_count = enrollments.filter(progress=100.0).count()
        
        completed_lessons = LessonProgress.objects.filter(user=request.user, is_completed=True).select_related('lesson')
        
        total_minutes = 0
        for progress in completed_lessons:
            duration_str = progress.lesson.duration
            if duration_str and ':' in duration_str:
                try:
                    parts = duration_str.split(':')
                    if len(parts) == 2:
                        total_minutes += int(parts[0]) + int(parts[1]) / 60
                    elif len(parts) == 3:
                        total_minutes += int(parts[0]) * 60 + int(parts[1]) + int(parts[2]) / 60
                except (ValueError, IndexError, TypeError):
                    total_minutes += 10
            else:
                total_minutes += 10
                
        study_hours = total_minutes / 60
        avg_score = QuizAttempt.objects.filter(user=request.user).aggregate(avg=Avg('score'))['avg'] or 0
        total_xp = request.user.xp_points
        
        return Response({
            "enrolled_courses": enrolled_count,
            "certificates": certificates_count,
            "study_hours": round(study_hours, 1),
            "avg_score": round(avg_score, 1),
            "xp": total_xp
        })

class RecentActivityView(APIView):
    permission_classes = (permissions.IsAuthenticated,)
    
    def get(self, request):
        from django.utils.timesince import timesince
        from ..models import DiscussionReply, AssignmentSubmission # Local import due to circularity if any
        
        activity = []
        if request.user.role == 'teacher':
            enrollments = Enrollment.objects.filter(course__instructor=request.user).select_related('user', 'course').order_by('-enrolled_at')[:5]
            for enrollment in enrollments:
                activity.append({
                    "id": f"enroll-{enrollment.id}",
                    "type": "alert",
                    "title": "New Student Enrolled",
                    "description": f"{enrollment.user.username} joined {enrollment.course.title}",
                    "time": enrollment.enrolled_at,
                    "timestamp": enrollment.enrolled_at.timestamp()
                })
                
            attempts = QuizAttempt.objects.filter(quiz__lesson__section__course__instructor=request.user).select_related('user', 'quiz').order_by('-completed_at')[:5]
            for attempt in attempts:
                activity.append({
                    "id": f"attempt-{attempt.id}",
                    "type": "completion",
                    "title": "Quiz Completed",
                    "description": f"{attempt.user.username} scored {attempt.score}/{attempt.total_questions} on {attempt.quiz.title}",
                    "time": attempt.completed_at,
                    "timestamp": attempt.completed_at.timestamp()
                })
        else:
            enrollments = Enrollment.objects.filter(user=request.user).select_related('course').order_by('-enrolled_at')[:5]
            for enrollment in enrollments:
                activity.append({
                    "id": f"enroll-{enrollment.id}",
                    "type": "alert",
                    "title": "Course Started",
                    "description": f"You enrolled in {enrollment.course.title}",
                    "time": enrollment.enrolled_at,
                    "timestamp": enrollment.enrolled_at.timestamp()
                })
            
        activity.sort(key=lambda x: x['timestamp'], reverse=True)
        final_activity = []
        for item in activity[:10]:
            item['time'] = timesince(item['time'], timezone.now()) + " ago"
            del item['timestamp']
            final_activity.append(item)
            
        return Response(final_activity)
