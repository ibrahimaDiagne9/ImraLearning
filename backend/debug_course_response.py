import os
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'imra_backend.settings')
django.setup()

from core.models import Course
from core.serializers import CourseSerializer
from rest_framework.test import APIRequestFactory

def debug_course(course_id):
    try:
        course = Course.objects.get(pk=course_id)
        serializer = CourseSerializer(course)
        print(json.dumps(serializer.data, indent=2, default=str))
    except Course.DoesNotExist:
        print(f"Course {course_id} not found")

if __name__ == "__main__":
    debug_course(1)
