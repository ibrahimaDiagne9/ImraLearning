
import os
import django
import sys

# Set up Django environment
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '.')))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'imra_backend.settings')
django.setup()

from core.models import Course, Order
from django.contrib.auth import get_user_model
from core.services.paydunya_service import PayDunyaService
from unittest.mock import MagicMock

User = get_user_model()

def test_checkout():
    # Get or create a test user and course
    user, _ = User.objects.get_or_create(email="Doe@gmail.com", defaults={"username": "doe"})
    course = Course.objects.first()
    
    if not course:
        print("No courses found in database.")
        return

    # Create a pending order
    order = Order.objects.create(
        user=user,
        course=course,
        amount=course.price,
        status='pending'
    )
    
    print(f"--- Testing Refactored PayDunya Checkout ---")
    print(f"Order created: {order.id}")
    
    # Mock request for build_absolute_uri
    request = MagicMock()
    request.build_absolute_uri = lambda x: f"http://localhost:8000{x}"
    
    service = PayDunyaService()
    try:
        token, url = service.create_checkout_invoice(order, request)
        print(f"Token: {token}")
        print(f"URL: {url}")
        print("Success!")
    except Exception as e:
        print(f"Failed: {e}")

if __name__ == "__main__":
    test_checkout()
