import os
import django
import sys
import json
import uuid

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'imra_backend.settings')
django.setup()

from core.services.bictorys_service import BictorysService

def run_test():
    print("--------------------------------------------------")
    print("Testing Bictorys Direct API Connection")
    print("--------------------------------------------------")
    
    bictorys = BictorysService()
    
    class MockUser:
        first_name = "Test"
        last_name = "User"
        username = "testuser"
        email = "test@example.com"

    class MockCourse:
        title = "Test Course"

    class MockOrder:
        id = str(uuid.uuid4()).split('-')[0]
        amount = 500
        user = MockUser()
        course = MockCourse()

    order = MockOrder()
    customer_phone = "771234567"
    
    print(f"API Key Starts With: {bictorys.api_key[:15]}...")
    
    types_to_try = ["orange_money", "wave", "wave_senegal", "wave_sn", "wave_ci", "wave_money"]
    for pt in types_to_try:
        print(f"\n>> Trying payment type: {pt}")
        try:
            result = bictorys.initiate_payment(order, pt, customer_phone, None)
            if result.get("success"):
                print(f"[SUCCESS]: {pt} accepted!")
                print(f"Transaction ID: {result.get('transaction_id')}")
            else:
                print(f"[FAILED for {pt}]: {result.get('error')}")
        except Exception as e:
            print(f"[SCRIPT ERROR]: {str(e)}")

if __name__ == "__main__":
    run_test()
