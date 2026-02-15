import os
import django
import sys
import json
from decimal import Decimal
from datetime import datetime

# Setup Django environment
sys.path.append(os.path.join(os.getcwd(), 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'imra_backend.settings')
django.setup()

from core.models import User, Enrollment, Course, QuizAttempt, Certificate
from core.views import StudentReportView, RecentActivityView, AnalyticsView
from rest_framework.test import APIRequestFactory, force_authenticate

def verify_student_report():
    print("Verifying StudentReportView...")
    factory = APIRequestFactory()
    user = User.objects.filter(role='student').first()
    
    if not user:
        print("No student user found for testing.")
        return

    request = factory.get('/api/dashboard/student-report/')
    force_authenticate(request, user=user)
    view = StudentReportView.as_view()
    response = view(request)
    
    if response.status_code == 200:
        print("SUCCESS: StudentReportView returned 200")
        data = response.data
        print(f"Summary: {data['summary']}")
        print(f"Course Progress Count: {len(data['course_progress'])}")
    else:
        print("FAILURE: StudentReportView failed with status")
        print(response.data)

def verify_recent_activity():
    print("\nVerifying RecentActivityView for student...")
    factory = APIRequestFactory()
    user = User.objects.filter(role='student').first()
    
    if not user:
        return

    request = factory.get('/api/dashboard/recent-activity/')
    force_authenticate(request, user=user)
    view = RecentActivityView.as_view()
    response = view(request)
    
    if response.status_code == 200:
        print("SUCCESS: RecentActivityView returned 200")
        print(f"Activity count: {len(response.data)}")
    else:
        print("FAILURE: RecentActivityView failed with status")

def verify_analytics_fix():
    print("\nVerifying AnalyticsView fix (Teacher)...")
    factory = APIRequestFactory()
    user = User.objects.filter(role='teacher').first()
    
    if not user:
        print("No teacher user found for testing.")
        return

    request = factory.get('/api/analytics/')
    force_authenticate(request, user=user)
    view = AnalyticsView.as_view()
    response = view(request)
    
    if response.status_code == 200:
        print("SUCCESS: AnalyticsView returned 200 (Fix verified)")
    else:
        print("FAILURE: AnalyticsView failed with status")
        print(response.data)

if __name__ == "__main__":
    verify_student_report()
    verify_recent_activity()
    verify_analytics_fix()
