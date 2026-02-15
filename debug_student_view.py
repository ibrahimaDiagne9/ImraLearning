
import os
import django
import json

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'imra_backend.settings')
django.setup()

from core.models import User, Course, Enrollment, Section, Lesson
from core.serializers import CourseSerializer
from rest_framework.test import APIRequestFactory

def debug_course_visibility():
    # 1. Create/Get a student
    student, _ = User.objects.get_or_create(username='debug_student', defaults={'role': 'student'})
    
    # 2. Get a course
    course = Course.objects.first()
    if not course:
        print("No courses found in database.")
        return

    print(f"Course: {course.title} (ID: {course.id})")
    print(f"Is Published: {course.is_published}")

    # 3. Check enrollment
    is_enrolled = Enrollment.objects.filter(user=student, course=course).exists()
    print(f"Student enrolled: {is_enrolled}")

    # 4. Serialize course as if requested by student
    factory = APIRequestFactory()
    request = factory.get(f'/api/courses/{course.id}/')
    request.user = student
    
    serializer = CourseSerializer(course, context={'request': request})
    data = serializer.data

    print("\nSerialized Data Summary:")
    print(f"Sections count: {len(data.get('sections', []))}")
    for section in data.get('sections', []):
        print(f"  Section: {section.get('title')} (Lessons: {len(section.get('lessons', []))})")
        for lesson in section.get('lessons', []):
            print(f"    Lesson: {lesson.get('title')} (Type: {lesson.get('lesson_type')})")
            print(f"      Video URL: {lesson.get('video_url')}")
            print(f"      Content: {lesson.get('content')[:50]}...")

    # 5. If sections are empty, let's see why
    if not data.get('sections'):
        actual_sections = course.sections.all()
        print(f"\nActual sections in DB for this course: {actual_sections.count()}")

if __name__ == '__main__':
    debug_course_visibility()
