import requests
import json
import logging
from django.conf import settings
from django.urls import reverse

logger = logging.getLogger(__name__)

class BictorysService:
    """
    Designated service for handling Bictorys Direct API payment operations.
    """
    def __init__(self):
        self.api_key = settings.BICTORYS_API_KEY
        self.webhook_secret = getattr(settings, 'BICTORYS_WEBHOOK_SECRET', None)
        self.is_test = settings.BICTORYS_IS_TEST
        
        # Determine the base URL depending on the environment
        if self.is_test:
            self.base_url = "https://api.test.bictorys.com"
        else:
            self.base_url = "https://api.bictorys.com"

    def initiate_payment(self, order, payment_type, customer_phone, request):
        """
        Initiates a direct mobile payment via Bictorys.
        payment_type: e.g., 'orange_money', 'wave_senegal', 'free_money'
        """
        endpoint = f"{self.base_url}/pay/v1/charges?payment_type={payment_type}"
        
        headers = {
            "Content-Type": "application/json",
            "X-Api-Key": self.api_key
        }

        # The webhook should theoretically be registered in Bictorys dashboard, 
        # but if we can pass a callback URL, we do it here. 
        # By standard direct API they might depend solely on webhook setup in dashboard.
        redirect_url = f"{settings.FRONTEND_URL}/payment-success/{order.id}"

        # Amount must be an integer, format for XOF. 
        # In this implementation, we assume XOF. Adjust dynamically if needed.
        final_amount = int(order.amount)
        if final_amount < 200:
            logger.warning(f"Order {order.id} amount {final_amount} might be below minimum for mobile money, keeping as is but be careful.")
            
        payload = {
            "merchantReference": f"IMRA-{order.id}", # Must be unique per transaction attempt
            "redirectUrl": redirect_url, # Depending on Bictorys API, they might require a redirect URL on charge completion
            "amount": final_amount,
            "currency": "XOF",
            "country": "SN", # Assuming Senegal base
            "orderDetails": [
                {
                    "name": order.course.title[:50], 
                    "price": final_amount,
                    "quantity": 1,
                    "taxRate": 0
                }
            ],
            "paymentReference": f"ORD-{order.id}",
            "customer": {
                "name": f"{order.user.first_name} {order.user.last_name}".strip() or order.user.username,
                "phone": customer_phone,
                "email": order.user.email,
                "country": "SN",
                "locale": "fr-FR"
            },
            "allowUpdateCustomer": True
        }

        try:
            logger.info(f"Initiating Bictorys payment for order {order.id} with type {payment_type}")
            response = requests.post(endpoint, headers=headers, json=payload)
            
            # The direct API typically responds with a JSON containing the status and transaction ID.
            if response.status_code in [200, 201]:
                res_data = response.json()
                logger.info(f"Bictorys response SUCCESS: {res_data}")
                
                # Bictorys might return a status 'pending' if it triggered a USSD push
                # and you must wait for the webhook, or 'success' if immediate.
                # Adjust based on exact response structure.
                return {
                    "success": True,
                    "transaction_id": res_data.get("transactionId", "unknown"),
                    "status": res_data.get("status", "pending"),
                    "message": "Paiement initié. Veuillez confirmer sur votre téléphone.",
                    "link": res_data.get("link")
                }
            else:
                logger.error(f"Bictorys Payment failed. HTTP {response.status_code}: {response.text}")
                error_msg = "Erreur du partenaire de paiement"
                try:
                    err_data = response.json()
                    error_msg = err_data.get("message", error_msg)
                except ValueError:
                    pass
                return {
                    "success": False,
                    "error": error_msg
                }
        except Exception as e:
            logger.error(f"Bictorys Direct API Exception: {str(e)}")
            return {
                "success": False,
                "error": "Impossible de contacter le fournisseur de paiement."
            }

    def initiate_membership_payment(self, payment, plan_id, payment_type, customer_phone, request):
        """
        Initiates a direct mobile payment via Bictorys for Memberships.
        payment_type: e.g., 'orange_money', 'wave_money'
        """
        endpoint = f"{self.base_url}/pay/v1/charges?payment_type={payment_type}"
        
        headers = {
            "Content-Type": "application/json",
            "X-Api-Key": self.api_key
        }

        redirect_url = f"{settings.FRONTEND_URL}/membership-success/{payment.id}"
        
        final_amount = int(payment.amount)
            
        payload = {
            "merchantReference": f"IMRA-MBR-{payment.id}",
            "redirectUrl": redirect_url,
            "amount": final_amount,
            "currency": payment.currency,
            "country": "SN", 
            "orderDetails": [
                {
                    "name": f"Membership {plan_id.upper()}", 
                    "price": final_amount,
                    "quantity": 1,
                    "taxRate": 0
                }
            ],
            "paymentReference": f"MBR-{payment.id}",
            "customer": {
                "name": f"{payment.user.first_name} {payment.user.last_name}".strip() or payment.user.username,
                "phone": customer_phone,
                "email": payment.user.email,
                "country": "SN",
                "locale": "fr-FR"
            },
            "allowUpdateCustomer": True
        }

        try:
            logger.info(f"Initiating Bictorys membership payment {payment.id} with type {payment_type}")
            response = requests.post(endpoint, headers=headers, json=payload)
            
            if response.status_code in [200, 201]:
                res_data = response.json()
                return {
                    "success": True,
                    "transaction_id": res_data.get("transactionId", "unknown"),
                    "status": res_data.get("status", "pending"),
                    "message": "Paiement initié. Veuillez confirmer sur votre téléphone.",
                    "link": res_data.get("link")
                }
            else:
                logger.error(f"Bictorys Membership Payment failed. HTTP {response.status_code}: {response.text}")
                error_msg = "Erreur du partenaire de paiement"
                try:
                    err_data = response.json()
                    error_msg = err_data.get("message", error_msg)
                except ValueError:
                    pass
                return {
                    "success": False,
                    "error": error_msg
                }
        except Exception as e:
            logger.error(f"Bictorys Direct API Exception: {str(e)}")
            return {
                "success": False,
                "error": "Impossible de contacter le fournisseur de paiement."
            }

    def verify_webhook(self, payload, headers):
        """
        Validates the incoming webhook/IPN from Bictorys.
        Returns extracted data if valid, False otherwise.
        """
        # Validate X-Secret-Key
        if self.webhook_secret:
            secret_key = headers.get('HTTP_X_SECRET_KEY') or headers.get('X-Secret-Key')
            if secret_key != self.webhook_secret:
                logger.error("Bictorys Webhook: Invalid or missing X-Secret-Key")
                return False
        
        try:
            status = payload.get("status")
            transaction_id = payload.get("transactionId")
            merchant_ref = payload.get("merchantReference")

            if not merchant_ref or not merchant_ref.startswith("IMRA-"):
                logger.error("Invalid Webhook Merchant Reference format.")
                return False

            ref_parts = merchant_ref.split("-")
            
            if len(ref_parts) == 2:
                # Old course format IMRA-<order_id>
                ref_type = 'ORD'
                ref_id = ref_parts[1]
            elif len(ref_parts) == 3:
                # New formats: IMRA-ORD-<id> or IMRA-MBR-<id>
                ref_type = ref_parts[1]
                ref_id = ref_parts[2]
            else:
                return False

            logger.info(f"Bictorys Webhook received for {ref_type} {ref_id}, status: {status}")

            return {
                "ref_type": ref_type,
                "ref_id": ref_id,
                "transaction_id": transaction_id,
                "status": status,
                "amount": payload.get("amount")
            }
        except Exception as e:
            logger.error(f"Error processing Bictorys Webhook payload: {str(e)}")
            return False
