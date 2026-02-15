import os
import sys
import django
from unittest.mock import MagicMock
import requests
import paydunya

# Setup Django environment
sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'imra_backend.settings')
django.setup()

from django.conf import settings

def test_paydunya_connection():
    # Configure paydunya global keys
    paydunya.api_keys = {
        'PAYDUNYA-MASTER-KEY': settings.PAYDUNYA_MASTER_KEY,
        'PAYDUNYA-PRIVATE-KEY': settings.PAYDUNYA_PRIVATE_KEY,
        'PAYDUNYA-TOKEN': settings.PAYDUNYA_TOKEN
    }
    paydunya.debug = True # Default to Sandbox
    
    print("--- Verifying PayDunya Configuration (Corrected Setup) ---")
    
    # scan for keys
    master_key = settings.PAYDUNYA_MASTER_KEY
    if not master_key or master_key.startswith('your-'):
         print("❌ Error: PAYDUNYA_MASTER_KEY is not set or is using a placeholder.")
         return
    
    print(f"Mode (Forced): Live (API)")
    print(f"Masked Key: {master_key[:5]}...")

    store = paydunya.Store(name="Test Store")

    # Test OPR (Onsite Payment)
    print("\n[Test] Creating OPR (Live)...")
    opr_data = {
        "account_alias": "770000000",
        "amount": 200,
        "total_amount": 200,
        "description": "Test OPR"
    }
    opr = paydunya.OPR(opr_data, store)
    successful, response = opr.create()
    print(f"Result: {successful}, Type: {type(response)}")
    if successful:
         if isinstance(response, dict):
            print(f"✅ OPR Created! Token: {response.get('token')}")
            print("INFO: Live Endpoint works with these keys!")
         else:
            print(f"OPR Created but response is not dict: {response}")
    else:
         print(f"❌ OPR Creation Failed: {response}")
         print(f"Likely cause: Keys are invalid for Live, or Live requires different setup.")

if __name__ == "__main__":
    test_paydunya_connection()
