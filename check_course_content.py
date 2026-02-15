import os
import django
import sys
import json

# Setup Django environment
sys.path.append(os.path.join(os.getcwd(), 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'imra_backend.settings')
django.setup()

from core.models import User, Course, Section, Lesson, Enrollment
from core.serializers import CourseSerializer
from rest_framework.test import APIRequestFactory

def check_course_serialization():
    factory = APIRequestFactory()
    student = User.objects.filter(role='student').first()
    course = Course.objects.first()

    if not student or not course:
        print("Missing student or course for testing.")
        return

    # Mock request with student user
    request = factory.get(f'/api/courses/{course.id}/')
    request.user = student

    # Serialize course
    serializer = CourseSerializer(course, context={'request': request})
    data = serializer.data

    print(f"Course: {data['title']}")
    print(f"Is Enrolled: {data['is_enrolled']}")
    print(f"Sections Count: {len(data.get('sections', []))}")
    
    if data.get('sections'):
        for section in data['sections']:
            print(f"  Section: {section['title']} - Lessons: {len(section.get('lessons', []))}")
            for lesson in section.get('lessons', []):
                print(f"    Lesson: {lesson['title']} (Type: {lesson['lesson_type']})")
                print(f"      Has Video: {bool(lesson.get('video_url') or lesson.get('video_file'))}")
                print(f"      Has Content: {bool(lesson.get('content'))}")

def check_non_enrolled_security():
    print("\nChecking Non-Enrolled Student Security...")
    factory = APIRequestFactory()
    # Find a course the student is NOT enrolled in
    student = User.objects.filter(role='student').first()
    enrolled_ids = Enrollment.objects.filter(user=student).values_list('course_id', flat=True)
    course = Course.objects.exclude(id__in=enrolled_ids).first()

    if not student or not course:
        print("Missing non-enrolled configuration.")
        return

    request = factory.get(f'/api/courses/{course.id}/')
    request.user = student
    serializer = CourseSerializer(course, context={'request': request})
    data = serializer.data

    print(f"Course: {data['title']}")
    print(f"Is Enrolled: {data['is_enrolled']}")
    
    if data.get('sections'):
        lesson = data['sections'][0]['lessons'][0] if data['sections'][0].get('lessons') else None
        if lesson:
            print(f"  First Lesson: {lesson['title']}")
            print(f"  Video URL should be None: {lesson.get('video_url')}")
            print(f"  Content should be empty: '{lesson.get('content')}'")
            print(f"  Resources should be empty: {len(lesson.get('resources', []))}")

def check_course_list_serialization():
    print("\nChecking Course List Serialization...")
    factory = APIRequestFactory()
    student = User.objects.filter(role='student').first()
    
    request = factory.get('/api/courses/')
    request.user = student
    
    queryset = Course.objects.all()
    serializer = CourseSerializer(queryset, many=True, context={'request': request})
    data = serializer.data
    
    if data:
        for course in data:
            print(f"Course: {course['title']}")
            print(f"Sections Count: {len(course.get('sections', []))}")
    else:
        print("No courses found.")

if __name__ == "__main__":
    check_course_serialization()
    check_course_list_serialization()
    check_non_enrolled_security()
