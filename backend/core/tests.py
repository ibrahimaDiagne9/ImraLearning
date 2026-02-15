from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from core.models import Course, Section, Lesson, Quiz, Question, Choice, Enrollment, Assignment, AssignmentSubmission, Order

User = get_user_model()

class LMSFullSuiteTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.teacher_data = {
            "username": "qa_teacher",
            "email": "qa_teacher@test.com",
            "password": "password123",
            "role": "teacher"
        }
        self.student_data = {
            "username": "qa_student",
            "email": "qa_student@test.com",
            "password": "password123",
            "role": "student"
        }
        self.teacher = User.objects.create_user(**self.teacher_data)
        self.student = User.objects.create_user(**self.student_data)

    def test_auth_flow(self):
        # 1. Login Teacher
        res = self.client.post('/api/token/', {
            "username": "qa_teacher", 
            "password": "password123"
        })
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn('access', res.data)
        teacher_token = res.data['access']

        # 2. Login Student
        res = self.client.post('/api/token/', {
            "username": "qa_student", 
            "password": "password123"
        })
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn('access', res.data)

    def test_course_management_and_quiz(self):
        self.client.force_authenticate(user=self.teacher)
        
        # Course Data with Nested Quiz
        course_data = {
            "title": "Full Suite Test Course",
            "description": "Comprehensive test course",
            "category": "Testing",
            "level": "intermediate",
            "price": "99.99",
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

        res = self.client.post('/api/courses/', course_data, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        course_id = res.data['id']
        
        # Verify Structure
        course = Course.objects.get(id=course_id)
        self.assertEqual(course.sections.count(), 1)
        lessons = course.sections.first().lessons.all()
        self.assertEqual(lessons.count(), 2)
        
        # Verify Quiz
        quiz_lesson = lessons[1]
        self.assertTrue(hasattr(quiz_lesson, 'quiz'))
        self.assertEqual(quiz_lesson.quiz.title, "Test Quiz")
        self.assertEqual(quiz_lesson.quiz.questions.count(), 1)
        self.assertEqual(quiz_lesson.quiz.questions.first().choices.count(), 2)

    def test_assignment_flow(self):
        self.client.force_authenticate(user=self.teacher)
        
        # Create Course
        course = Course.objects.create(
            title="Assignment Course", 
            instructor=self.teacher, 
            price=0, 
            is_published=True
        )
        section = Section.objects.create(course=course, title="S1")
        lesson = Lesson.objects.create(section=section, title="L1", lesson_type="assignment")
        
        # Create Assignment Details
        assignment_data = {
            "title": "Build a React App",
            "instructions": "Create a todo list app.",
            "total_points": 50,
            "due_date": "2026-12-31T23:59:59Z"
        }
        res = self.client.post(f'/api/lessons/{lesson.id}/assignment/', assignment_data, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        assignment_id = res.data['id']

        # Student Submit
        self.client.force_authenticate(user=self.student)
        # Enroll first (free course)
        Enrollment.objects.create(user=self.student, course=course)
        
        submission_data = {"content": "Here is my React app link: github.com/..."}
        res = self.client.post(f'/api/assignments/{assignment_id}/submit/', submission_data, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        submission_id = res.data['id']

        # Teacher Grade
        self.client.force_authenticate(user=self.teacher)
        grade_data = {"grade": 48, "feedback": "Great work!"}
        res = self.client.post(f'/api/submissions/{submission_id}/grade/', grade_data, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        
        submission = AssignmentSubmission.objects.get(id=submission_id)
        self.assertEqual(submission.grade, 48)

    def test_payment_and_enrollment(self):
        self.client.force_authenticate(user=self.student)
        course = Course.objects.create(title="Paid Course", instructor=self.teacher, price=50.00, is_published=True)
        
        # Create Payment Intent
        res = self.client.post('/api/payments/create-intent/', {"course_id": course.id}, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        order_id = res.data['order_id']
        
        # Confirm Payment
        res = self.client.post('/api/payments/confirm/', {"order_id": order_id, "transaction_id": "tx_test_123"}, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        
        # Verify Enrollment
        self.assertTrue(Enrollment.objects.filter(user=self.student, course=course).exists())
