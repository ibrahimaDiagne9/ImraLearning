import os
import django
import sys
import json

# Setup Django environment
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "imra_backend.settings")
django.setup()

from core.models import User, Payment, Membership
from core.services.bictorys_service import BictorysService
from django.conf import settings

def test_membership_payment():
    print("\n--- Testing Bictorys Membership Payment Flow ---")
    
    # 1. Ensure test user
    user, created = User.objects.get_or_create(
        email="test_membership@imraedu.com",
        defaults={
            "username": "test_membership",
            "first_name": "Test",
            "last_name": "Membership",
            "password": "password123",
            "role": "student"
        }
    )
    user.is_pro = False
    user.save()
    print(f"User created/found: {user.email}")
    
    # 2. Create pending payment
    plan_id = "elite"
    amount = 60000
    payment = Payment.objects.create(
        user=user,
        amount=amount,
        currency="XOF",
        status="pending",
        metadata={"plan_id": plan_id}
    )
    print(f"Created pending payment MBR-{payment.id} for {amount} XOF ({plan_id})")
    
    # 3. Simulate checkout
    bictorys = BictorysService()
    print("\nInitiating Wave Payment...")
    result = bictorys.initiate_membership_payment(
        payment=payment,
        plan_id=plan_id,
        payment_type="wave_money",
        customer_phone="771234567",
        request=None
    )
    
    print("\nInitiate Result:", json.dumps(result, indent=2))
    
    if result.get("success"):
        payment.transaction_id = result.get("transaction_id")
        payment.save()
        print(f"Payment {payment.id} updated with transaction ID {payment.transaction_id}")
    else:
        print("Payment initiation failed. Exiting.")
        return

    # 4. Simulate Webhook
    print("\n--- Simulating Webhook Callback ---")
    payload = {
        "merchantReference": f"IMRA-MBR-{payment.id}",
        "transactionId": payment.transaction_id,
        "status": "success",
        "amount": amount
    }
    
    # Test valid secret
    valid_headers = {
        "HTTP_X_SECRET_KEY": settings.BICTORYS_WEBHOOK_SECRET
    }
    print("Testing Webhook with Valid Secret...")
    verification = bictorys.verify_webhook(payload, valid_headers)
    print("Verification Result:", json.dumps(verification, indent=2) if verification else "False")
    
    if verification and verification['status'] == 'success':
        # Simulate view logic
        if verification['ref_type'] == 'MBR':
            p = Payment.objects.get(pk=verification['ref_id'])
            p.status = 'completed'
            p.save()
            
            # Upgrade user
            m, _ = Membership.objects.get_or_create(user=p.user)
            m.tier = p.metadata.get("plan_id")
            m.is_active = True
            m.save()
            
            u = p.user
            u.is_pro = True
            u.save()
            print(f"User {u.email} upgraded successfully! is_pro: {u.is_pro}, tier: {m.tier}")
            
    # Cleanup
    payment.delete()
    if created:
        user.delete()

if __name__ == "__main__":
    test_membership_payment()
