
import os
import sys
import django
from django.conf import settings

# Setup Django
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'imra_backend.settings')
django.setup()

import paydunya
from core.models import User, Course, Order
from core.services.paydunya_service import PayDunyaService

def analyze_paydunya():
    print("--- PayDunya Configuration Analysis ---")
    
    # 1. Check Settings
    print(f"DEBUG Mode: {settings.DEBUG}")
    print(f"PayDunya Master Key: {'Set' if settings.PAYDUNYA_MASTER_KEY else 'Missing'}")
    print(f"PayDunya Private Key: {'Set' if settings.PAYDUNYA_PRIVATE_KEY else 'Missing'}")
    print(f"PayDunya Token: {'Set' if settings.PAYDUNYA_TOKEN else 'Missing'}")
    
    # 2. Check Service Initialization
    # Manually configure paydunya to test the fix
    paydunya.debug = True
    
    print(f"DEBUG: Master Key from settings: {settings.PAYDUNYA_MASTER_KEY[:5]}...")
    
    paydunya.api_keys.clear()
    paydunya.api_keys.update({
        'PAYDUNYA-MASTER-KEY': settings.PAYDUNYA_MASTER_KEY,
        'PAYDUNYA-PRIVATE-KEY': settings.PAYDUNYA_PRIVATE_KEY,
        'PAYDUNYA-TOKEN': settings.PAYDUNYA_TOKEN
    })
    
    print(f"DEBUG: paydunya.api_keys set to: {list(paydunya.api_keys.keys())}")
    
    print(f"PayDunya SDK Debug Mode: {paydunya.debug}")
    
    # Workaround: Define CustomInvoice to force headers
    class CustomInvoice(paydunya.Invoice):
        @property
        def headers(self):
            return {
                'PAYDUNYA-MASTER-KEY': settings.PAYDUNYA_MASTER_KEY,
                'PAYDUNYA-PRIVATE-KEY': settings.PAYDUNYA_PRIVATE_KEY,
                'PAYDUNYA-TOKEN': settings.PAYDUNYA_TOKEN,
                'User-Agent': paydunya.PAYDUNYA_USER_AGENT,
                "Content-Type": "application/json"
            }

    if not settings.PAYDUNYA_MASTER_KEY or not settings.PAYDUNYA_PRIVATE_KEY or not settings.PAYDUNYA_TOKEN:
        print("ERROR: Missing API Keys. Aborting test.")
        return

    # 3. Test Invoice Creation
    print("\n--- Testing Invoice Creation ---")
    try:
        # Create dummy order data
        class MockOrder:
            id = 9999
            amount = 5000
            course = type('obj', (object,), {'id': 1, 'title': 'Test Course'})
        
        class MockRequest:
            def build_absolute_uri(self, path):
                return f"http://localhost:8000{path}"

        mock_order = MockOrder()
        mock_request = MockRequest()
        
        print("Attempting to create invoice with CustomInvoice...")
        
        store = paydunya.Store(name="ImraLearning") 
        invoice = CustomInvoice(store)
        
        invoice.add_channel("orange-money-senegal")
        invoice.add_channel("wave-senegal")
        
        # Test InvoiceItem usage
        item = paydunya.InvoiceItem(
            name=mock_order.course.title,
            quantity=1,
            unit_price=str(mock_order.amount),
            total_price=str(mock_order.amount),
            description=f"Enrollment for {mock_order.course.title}"
        )
        invoice.add_item(item)
        
        invoice.total_amount = str(mock_order.amount)
        invoice.add_custom_data([("order_id", mock_order.id)])
        invoice.description = "Test Description"
        
        print(f"DEBUG: paydunya module file: {paydunya.__file__}")
        print(f"DEBUG: invoice._config: {invoice._config}")
        print(f"Headers being sent: {invoice.headers}")

        result = invoice.create()
        print(f"Result type: {type(result)}")
        print(f"Result: {result}")
        
        # Based on source code reading, it returns (status, response)
        if isinstance(result, tuple) and result[0]:
            response_data = result[1]
            print(f"SUCCESS: Invoice Created")
            print(f"Token: {response_data.get('token')}")
            print(f"Invoice URL: {response_data.get('response_text')}") 
        elif result: # Fallback if it just returns True/False (unlikely based on source)
             print("Result evaluated to True but structure unknown.")
        else:
             print(f"FAILURE: {result}")

    except Exception as e:
        print(f"ERROR: Invoice Creation Failed")
        print(f"Exception: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    analyze_paydunya()
