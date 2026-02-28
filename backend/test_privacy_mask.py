import os
import django
import sys

# Setup Django environment
sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'imra_backend.settings')
django.setup()

from core.models import User, Course, Lesson, Enrollment
from core.serializers import LessonSerializer
from rest_framework.test import APIRequestFactory

def test_serializer_privacy():
    user = User.objects.get(id=1) # The imra student
    course = Course.objects.get(id=18) # New UI Mastery Course
    lesson = Lesson.objects.filter(section__course=course).first()
    
    print(f"Testing User: {user.username} (ID: {user.id})")
    print(f"Testing Course: {course.title} (ID: {course.id})")
    print(f"Testing Lesson: {lesson.title} (ID: {lesson.id})")
    
    # Check if enrolled in DB
    is_enrolled_db = Enrollment.objects.filter(user=user, course=course).exists()
    print(f"Is enrolled in DB: {is_enrolled_db}")
    
    # Simulate Serializer
    factory = APIRequestFactory()
    request = factory.get('/')
    request.user = user
    
    serializer = LessonSerializer(lesson, context={'request': request})
    data = serializer.to_representation(lesson)
    
    print(f"Serializer video_url: {data.get('video_url')}")
    print(f"Serializer video_file: {data.get('video_file')}")
    
    if is_enrolled_db and data.get('video_file') is None:
        print("BUG DETECTED: Privacy mask is hiding data for an enrolled user!")
    else:
        print("Privacy mask logic seems correct for this case.")

if __name__ == "__main__":
    test_serializer_privacy()
