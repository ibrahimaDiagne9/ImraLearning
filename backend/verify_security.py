import os
import sys

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'imra_backend.settings')
import django
django.setup()

from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from core.models import Course, Section, Lesson, Quiz, Question, Choice

User = get_user_model()

def run_tests():
    # 1. Setup
    client = APIClient(SERVER_NAME='localhost')
    
    # Create test users
    admin_user, _ = User.objects.get_or_create(username='admin_test', email='admin@test.com', is_staff=True, is_superuser=True)
    if not admin_user.check_password('testpass'):
        admin_user.set_password('testpass')
        admin_user.save()

    student_user, _ = User.objects.get_or_create(username='student_test', email='student@test.com')
    if not student_user.check_password('testpass'):
        student_user.set_password('testpass')
        student_user.save()

    # Create test course and quiz
    course, _ = Course.objects.get_or_create(title='Security Test Course', instructor=admin_user)
    section, _ = Section.objects.get_or_create(course=course, title='Section 1')
    lesson, _ = Lesson.objects.get_or_create(section=section, title='Test Lesson', lesson_type='video')
    quiz, _ = Quiz.objects.get_or_create(lesson=lesson, title='Test Quiz')
    
    # Output array 
    results = []

    # 2. Test AddXPView
    print("Testing AddXPView...")
    # Admin should succeed
    client.force_authenticate(user=admin_user)
    response_admin = client.post('/api/learning/add-xp/', {'xp': 10, 'reason': 'Test'})
    if response_admin.status_code == 200:
        results.append("[PASS] AddXPView: Admin succeeded (200 OK)")
    else:
        results.append(f"[FAIL] AddXPView: Admin failed ({response_admin.status_code})")

    # Student should fail
    client.force_authenticate(user=student_user)
    response_student = client.post('/api/learning/add-xp/', {'xp': 1000, 'reason': 'Hax'})
    if response_student.status_code in [403, 401]:
        results.append("[PASS] AddXPView: Student forbidden (403 Forbidden)")
    else:
        results.append(f"[FAIL] AddXPView: Student got unexpected status ({response_student.status_code})")

    # 3. Test Quiz Submit w/o Enrollment
    print("Testing SubmitQuizView w/o Enrollment...")
    client.force_authenticate(user=student_user)
    response_quiz = client.post(f'/api/quizzes/{quiz.id}/submit/', {'answers': {}}, format='json')
    if response_quiz.status_code in [403]:
        results.append("[PASS] SubmitQuizView: Unenrolled student forbidden (403 Forbidden)")
    else:
        results.append(f"[FAIL] SubmitQuizView: Unenrolled student got unexpected status ({response_quiz.status_code})")

    # 4. Test Lesson Complete w/o Enrollment
    print("Testing ToggleLessonCompletionView w/o Enrollment...")
    client.force_authenticate(user=student_user)
    response_lesson = client.post(f'/api/lessons/{lesson.id}/toggle-completion/')
    if response_lesson.status_code in [403]:
        results.append("[PASS] ToggleLessonCompletionView: Unenrolled student forbidden (403 Forbidden)")
    else:
        results.append(f"[FAIL] ToggleLessonCompletionView: Unenrolled student got unexpected status ({response_lesson.status_code})")

    print("\n========== TEST RESULTS ==========")
    for res in results:
        print(res)
    print("==================================\n")

if __name__ == '__main__':
    try:
        run_tests()
    except Exception as e:
        print(f"Error running tests: {e}")
