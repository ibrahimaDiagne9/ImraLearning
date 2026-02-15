
import os
import django
import sys
import json

# Setup Django environment
sys.path.append(os.path.join(os.getcwd(), 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'imra_backend.settings')
django.setup()

from core.models import User, Course, Section, Lesson, Enrollment
from core.serializers import CourseSerializer, LessonSerializer
from rest_framework.test import APIRequestFactory, force_authenticate
from core.views import EnrollView, CourseDetailView

def verify_full_flow():
    print("Starting Full Enrollment & Content Verification Flow...")
    factory = APIRequestFactory()

    # 1. Create Fresh Student
    student, created = User.objects.get_or_create(username='debug_student', defaults={
        'email': 'debug_student@example.com',
        'role': 'student'
    })
    if created:
        student.set_password('testpass123')
        student.save()
        print(f"Created student: {student.username}")
    else:
        print(f"Using existing student: {student.username}")

    # 2. Create Fresh Course with Content
    instructor, _ = User.objects.get_or_create(username='debug_instructor', role='teacher')
    course, created = Course.objects.get_or_create(title="Debug Content Course", defaults={
        'instructor': instructor,
        'price': 0,
        'is_published': True
    })
    
    # Ensure sections and lessons exist
    section, _ = Section.objects.get_or_create(course=course, title="Debug Section")
    
    # Lesson 1: With Video URL
    lesson_video, _ = Lesson.objects.get_or_create(section=section, title="Video Lesson", defaults={
        'lesson_type': 'video',
        'video_url': 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        'content': 'Video description content'
    })

    # Lesson 2: Text Only
    lesson_text, _ = Lesson.objects.get_or_create(section=section, title="Text Lesson", defaults={
        'lesson_type': 'article',
        'content': 'This is pure text content.'
    })

    print(f"Course '{course.title}' ready with 2 lessons.")

    # 3. Verify Pre-Enrollment Visibility (Should be restricted)
    print("\n--- Pre-Enrollment Check ---")
    request = factory.get(f'/api/courses/{course.id}/')
    request.user = student
    
    # Test Serializer directly
    serializer = CourseSerializer(course, context={'request': request})
    data = serializer.data
    print(f"Is Enrolled: {data['is_enrolled']}")
    
    lesson_data = data['sections'][0]['lessons'][0]
    print(f"Video Lesson URL (Should be None): {lesson_data.get('video_url')}")
    
    # 4. Perform Enrollment via View
    print("\n--- Performing Enrollment ---")
    enroll_request = factory.post(f'/api/courses/{course.id}/enroll/')
    force_authenticate(enroll_request, user=student)
    
    view = EnrollView.as_view()
    response = view(enroll_request, course_id=course.id)
    print(f"Enroll response: {response.status_code} {response.data}")

    # 5. Verify Post-Enrollment Visibility (Should be visible)
    print("\n--- Post-Enrollment Check ---")
    # Refresh context/request
    request = factory.get(f'/api/courses/{course.id}/')
    force_authenticate(request, user=student)
    
    serializer = CourseSerializer(course, context={'request': request})
    data = serializer.data
    print(f"Is Enrolled: {data['is_enrolled']}")
    
    if not data['is_enrolled']:
         print("CRITICAL ERROR: Serializer still reports is_enrolled=False")
         # Check DB directly
         exists = Enrollment.objects.filter(user=student, course=course).exists()
         print(f"DB Enrollment Exists: {exists}")
    
    lesson_v_data = data['sections'][0]['lessons'][0]
    lesson_t_data = data['sections'][0]['lessons'][1]
    
    print(f"Video Lesson URL: {lesson_v_data.get('video_url')}")
    print(f"Text Lesson Content: '{lesson_t_data.get('content')}'")
    
    if lesson_v_data.get('video_url') == 'https://www.youtube.com/watch?v=dQw4w9WgXcQ':
        print("SUCCESS: Video URL is visible.")
    else:
        print("FAILURE: Video URL is missing or incorrect.")

if __name__ == "__main__":
    verify_full_flow()
