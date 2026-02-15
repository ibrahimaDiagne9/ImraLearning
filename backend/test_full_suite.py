import os
import django
import json
import requests
from django.test import Client
from django.contrib.auth import get_user_model

# Setup Django Environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'imra_backend.settings')
django.setup()

from core.models import Course, Section, Lesson, Quiz, Question, Choice, Enrollment, Membership, Notification, Assignment, AssignmentSubmission, Order

User = get_user_model()

# --- Colors for Output ---
GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
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

def print_warning(text):
    print(f"{YELLOW}[WARNING]{RESET} {text}")

class LMSFullSuiteTester:
    def __init__(self):
        self.client = Client()
        self.teacher_token = None
        self.student_token = None
        self.teacher_id = None
        self.student_id = None
        self.course_id = None
        self.lesson_video_id = None
        self.lesson_assignment_id = None
        self.assignment_id = None
        self.quiz_id = None
        self.order_id = None

    def cleanup(self):
        print_header("Cleaning up old test data")
        User.objects.filter(email__in=['qa_teacher_full@test.com', 'qa_student_full@test.com']).delete()
        print("Cleanup complete.")

    def test_auth_flow(self):
        print_header("1. Testing Authentication Flow")
        
        # 1. Register Teacher
        teacher_data = {
            "username": "qa_teacher_full",
            "email": "qa_teacher_full@test.com",
            "password": "password123",
            "role": "teacher"
        }
        res = self.client.post('/api/auth/register/', teacher_data, content_type='application/json', HTTP_HOST='localhost')
        if res.status_code == 201:
            print_pass("Teacher Registration")
            self.teacher_id = res.json().get('id', User.objects.get(username="qa_teacher_full").id)
        else:
            print_fail("Teacher Registration", res.content)

        # 2. Register Student
        student_data = {
            "username": "qa_student_full",
            "email": "qa_student_full@test.com",
            "password": "password123",
            "role": "student"
        }
        res = self.client.post('/api/auth/register/', student_data, content_type='application/json', HTTP_HOST='localhost')
        if res.status_code == 201:
            print_pass("Student Registration")
            self.student_id = res.json().get('id', User.objects.get(username="qa_student_full").id)
        else:
            print_fail("Student Registration", res.content)

        # 3. Login Teacher
        res = self.client.post('/api/token/', {
            "username": "qa_teacher_full", 
            "password": "password123"
        }, content_type='application/json', HTTP_HOST='localhost')
        
        if res.status_code == 200:
            self.teacher_token = res.json()['access']
            print_pass("Teacher Login")
        else:
            print_fail("Teacher Login", res.content)

        # 4. Login Student
        res = self.client.post('/api/token/', {
            "username": "qa_student_full", 
            "password": "password123"
        }, content_type='application/json', HTTP_HOST='localhost')
        
        if res.status_code == 200:
            self.student_token = res.json()['access']
            print_pass("Student Login")
        else:
            print_fail("Student Login", res.content)

    def test_course_management(self):
        print_header("2. Testing Course Management")
        if not self.teacher_token:
            print_fail("Skipping - No Teacher Token")
            return

        headers = {'HTTP_AUTHORIZATION': f'Bearer {self.teacher_token}', 'HTTP_HOST': 'localhost'}
        
        # Course Data
        course_data = {
            "title": "Full Suite Test Course",
            "description": "Comprehensive test course",
            "category": "Testing",
            "level": "intermediate",
            "price": 99.99,
            "duration_hours": 5,
            "is_published": True,
            "sections": [
                {
                    "title": "Module 1",
                    "order": 1,
                    "lessons": [
                        {
                            "title": "Intro Video",
                            "lesson_type": "video",
                            "video_url": "http://example.com/video.mp4",
                            "order": 1,
                            "duration": "10:00"
                        },
                        {
                            "title": "Module Quiz",
                            "lesson_type": "quiz",
                            "order": 2,
                            "quiz": {
                                "title": "Test Quiz",
                                "xp_reward": 100,
                                "questions": [
                                    {
                                        "text": "Is this working?",
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

        res = self.client.post('/api/courses/', course_data, content_type='application/json', **headers)
        
        if res.status_code == 201:
            data = res.json()
            self.course_id = data['id']
            print_pass(f"Course Created: {data['title']}")
            
            # Verify Structure
            course = Course.objects.get(id=self.course_id)
            if course.sections.count() > 0:
                print_pass("Sections Created")
                lessons = course.sections.first().lessons.all()
                if lessons.count() == 2:
                    print_pass("Lessons Created")
                    self.lesson_video_id = lessons[0].id
                    # Check for nested quiz creation
                    if hasattr(lessons[1], 'quiz'):
                        self.quiz_id = lessons[1].quiz.id
                        print_pass("Nested Quiz Created")
                    else:
                        print_fail("Nested Quiz Creation Failed (Known Issue)")
                        # Manual fix for test continuity
                        quiz = Quiz.objects.create(lesson=lessons[1], title="Manual Quiz")
                        q = Question.objects.create(quiz=quiz, text="Is this working?")
                        Choice.objects.create(question=q, text="Yes", is_correct=True)
                        Choice.objects.create(question=q, text="No", is_correct=False)
                        self.quiz_id = quiz.id
                else:
                    print_fail("Lesson Count Mismatch")
            else:
                print_fail("Section Creation Failed")
        else:
            print_fail("Course Creation Failed", res.content)

        # Test Assignments Creation
        print("\n--- Create Assignment Lesson ---")
        assignment_lesson_data = {
            "title": "Homework 1",
            "lesson_type": "assignment", 
            "order": 3
        }
        
        if self.course_id:
            section_id = Course.objects.get(id=self.course_id).sections.first().id
            assignment_lesson_data['section'] = section_id
            
            res = self.client.post('/api/lessons/', assignment_lesson_data, content_type='application/json', **headers)
            if res.status_code == 201:
                self.lesson_assignment_id = res.json()['id']
                print_pass("Assignment Lesson Created")
                
                # Now create the Assignment details
                assignment_details = {
                    "title": "Build a React App",
                    "instructions": "Create a todo list app.",
                    "total_points": 50,
                    "due_date": "2026-12-31T23:59:59Z"
                }
                res_assign = self.client.post(f'/api/lessons/{self.lesson_assignment_id}/assignment/', assignment_details, content_type='application/json', **headers)
                if res_assign.status_code == 201:
                    self.assignment_id = res_assign.json()['id']
                    print_pass("Assignment Details Added")
                else:
                    print_fail("Assignment Details Creation Failed", res_assign.content)
            else:
                print_fail(f"Assignment Lesson Creation Failed: {res.status_code} - {res.content}")

    def test_payments(self):
        print_header("3. Testing Payments")
        student_headers = {'HTTP_AUTHORIZATION': f'Bearer {self.student_token}', 'HTTP_HOST': 'localhost'}

        # 1. Create Payment Intent (Mock)
        res = self.client.post('/api/payments/create-intent/', {"course_id": self.course_id}, content_type='application/json', **student_headers)
        if res.status_code == 200:
            data = res.json()
            self.order_id = data['order_id']
            print_pass("Payment Intent Created")
        else:
            print_fail("Payment Intent Failed", res.content)
            return

        # 2. Confirm Payment
        res = self.client.post('/api/payments/confirm/', {"order_id": self.order_id, "transaction_id": "tx_test_123"}, content_type='application/json', **student_headers)
        if res.status_code == 200:
            print_pass("Payment Confirmed")
        else:
            print_fail("Payment Confirmation Failed", res.content)

        # 3. Verify Enrollment
        if Enrollment.objects.filter(user_id=self.student_id, course_id=self.course_id).exists():
             print_pass("Enrollment Verification (via Payment)")
        else:
             print_fail("Enrollment Missing after Payment")

    def test_assessments(self):
        print_header("4. Testing Assessments")
        student_headers = {'HTTP_AUTHORIZATION': f'Bearer {self.student_token}', 'HTTP_HOST': 'localhost'}
        teacher_headers = {'HTTP_AUTHORIZATION': f'Bearer {self.teacher_token}', 'HTTP_HOST': 'localhost'}

        # 1. Quiz Submission
        if self.quiz_id:
            quiz = Quiz.objects.get(id=self.quiz_id)
            question = quiz.questions.first()
            if question:
                correct_choice = question.choices.filter(is_correct=True).first()
                if correct_choice:
                    answers = {str(question.id): str(correct_choice.id)}
                    res = self.client.post(f'/api/quizzes/{self.quiz_id}/submit/', {"answers": answers}, content_type='application/json', **student_headers)
                    if res.status_code == 200:
                        print_pass("Quiz Submission")
                    else:
                        print_fail("Quiz Submission", res.content)
                else:
                    print_fail("Quiz Setup Error - No Correct Choice")
            else:
                print_fail("Quiz Setup Error - No Questions")
        else:
            print_fail("Skipping Quiz - No Quiz ID")

        # 2. Assignment Submission
        print("\n--- Testing Assignment Flow ---")
        if self.assignment_id:
            # Student Submit
            submission_data = {"content": "Here is my React app link: github.com/..."}
            res = self.client.post(f'/api/assignments/{self.assignment_id}/submit/', submission_data, content_type='application/json', **student_headers)
            if res.status_code == 200:
                submission_id = res.json()['id']
                print_pass("Assignment Submitted")
                
                # Teacher Grade
                grade_data = {"grade": 48, "feedback": "Great work!"}
                res_grade = self.client.post(f'/api/submissions/{submission_id}/grade/', grade_data, content_type='application/json', **teacher_headers)
                if res_grade.status_code == 200:
                    print_pass("Assignment Graded")
                else:
                    print_fail("Assignment Grading Failed", res_grade.content)
            else:
                print_fail("Assignment Submission Failed", res.content)
        else:
            print_fail("Skipping Assignment Test - No Assignment ID")

    def run(self):
        try:
            self.cleanup()
            self.test_auth_flow()
            self.test_course_management()
            # Enrollment is done via payment test now
            self.test_payments()
            self.test_assessments()
            self.cleanup()
        except Exception as e:
            print_fail(f"Test Suite EXCEPTION: {e}")
            import traceback
            traceback.print_exc()

if __name__ == "__main__":
    tester = LMSFullSuiteTester()
    tester.run()
