
import os
import sys
import django

# Setup Django
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'imra_backend.settings')
django.setup()

from core.models import Order

def check_latest_orders():
    print("--- Latest Orders ---")
    orders = Order.objects.all().order_by('-created_at')[:5]
    if not orders:
        print("No orders found.")
        return
        
    for order in orders:
        print(f"ID: {order.id} | User: {order.user.email} | Course: {order.course.title} | Amount: {order.amount} | Status: {order.status} | Created: {order.created_at}")

if __name__ == "__main__":
    check_latest_orders()
