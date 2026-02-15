import os
import django
import json
from django.test import Client

# Setup Django Environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'imra_backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from core.models import Course, Section, Lesson, Quiz, Question, Choice, Enrollment, Membership, Notification

User = get_user_model()

# --- Colors for Output ---
GREEN = '\033[92m'
RED = '\033[91m'
BOLD = '\033[1m'
RESET = '\033[0m'

def print_header(text):
    print(f"\n{BOLD}=== {text} ==={RESET}")

def print_pass(text):
    print(f"{GREEN}[PASS]{RESET} {text}")

def print_fail(text, details=""):
    print(f"{RED}[FAIL]{RESET} {text}")
    if details:
        print(f"       Details: {details}")

class LMSTester:
    def __init__(self):
        self.client = Client()
        self.teacher_token = None
        self.student_token = None
        self.teacher_id = None
        self.student_id = None
        self.course_id = None
        self.lesson_video_id = None
        self.lesson_quiz_id = None
        self.quiz_id = None

    def cleanup(self):
        print_header("Cleaning up old test data")
        User.objects.filter(email__in=['qa_teacher@test.com', 'qa_student@test.com']).delete()
        print("Cleanup complete.")

    def test_auth_flow(self):
        print_header("Testing Authentication Flow")
        
        # 1. Register Teacher
        teacher_data = {
            "username": "qa_teacher",
            "email": "qa_teacher@test.com",
            "password": "password123",
            "role": "teacher"
        }
        res = self.client.post('/api/auth/register/', teacher_data, content_type='application/json', HTTP_HOST='localhost')
        if res.status_code == 201:
            print_pass("Teacher Registration")
            try:
                self.teacher_id = res.json()['id']
            except KeyError:
                print(f"       WARNING: 'id' not in response. Response: {res.json()}")
                # Try to fetch from DB
                self.teacher_id = User.objects.get(username="qa_teacher").id
        else:
            print_fail("Teacher Registration", res.content)

        # 2. Register Student
        student_data = {
            "username": "qa_student",
            "email": "qa_student@test.com",
            "password": "password123",
            "role": "student"
        }
        res = self.client.post('/api/auth/register/', student_data, content_type='application/json', HTTP_HOST='localhost')
        if res.status_code == 201:
            print_pass("Student Registration")
            try:
                self.student_id = res.json()['id']
            except KeyError:
                print(f"       WARNING: 'id' not in response. Response: {res.json()}")
                self.student_id = User.objects.get(username="qa_student").id
        else:
            print_fail("Student Registration", res.content)

        # 3. Login Teacher
        res = self.client.post('/api/token/', {
            "username": "qa_teacher", 
            "password": "password123"
        }, content_type='application/json', HTTP_HOST='localhost')
        
        if res.status_code == 200:
            self.teacher_token = res.json()['access']
            print_pass("Teacher Login")
        else:
            print_fail("Teacher Login", res.content)

        # 4. Login Student
        res = self.client.post('/api/token/', {
            "username": "qa_student", 
            "password": "password123"
        }, content_type='application/json', HTTP_HOST='localhost')
        
        if res.status_code == 200:
            self.student_token = res.json()['access']
            print_pass("Student Login")
        else:
            print_fail("Student Login", res.content)

    def test_course_creation(self):
        print_header("Testing Course Creation (Teacher)")
        if not self.teacher_token:
            print_fail("Skipping Course Creation - No Teacher Token")
            return

        headers = {'HTTP_AUTHORIZATION': f'Bearer {self.teacher_token}', 'HTTP_HOST': 'localhost'}
        
        course_data = {
            "title": "QA Automated Course",
            "description": "A course created by QA automation script",
            "category": "Technology",
            "level": "beginner",
            "price": 49.99,
            "duration_hours": 10,
            "is_published": True,
            "sections": [
                {
                    "title": "Introduction",
                    "order": 1,
                    "lessons": [
                        {
                            "title": "Welcome Video",
                            "lesson_type": "video",
                            "video_url": "http://example.com/video.mp4",
                            "order": 1,
                            "duration": "5:00"
                        },
                        {
                            "title": "Module Quiz",
                            "lesson_type": "quiz",
                            "order": 2,
                            "quiz": {
                                "title": "Intro Quiz",
                                "xp_reward": 50,
                                "questions": [
                                    {
                                        "text": "Is this a test?",
                                        "choices": [
                                            {"text": "Yes", "is_correct": True},
                                            {"text": "No", "is_correct": False}
                                        ]
                                    }
                                ]
                            }
                        }
                    ]
                }
            ]
        }

        # NOTE: Your CourseSerializer setup for nested creation might need logic adjustment
        # Standard DRF nested create requires manual override regarding the nested Quiz structure if not handled.
        # Based on previous analysis, Course->Section->Lesson is handled. 
        # But Lesson->Quiz might NOT be handled in `CourseSerializer.create`.
        # Let's try and see. If it fails, that's a finding.
        
        res = self.client.post('/api/courses/', course_data, content_type='application/json', **headers)
        
        if res.status_code == 201:
            data = res.json()
            self.course_id = data['id']
            print_pass(f"Course Created: {data['title']} (ID: {self.course_id})")
            
            # verify internals
            course = Course.objects.get(id=self.course_id)
            if course.sections.count() == 1:
                print_pass("Section Created")
                section = course.sections.first()
                if section.lessons.count() == 2:
                    print_pass("Lessons Created")
                    lessons = section.lessons.all().order_by('order')
                    self.lesson_video_id = lessons[0].id
                    self.lesson_quiz_id = lessons[1].id
                    
                    # Check Quiz
                    # NOTE: If the serializer didn't handle nested Quiz creation, this will fail or be None
                    # We might need to create Quiz separately in standard usage, OR the serializer handles it.
                    # Looking at `serializers.py` previously, `LessonSerializer` has `quiz`.
                    # But `CourseSerializer.create` logic we saw only iterated sections and lessons. 
                    # It likely didn't dive into Lesson->Quiz creation.
                    if hasattr(lessons[1], 'quiz'):
                        self.quiz_id = lessons[1].quiz.id
                        print_pass("Nested Quiz Created")
                    else:
                        print_fail("Nested Quiz NOT Created automatically (Expected behavior based on serializer analysis)")
                        # Create generic quiz for testing if missing
                        quiz = Quiz.objects.create(lesson=lessons[1], title="Manual Quiz", xp_reward=50)
                        q = Question.objects.create(quiz=quiz, text="Is this a test?")
                        Choice.objects.create(question=q, text="Yes", is_correct=True)
                        Choice.objects.create(question=q, text="No", is_correct=False)
                        self.quiz_id = quiz.id
                        print("       -> Manually created quiz for further testing.")
                else:
                     print_fail(f"Expected 2 lessons, found {section.lessons.count()}")
            else:
                print_fail("Section not created properly")
        else:
            print_fail("Course Creation Failed", res.content)

    def test_enrollment(self):
        print_header("Testing Enrollment (Student)")
        if not self.student_token or not self.course_id:
            print_fail("Skipping Enrollment - Missing Token or Course")
            return

        headers = {'HTTP_AUTHORIZATION': f'Bearer {self.student_token}', 'HTTP_HOST': 'localhost'}
        res = self.client.post(f'/api/courses/{self.course_id}/enroll/', {}, content_type='application/json', **headers)

        if res.status_code in [200, 201]:
            print_pass("Enrollment Successful")
            # Verify DB
            if Enrollment.objects.filter(user_id=self.student_id, course_id=self.course_id).exists():
                 print_pass("Enrollment Record Verified")
            else:
                 print_fail("Enrollment Record NOT found in DB")
        else:
            print_fail("Enrollment Failed", res.content)

    def test_learning_progress(self):
        print_header("Testing Learning Progress")
        headers = {'HTTP_AUTHORIZATION': f'Bearer {self.student_token}', 'HTTP_HOST': 'localhost'}
        
        # 1. Complete Video Lesson
        if self.lesson_video_id:
            res = self.client.post(f'/api/lessons/{self.lesson_video_id}/toggle-completion/', {}, **headers)
            if res.status_code == 200:
                print_pass("Video Lesson Completed")
                if res.json().get('is_completed') == True:
                    print_pass("Progress State Verified (is_completed=True)")
                else:
                    print_fail("Progress State Mismatch")
            else:
                print_fail("Toggle Completion Failed", res.content)

        # 2. Submit Quiz
        if self.quiz_id:
            # Find correct choice
            quiz = Quiz.objects.get(id=self.quiz_id)
            question = quiz.questions.first()
            correct_choice = question.choices.filter(is_correct=True).first()
            
            if not correct_choice:
                print_fail("Quiz Setup Error: No correct choice found")
                return

            answers = {str(question.id): str(correct_choice.id)}
            res = self.client.post(f'/api/quizzes/{self.quiz_id}/submit/', {"answers": answers}, content_type='application/json', **headers)
            
            if res.status_code == 200:
                data = res.json()
                print_pass("Quiz Submitted")
                if data['score'] == 1:
                     print_pass("Score Verification (1/1)")
                else:
                     print_fail(f"Score Incorrect: {data.get('score')}")
                
                if data['newly_completed'] == True:
                     print_pass("Quiz Completion Marked Lesson as Done")
                else:
                     print_fail("Quiz Completion Failed to Mark Lesson Done")
            else:
                 print_fail("Quiz Submission Failed", res.content)

    def test_cleanup(self):
        self.cleanup()

    def run(self):
        try:
            self.cleanup()
            self.test_auth_flow()
            self.test_course_creation()
            self.test_enrollment()
            self.test_learning_progress()
            self.test_cleanup()
        except Exception as e:
            print_fail(f"Test Suite Crashed: {e}")
            import traceback
            traceback.print_exc()

if __name__ == "__main__":
    tester = LMSTester()
    tester.run()
