
import os
import django
from django.conf import settings

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'imra_backend.settings')
django.setup()

from django.test import RequestFactory
from core.views import StudentAnalyticsView, PendingTasksView, CourseListView, LeaderboardView
from core.models import User

def test_view(view_class, user, query_params={}):
    factory = RequestFactory()
    request = factory.get('/', query_params)
    request.user = user
    view = view_class.as_view()
    try:
        response = view(request)
        print(f"{view_class.__name__}: {response.status_code}")
        if response.status_code >= 400:
            print(f"  Response Data: {response.data}")
    except Exception as e:
        print(f"!!! {view_class.__name__} CRASHED: {e}")
        import traceback
        traceback.print_exc()

# Get or create a student user
student = User.objects.filter(role='student').first()
if not student:
    student = User.objects.create_user(username='test_student', password='password', role='student')

print(f"Testing views as student: {student.username}")

test_view(StudentAnalyticsView, student)
test_view(PendingTasksView, student)
test_view(CourseListView, student, {'enrolled': 'true'})
test_view(LeaderboardView, student)
