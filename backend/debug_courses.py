
import os
import sys
import django

# Setup Django
sys.path.append(os.path.dirname(__file__))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'imra_backend.settings')
django.setup()

from core.models import Course

def list_courses():
    print("--- All Courses ---")
    for course in Course.objects.all():
        print(f"ID: {course.id} | Title: {course.title} | Price: {course.price} | Published: {course.is_published}")

if __name__ == "__main__":
    list_courses()
