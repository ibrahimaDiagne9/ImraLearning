import paydunya
import requests
from django.conf import settings
from django.urls import reverse
import logging

logger = logging.getLogger(__name__)

class PayDunyaService:
    """
    Designated service for handling PayDunya payment operations.
    Focuses on security, logic, and webhook handling.
    """
    def __init__(self):
        # Configure the PayDunya SDK mode
        paydunya.debug = settings.DEBUG
        
        # Configure the PayDunya API keys globally as recommended by documentation
        paydunya.api_keys = {
            'PAYDUNYA-MASTER-KEY': settings.PAYDUNYA_MASTER_KEY,
            'PAYDUNYA-PRIVATE-KEY': settings.PAYDUNYA_PRIVATE_KEY,
            'PAYDUNYA-TOKEN': settings.PAYDUNYA_TOKEN
        }

    def create_checkout_invoice(self, order, request):
        """
        Creates a checkout invoice and returns the redirection URL.
        """
        # Configure Store properties from settings
        store = paydunya.Store(
            name=settings.PAYDUNYA_STORE_NAME,
            tagline=settings.PAYDUNYA_STORE_TAGLINE,
            phone=settings.PAYDUNYA_STORE_PHONE,
            postal_address=settings.PAYDUNYA_STORE_POSTAL_ADDRESS,
            logo_url=settings.PAYDUNYA_STORE_LOGO_URL
        )
        
        # Initialize standard PayDunya Invoice
        invoice = paydunya.Invoice(store)
        
        # Set callback URLs
        invoice.callback_url = request.build_absolute_uri(reverse('paydunya-ipn'))
        invoice.return_url = f"{settings.FRONTEND_URL}/payment-success/{order.id}"
        invoice.cancel_url = f"{settings.FRONTEND_URL}/courses/{order.course.id}"
        
        # Simple amount parsing (assuming order.amount is a numeric field)
        # For XOF (CFA), it must be an integer and at least 200
        final_amount = int(order.amount)
        if final_amount < 200:
            logger.warning(f"Order {order.id} amount {final_amount} is below minimum 200 XOF, capping at 200")
            final_amount = 200
        
        logger.info(f"Setting amount {final_amount} XOF for Order {order.id}")

        # Set total amount
        invoice.total_amount = str(final_amount)
        
        # Add Course as item
        item = paydunya.InvoiceItem(
            name=order.course.title,
            quantity=1,
            unit_price=str(final_amount),
            total_price=str(final_amount),
            description=f"Accès complet au cours: {order.course.title}"
        )
        invoice.add_item(item)
        
        # Add custom data
        invoice.add_custom_data([
            ("order_id", order.id),
            ("user_id", order.user.id),
            ("course_id", order.course.id)
        ])
        
        # Generate the invoice
        successful, response = invoice.create()
        
        if successful:
            token = response.get("token")
            # The SDK might return the URL in 'response_text' or 'url'
            url = response.get("url", response.get("response_text"))
            
            logger.info(f"PayDunya invoice created for Order {order.id}: {token}")
            return token, url
        else:
            logger.error(f"PayDunya invoice creation failed for Order {order.id}: {response}")
            raise Exception(f"Payment initialization failed: {response.get('response_text')}")

    def verify_ipn(self, token):
        """
        Verifies the Instant Payment Notification (IPN) from PayDunya.
        Follows the SDK pattern: successful, response = invoice.confirm(token)
        """
        invoice = paydunya.Invoice()
        successful, response = invoice.confirm(token)
        
        if successful:
            logger.info(f"PayDunya IPN verification successful for token: {token}")
            return {
                'status': invoice.status,
                'order_id': invoice.get_custom_data("order_id"),
                'transaction_id': invoice.transaction_id,
                'customer_email': invoice.customer.get('email') if invoice.customer else None,
                'total_amount': invoice.total_amount,
                'fees': invoice.fees,
                'response_code': response.get('response_code'),
                'response_text': response.get('response_text')
            }
        else:
            logger.warning(f"PayDunya IPN verification failed for token: {token}. Response: {response}")
            return None

    def initiate_direct_payment(self, order, phone_number, channel, request):
        """
        Initiates a direct payment (SoftPay) for Wave or Orange Money.
        Channel: 'wave-senegal', 'orange-money-senegal', etc.
        """
        base_url = "https://app.paydunya.com/api/v1"
        if paydunya.debug:
            base_url = "https://app.paydunya.com/sandbox-api/v1"
        
        url = f"{base_url}/softpay/senegal-mobile-money"
        
        headers = {
            'PAYDUNYA-MASTER-KEY': settings.PAYDUNYA_MASTER_KEY,
            'PAYDUNYA-PRIVATE-KEY': settings.PAYDUNYA_PRIVATE_KEY,
            'PAYDUNYA-TOKEN': settings.PAYDUNYA_TOKEN,
            'Content-Type': 'application/json'
        }

        payload = {
            "item_name": f"Cours: {order.course.title}",
            "amount": int(order.amount),
            "customer_name": f"{order.user.first_name} {order.user.last_name}" or order.user.username,
            "customer_email": order.user.email,
            "customer_phone": phone_number,
            "wallet_provider": channel,
            "callback_url": request.build_absolute_uri(reverse('paydunya-ipn')),
            "custom_data": {
                "order_id": order.id,
                "course_id": order.course.id,
                "user_id": order.user.id
            }
        }

        try:
            response = requests.post(url, json=payload, headers=headers)
            try:
                res_data = response.json()
            except ValueError:
                logger.error(f"PayDunya SoftPay Non-JSON Response: {response.text}")
                raise Exception(f"Invalid API Response (Status {response.status_code}): {response.text[:100]}")
            
            if response.status_code == 200 and res_data.get('success'):
                token = res_data.get('token')
                logger.info(f"PayDunya SoftPay initiated for Order {order.id}: {token}")
                return token, res_data.get('message')
            else:
                logger.error(f"PayDunya SoftPay failed for Order {order.id}: {res_data}")
                raise Exception(res_data.get('message', 'Payment initiation failed'))
        except Exception as e:
            logger.error(f"PayDunya SoftPay Exception: {str(e)}")
            raise e
