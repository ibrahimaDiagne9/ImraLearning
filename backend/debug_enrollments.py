
import os
import sys
import django

# Setup Django
sys.path.append(os.path.dirname(__file__))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'imra_backend.settings')
django.setup()

from core.models import User, Enrollment, Course

def debug_user_enrollments(email):
    print(f"--- Debugging Enrollments for {email} ---")
    try:
        user = User.objects.get(email=email)
        enrollments = Enrollment.objects.filter(user=user)
        print(f"User found: {user.username} (ID: {user.id})")
        print(f"Total Enrollments: {enrollments.count()}")
        
        for en in enrollments:
            print(f"Enrolled in: {en.course.title} | Price: {en.course.price} | Progress: {en.progress}%")
            
        # Check all courses and their is_enrolled for this user
        print("\n--- All Courses and Enrollment Check ---")
        for course in Course.objects.all():
            is_enrolled = Enrollment.objects.filter(user=user, course=course).exists()
            print(f"Course: {course.title} | Price: {course.price} | Is Enrolled: {is_enrolled}")
            
    except User.DoesNotExist:
        print(f"User with email {email} not found.")

from core.views import StudentAnalyticsView
from rest_framework.test import APIRequestFactory, force_authenticate

def debug_user_analytics(email):
    print(f"\n--- Debugging Analytics for {email} ---")
    try:
        user = User.objects.get(email=email)
        factory = APIRequestFactory()
        request = factory.get('/api/analytics/student/')
        force_authenticate(request, user=user)
        view = StudentAnalyticsView.as_view()
        response = view(request)
        print(f"Analytics Data: {response.data}")
    except User.DoesNotExist:
        print(f"User {email} not found.")

if __name__ == "__main__":
    debug_user_enrollments('Doe@gmail.com')
    debug_user_analytics('Doe@gmail.com')
