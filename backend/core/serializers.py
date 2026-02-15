from rest_framework import serializers
from django.db.models import Avg, Count
from .models import User, Course, Section, Lesson, Quiz, Question, Choice, Enrollment, Discussion, DiscussionReply, Notification, Resource, QuizAttempt, Membership, Certificate, LiveSession, Review, Assignment, AssignmentSubmission, Order, Conversation, Message

class LiveSessionSerializer(serializers.ModelSerializer):
    instructor_name = serializers.ReadOnlyField(source='instructor.username')
    course_title = serializers.ReadOnlyField(source='course.title')

    class Meta:
        model = LiveSession
        fields = ('id', 'title', 'description', 'instructor', 'instructor_name', 
                  'course', 'course_title', 'is_public', 'is_live', 
                  'scheduled_at', 'started_at', 'ended_at', 'meeting_link', 
                  'attendees_count', 'created_at')
        read_only_fields = ('instructor', 'attendees_count', 'created_at')

class ReviewSerializer(serializers.ModelSerializer):
    user_name = serializers.ReadOnlyField(source='user.username')

    class Meta:
        model = Review
        fields = ('id', 'course', 'user', 'user_name', 'rating', 'comment', 'created_at')
        read_only_fields = ('user', 'created_at')

class MembershipSerializer(serializers.ModelSerializer):
    class Meta:
        model = Membership
        fields = ('tier', 'start_date', 'end_date', 'is_active')

class CertificateSerializer(serializers.ModelSerializer):
    course_title = serializers.ReadOnlyField(source='course.title')
    student_name = serializers.ReadOnlyField(source='user.username')
    
    class Meta:
        model = Certificate
        fields = ('id', 'certificate_id', 'course_title', 'student_name', 'issued_at')

class EnrollmentSerializer(serializers.ModelSerializer):
    course_title = serializers.ReadOnlyField(source='course.title')
    class Meta:
        model = Enrollment
        fields = ('id', 'user', 'course', 'course_title', 'enrolled_at', 'progress')

class NotificationSerializer(serializers.ModelSerializer):
    timestamp = serializers.SerializerMethodField()

    class Meta:
        model = Notification
        fields = ('id', 'type', 'title', 'description', 'link', 'is_read', 'timestamp')

    def get_timestamp(self, obj):
        from django.utils.timesince import timesince
        return timesince(obj.created_at).split(',')[0] + " ago"

class UserSerializer(serializers.ModelSerializer):
    membership = MembershipSerializer(read_only=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'role', 'xp_points', 'avatar', 'bio', 'location', 'timezone', 'date_joined', 'is_pro', 'membership')
        read_only_fields = ('xp_points', 'date_joined')

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'role')

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            role=validated_data.get('role', 'student')
        )
        return user

class ChoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Choice
        fields = ('id', 'text', 'is_correct')

class QuestionSerializer(serializers.ModelSerializer):
    choices = ChoiceSerializer(many=True, required=False)

    class Meta:
        model = Question
        fields = ('id', 'text', 'choices', 'explanation')

class QuizSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, required=False)

    class Meta:
        model = Quiz
        fields = ('id', 'title', 'xp_reward', 'questions')

class ResourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resource
        fields = ('id', 'title', 'file', 'file_type', 'file_size', 'created_at')

class QuizAttemptSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuizAttempt
        fields = ('id', 'user', 'quiz', 'score', 'total_questions', 'completed_at')
        read_only_fields = ('user', 'completed_at')

class LessonSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(required=False)
    is_completed = serializers.BooleanField(source='annotated_is_completed', read_only=True)
    resources = ResourceSerializer(many=True, read_only=True)
    quiz = QuizSerializer(required=False, allow_null=True)
    assignment = serializers.SerializerMethodField()
    submission = serializers.SerializerMethodField()
    
    class Meta:
        model = Lesson
        fields = ('id', 'title', 'lesson_type', 'video_url', 'video_file', 'content', 'summary', 'order', 'duration', 'is_completed', 'is_preview', 'resources', 'quiz', 'assignment', 'submission')
        read_only_fields = ('video_file',)

    def to_representation(self, instance):
        try:
            repr = super().to_representation(instance)
            request = self.context.get('request')
            if not request:
                return repr
                
            user = request.user
            course = instance.section.course
            
            # Check if user is enrolled or is the instructor
            is_enrolled = course.enrollments.filter(user=user).exists() if user.is_authenticated else False
            is_instructor = course.instructor == user if user.is_authenticated else False
            
            if not (is_enrolled or is_instructor):
                # Hide sensitive fields for non-enrolled students
                repr['video_url'] = None
                repr['video_file'] = None
                repr['content'] = ""
                repr['resources'] = []
                repr['quiz'] = None
                repr['assignment'] = None
                
            return repr
        except Exception as e:
            print(f"DEBUG: Error in LessonSerializer.to_representation for lesson {instance.id}: {e}")
            import traceback
            traceback.print_exc()
            return super().to_representation(instance)

    def get_assignment(self, obj):
        if hasattr(obj, 'assignment'):
            return AssignmentSerializer(obj.assignment).data
        return None


    def get_submission(self, obj):
        submission_id = getattr(obj, 'annotated_submission_id', None)
        if submission_id:
            try:
                submission = AssignmentSubmission.objects.get(id=submission_id)
                return AssignmentSubmissionSerializer(submission).data
            except AssignmentSubmission.DoesNotExist:
                pass
        
        # Fallback for unsaved/temp objects or non-annotated views
        user = self.context.get('request').user if 'request' in self.context else None
        if user and user.is_authenticated and hasattr(obj, 'assignment'):
            submission = AssignmentSubmission.objects.filter(
                assignment=obj.assignment, 
                student=user
            ).select_related('student', 'assignment').first() # Optimized query
            if submission:
                return AssignmentSubmissionSerializer(submission).data
        return None

class SectionSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(required=False)
    lessons = LessonSerializer(many=True, required=False)

    class Meta:
        model = Section
        fields = ('id', 'title', 'description', 'order', 'lessons')

class CourseSerializer(serializers.ModelSerializer):
    instructor_name = serializers.ReadOnlyField(source='instructor.username')
    sections = SectionSerializer(many=True, required=False)
    is_enrolled = serializers.BooleanField(source='annotated_is_enrolled', read_only=True)
    average_rating = serializers.FloatField(read_only=True)
    enrollment_count = serializers.IntegerField(read_only=True)
    progress_percentage = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = ('id', 'title', 'slug', 'description', 'short_description', 'category', 'level', 'language', 'thumbnail', 
                  'video_preview_url', 'instructor', 'instructor_name', 'price', 'discount_price', 'duration_hours', 
                  'requirements', 'outcomes', 'is_published', 'is_featured', 'sections', 'is_enrolled', 'progress_percentage', 
                  'enrollment_count', 'average_rating')
        read_only_fields = ('instructor', 'slug')


    def get_progress_percentage(self, obj):
        user = self.context.get('request').user if 'request' in self.context else None
        if not user or not user.is_authenticated:
            return 0
        
        total_lessons = Lesson.objects.filter(section__course=obj).count()
        if total_lessons == 0:
            return 0
        
        from .models import LessonProgress
        completed_lessons = LessonProgress.objects.filter(
            user=user, 
            lesson__section__course=obj, 
            is_completed=True
        ).count()
        
        return int((completed_lessons / total_lessons) * 100)


    def create(self, validated_data):
        sections_data = validated_data.pop('sections', [])
        course = Course.objects.create(**validated_data)
        for section_data in sections_data:
            lessons_data = section_data.pop('lessons', [])
            section_data.pop('id', None)
            section = Section.objects.create(course=course, **section_data)
            for lesson_data in lessons_data:
                lesson_data.pop('id', None)
                # Pop nested quiz data
                quiz_data = lesson_data.pop('quiz', None)
                lesson = Lesson.objects.create(section=section, **lesson_data)
                
                # Handle nested Quiz creation
                if quiz_data:
                    questions_data = quiz_data.pop('questions', [])
                    quiz_data.pop('id', None)
                    quiz = Quiz.objects.create(lesson=lesson, **quiz_data)
                    for question_data in questions_data:
                        choices_data = question_data.pop('choices', [])
                        question_data.pop('id', None)
                        question = Question.objects.create(quiz=quiz, **question_data)
                        for choice_data in choices_data:
                            choice_data.pop('id', None)
                            Choice.objects.create(question=question, **choice_data)

        return course

    def update(self, instance, validated_data):
        sections_data = validated_data.pop('sections', [])
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        existing_sections = {s.id: s for s in instance.sections.all()}
        new_section_ids = []

        for section_data in sections_data:
            section_id = section_data.get('id')
            lessons_data = section_data.pop('lessons', [])
            
            if section_id and str(section_id).isdigit() and int(section_id) in existing_sections:
                section = existing_sections[int(section_id)]
                for attr, value in section_data.items():
                    setattr(section, attr, value)
                section.save()
            else:
                section_data.pop('id', None)
                section = Section.objects.create(course=instance, **section_data)
            
            new_section_ids.append(section.id)

            existing_lessons = {l.id: l for l in section.lessons.all()}
            new_lesson_ids = []

            for lesson_data in lessons_data:
                lesson_id = lesson_data.get('id')
                quiz_data = lesson_data.pop('quiz', None)

                if lesson_id and str(lesson_id).isdigit() and int(lesson_id) in existing_lessons:
                    lesson = existing_lessons[int(lesson_id)]
                    for attr, value in lesson_data.items():
                        setattr(lesson, attr, value)
                    lesson.save()
                else:
                    lesson_data.pop('id', None)
                    lesson = Lesson.objects.create(section=section, **lesson_data)
                
                new_lesson_ids.append(lesson.id)

                # Handle Quiz Update/Creation
                if quiz_data:
                    questions_data = quiz_data.pop('questions', [])
                    quiz_data.pop('id', None) # Remove potential temp ID
                    
                    if hasattr(lesson, 'quiz'):
                        quiz = lesson.quiz
                        for attr, value in quiz_data.items():
                            setattr(quiz, attr, value)
                        quiz.save()
                    else:
                        quiz = Quiz.objects.create(lesson=lesson, **quiz_data)
                    
                    # Simple strategy for questions: Delete all and recreate
                    quiz.questions.all().delete()
                    for question_data in questions_data:
                        choices_data = question_data.pop('choices', [])
                        question_data.pop('id', None) # Remove temp ID
                        question = Question.objects.create(quiz=quiz, **question_data)
                        for choice_data in choices_data:
                            choice_data.pop('id', None) # Remove temp ID
                            Choice.objects.create(question=question, **choice_data)

            section.lessons.exclude(id__in=new_lesson_ids).delete()

        instance.sections.exclude(id__in=new_section_ids).delete()
        return instance


class DiscussionReplySerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    likes_count = serializers.IntegerField(source='liked_by.count', read_only=True)
    is_liked = serializers.BooleanField(source='annotated_is_liked', read_only=True, default=False)

    class Meta:
        model = DiscussionReply
        fields = ('id', 'discussion', 'author', 'content', 'created_at', 'likes_count', 'is_liked')
        read_only_fields = ('discussion', 'author', 'created_at')

class DiscussionSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    replies = DiscussionReplySerializer(many=True, read_only=True)
    replies_count = serializers.IntegerField(source='annotated_replies_count', read_only=True, default=0)
    is_liked = serializers.BooleanField(source='annotated_is_liked', read_only=True, default=False)
    course_name = serializers.CharField(source='course.title', read_only=True, allow_null=True)

    class Meta:
        model = Discussion
        fields = ('id', 'title', 'content', 'author', 'course', 'course_name', 'created_at', 'likes_count', 'is_liked', 'replies', 'replies_count', 'is_resolved')
        read_only_fields = ('author', 'created_at', 'replies')


class AssignmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Assignment
        fields = ('id', 'title', 'instructions', 'total_points', 'due_date')

class AssignmentSubmissionSerializer(serializers.ModelSerializer):
    student_name = serializers.ReadOnlyField(source='student.username')
    
    class Meta:
        model = AssignmentSubmission
        fields = ('id', 'assignment', 'student', 'student_name', 'content', 'file', 'grade', 'feedback', 'submitted_at', 'graded_at')
        read_only_fields = ('student', 'submitted_at')

    def __str__(self):
        return f"{self.student.username} - {self.assignment.title}"

class OrderSerializer(serializers.ModelSerializer):
    course_title = serializers.ReadOnlyField(source='course.title')

    class Meta:
        model = Order
        fields = ('id', 'user', 'course', 'course_title', 'amount', 'status', 'created_at')
        read_only_fields = ('user', 'created_at', 'status')

    def __str__(self):
        return f"Order {self.id} - {self.user.username} - {self.status}"

class MessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.ReadOnlyField(source='sender.username')
    sender_avatar = serializers.SerializerMethodField()
    is_me = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = ('id', 'sender', 'sender_name', 'sender_avatar', 'content', 'created_at', 'is_read', 'is_me')
        read_only_fields = ('sender', 'created_at', 'is_read')

    def get_sender_avatar(self, obj):
        if obj.sender.avatar:
            return obj.sender.avatar.url
        return None

    def get_is_me(self, obj):
        request = self.context.get('request')
        if request and request.user:
            return obj.sender == request.user
        return False

class ConversationSerializer(serializers.ModelSerializer):
    participant_name = serializers.SerializerMethodField()
    participant_avatar = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()
    last_message_time = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = ('id', 'participants', 'participant_name', 'participant_avatar', 'last_message', 'last_message_time', 'unread_count', 'updated_at')
        read_only_fields = ('participants', 'updated_at')

    def get_participant_name(self, obj):
        request = self.context.get('request')
        if request and request.user:
            other_user = obj.participants.exclude(id=request.user.id).first()
            if other_user:
                return other_user.username
        return "Unknown"

    def get_participant_avatar(self, obj):
        request = self.context.get('request')
        if request and request.user:
            other_user = obj.participants.exclude(id=request.user.id).first()
            if other_user and other_user.avatar:
                return other_user.avatar.url
        return None

    def get_last_message(self, obj):
        last_msg = obj.messages.first() # Ordered by -created_at in model? No, model is created_at asc.
        # Wait, Message model ordering is ['created_at'], so .last() or .order_by('-created_at').first()
        last_msg = obj.messages.order_by('-created_at').first()
        return last_msg.content if last_msg else ""

    def get_last_message_time(self, obj):
        last_msg = obj.messages.order_by('-created_at').first()
        if last_msg:
            from django.utils.timesince import timesince
            return timesince(last_msg.created_at).split(',')[0] + " ago"
        return ""

    def get_unread_count(self, obj):
        request = self.context.get('request')
        if request and request.user:
            return obj.messages.filter(is_read=False).exclude(sender=request.user).count()
        return 0
