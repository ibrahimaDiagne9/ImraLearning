from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from ..models import (
    Course, Lesson, Enrollment, LessonProgress, Quiz, 
    QuizAttempt, Certificate, Assignment, AssignmentSubmission, Notification, Choice
)
from ..serializers import (
    EnrollmentSerializer, QuizAttemptSerializer, 
    CertificateSerializer, AssignmentSerializer, AssignmentSubmissionSerializer
)

class EnrollView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request, pk):
        try:
            course = Course.objects.get(pk=pk)
            enrollment, created = Enrollment.objects.get_or_create(user=request.user, course=course)
            if created:
                return Response({"message": "Successfully enrolled"}, status=201)
            return Response({"message": "Already enrolled"}, status=200)
        except Course.DoesNotExist:
            return Response({"error": "Course not found"}, status=404)

class ToggleLessonCompletionView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request, pk):
        try:
            lesson = Lesson.objects.get(pk=pk)
            progress, created = LessonProgress.objects.get_or_create(
                user=request.user,
                lesson=lesson
            )
            
            progress.is_completed = not progress.is_completed
            progress.save()

            if progress.is_completed:
                request.user.xp_points += 50
                request.user.save()

            return Response({
                'is_completed': progress.is_completed,
                'xp': request.user.xp_points
            })
        except Lesson.DoesNotExist:
            return Response({'error': 'Lesson not found'}, status=404)

class SubmitQuizView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request, pk):
        try:
            quiz = Quiz.objects.get(pk=pk)
            answers = request.data.get('answers', {})
            
            correct_count = 0
            questions = quiz.questions.all()
            total_questions = questions.count()
            
            if total_questions == 0:
                return Response({"error": "This quiz has no questions."}, status=status.HTTP_400_BAD_REQUEST)

            # Optimization: Fetch all correct choices in one query instead of N+1
            correct_choices = Choice.objects.filter(
                question__quiz=quiz, 
                is_correct=True
            ).values_list('question_id', 'id')
            
            correct_map = {str(qid): str(cid) for qid, cid in correct_choices}
            
            for q_id, selected_choice_id in answers.items():
                if correct_map.get(str(q_id)) == str(selected_choice_id):
                    correct_count += 1
            
            QuizAttempt.objects.create(
                user=request.user,
                quiz=quiz,
                score=correct_count,
                total_questions=total_questions
            )
            
            progress, created = LessonProgress.objects.get_or_create(
                user=request.user,
                lesson=quiz.lesson
            )
            
            xp_rewarded = 0
            newly_completed = False
            
            # Defensive check: Avoid division by zero if total_questions is 0
            if total_questions > 0 and not progress.is_completed and (correct_count / total_questions) >= 0.6:
                progress.is_completed = True
                progress.save()
                xp_rewarded = quiz.xp_reward
                request.user.xp_points += xp_rewarded
                request.user.save()
                newly_completed = True

            return Response({
                "score": correct_count,
                "total_questions": total_questions,
                "xp_rewarded": xp_rewarded,
                "newly_completed": newly_completed,
                "message": "Quiz submitted successfully"
            })
            
        except Quiz.DoesNotExist:
            return Response({"error": "Quiz not found"}, status=404)

class AddXPView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        xp = request.data.get('xp', 0)
        try:
            xp_amount = int(xp)
        except (ValueError, TypeError):
            return Response({'error': 'Invalid XP amount'}, status=400)

        MAX_XP_REWARD = 100 
        if xp_amount > MAX_XP_REWARD:
             xp_amount = MAX_XP_REWARD
        
        if xp_amount < 0:
            return Response({'error': 'XP cannot be negative'}, status=400)

        user = request.user
        user.xp_points += xp_amount
        user.save()
        return Response({'xp_points': user.xp_points}, status=200)

class CertificateListView(generics.ListAPIView):
    serializer_class = CertificateSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return Certificate.objects.filter(user=self.request.user)

class CertificateDetailView(generics.RetrieveAPIView):
    serializer_class = CertificateSerializer
    permission_classes = (permissions.IsAuthenticated,)
    lookup_field = 'certificate_id'

    def get_queryset(self):
        return Certificate.objects.all()

class AssignmentCreateView(generics.CreateAPIView):
    serializer_class = AssignmentSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def perform_create(self, serializer):
        lesson_id = self.kwargs.get('lesson_pk')
        try:
            lesson = Lesson.objects.get(pk=lesson_id)
            if lesson.section.course.instructor != self.request.user:
                raise permissions.exceptions.PermissionDenied("You are not the instructor of this course.")
            lesson.lesson_type = 'assignment'
            lesson.save()
            serializer.save(lesson=lesson)
        except Lesson.DoesNotExist:
            return Response({"error": "Lesson not found"}, status=404)

class SubmissionListView(generics.ListAPIView):
    serializer_class = AssignmentSubmissionSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return AssignmentSubmission.objects.filter(
            assignment__lesson__section__course__instructor=self.request.user
        ).select_related(
            'student', 
            'assignment__lesson',
            'assignment__lesson__section__course'
        ).order_by('-submitted_at')

class SubmitAssignmentView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request, pk):
        try:
            assignment = Assignment.objects.get(pk=pk)
            if not Enrollment.objects.filter(user=request.user, course=assignment.lesson.section.course).exists():
                 return Response({"error": "You must be enrolled to submit assignments"}, status=403)
            
            submission, created = AssignmentSubmission.objects.get_or_create(
                assignment=assignment,
                student=request.user
            )
            
            serializer = AssignmentSubmissionSerializer(submission, data=request.data, partial=True)
            if serializer.is_valid():
                from django.utils import timezone
                serializer.save(submitted_at=timezone.now())
                
                progress, _ = LessonProgress.objects.get_or_create(user=request.user, lesson=assignment.lesson)
                progress.is_completed = True
                progress.save()
                
                return Response(serializer.data)
            return Response(serializer.errors, status=400)
        except Assignment.DoesNotExist:
            return Response({"error": "Assignment not found"}, status=404)

class GradeAssignmentView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request, pk):
        try:
            submission = AssignmentSubmission.objects.get(pk=pk)
            if submission.assignment.lesson.section.course.instructor != request.user:
                 return Response({"error": "Only the instructor can grade this assignment"}, status=403)
            
            grade = request.data.get('grade')
            feedback = request.data.get('feedback')
            
            if grade is not None:
                submission.grade = grade
            if feedback:
                submission.feedback = feedback
                
            from django.utils import timezone
            submission.graded_at = timezone.now()
            submission.save()
            
            Notification.objects.create(
                user=submission.student,
                type='grade',
                title=f"Assignment Graded: {submission.assignment.title}",
                description=f"You received a grade of {submission.grade}/{submission.assignment.total_points}",
                link=f"/learn/{submission.assignment.lesson.section.course.id}"
            )
            
            return Response(AssignmentSubmissionSerializer(submission).data)
        except AssignmentSubmission.DoesNotExist:
             return Response({"error": "Submission not found"}, status=404)
