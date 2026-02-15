import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'imra_backend.settings')
django.setup()

from core.models import User, Course, Enrollment, Certificate

def verify():
    user = User.objects.first()
    course = Course.objects.first()
    
    if not user or not course:
        print("Missing user or course")
        return

    print(f"Testing for user: {user.username}, course: {course.title}")
    
    enrollment, _ = Enrollment.objects.get_or_create(user=user, course=course)
    enrollment.progress = 100
    enrollment.save()
    
    cert = Certificate.objects.filter(user=user, course=course).first()
    if cert:
        print(f"SUCCESS: Certificate generated! ID: {cert.certificate_id}")
    else:
        print("FAILURE: Certificate not found")

if __name__ == "__main__":
    verify()
