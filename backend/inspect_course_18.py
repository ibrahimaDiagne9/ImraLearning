
import os
import django
import json
from rest_framework import serializers

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'imra_backend.settings')
django.setup()

from core.models import Course, User
from core.serializers import CourseSerializer
from django.test import RequestFactory

def debug_course(course_id, username=None):
    try:
        course = Course.objects.get(pk=course_id)
        print(f"Course: {course.title} (ID: {course_id})")
        
        factory = RequestFactory()
        user = User.objects.get(username=username) if username else User.objects.filter(role='student').first()
        request = factory.get('/')
        request.user = user
        
        serializer = CourseSerializer(course, context={'request': request})
        data = serializer.data
        print(json.dumps(data, indent=2))
        return data
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    # Check course 18 as a student
    debug_course(18, 'DIagne') # DIagne is an instructor, but lets try a student
    # Try as the actual student who might be viewing it
    # Find any student
    student = User.objects.filter(role='student').first()
    if student:
        print(f"\nFetching as student: {student.username}")
        debug_course(18, student.username)
