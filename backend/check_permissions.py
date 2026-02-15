import os
import django
from django.test import RequestFactory
from django.contrib.auth import get_user_model
from rest_framework.request import Request

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'imra_backend.settings')
django.setup()

from core.models import Course, Lesson, Section
from core.serializers import LessonSerializer

User = get_user_model()

def check_instructor_permissions(course_id, user_id):
    try:
        user = User.objects.get(pk=user_id)
        course = Course.objects.get(pk=course_id)
        
        print(f"Checking permissions for user: {user.email} on course: {course.title} (ID: {course.id})")
        print(f"Course Instructor: {course.instructor.email}")
        
        if course.instructor != user:
            print("WARNING: User is NOT the course instructor.")
        else:
            print("User IS the course instructor.")

        # Get a lesson
        section = course.sections.first()
        if not section:
            print("No sections found.")
            return
        
        lesson = section.lessons.first()
        if not lesson:
            print("No lessons found.")
            return

        # Mock request
        factory = RequestFactory()
        request = factory.get('/')
        request.user = user
        
        # Serialize
        drf_request = Request(request)
        drf_request.user = user  # Explicitly set on DRF request wrapper
        
        context = {'request': drf_request}
        serializer = LessonSerializer(lesson, context=context)
        data = serializer.data
        
        print("\nSerialized Lesson Data (Selected Fields):")
        print(f"ID: {data.get('id')}")
        print(f"Video File: {data.get('video_file')}")
        print(f"Content: {data.get('content')}")
        
        if data.get('video_file') is None and lesson.video_file:
             print("ERROR: Video file is hidden despite user being instructor/enrolled!")
        elif data.get('content') == "" and lesson.content:
             print("ERROR: Content is hidden despite user being instructor/enrolled!")
        else:
             print("SUCCESS: Content is visible.")

    except User.DoesNotExist:
        print(f"User with email {user_email} not found")
    except Course.DoesNotExist:
        print(f"Course {course_id} not found")

if __name__ == "__main__":
    course = Course.objects.get(pk=1)
    instructor = course.instructor
    check_instructor_permissions(1, instructor.id)
