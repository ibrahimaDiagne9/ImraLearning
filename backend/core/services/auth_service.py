import uuid
from django.core.mail import EmailMultiAlternatives, send_mail
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.utils import timezone
from datetime import timedelta
from django.conf import settings
import logging
from ..models import User

logger = logging.getLogger(__name__)

class AuthService:
    @staticmethod
    def generate_token() -> str:
        """Generates a secure, random UUID string for email verification or password reset."""
        return str(uuid.uuid4())

    @staticmethod
    def send_verification_email(user: User):
        """Generates a token and sends an email verification link."""
        token = AuthService.generate_token()
        user.email_verification_token = token
        user.email_verification_expires = timezone.now() + timedelta(hours=24) # 24h expiration
        user.email_verified = False
        user.save(update_fields=['email_verification_token', 'email_verification_expires', 'email_verified'])

        # In production, this should be the frontend URL from settings
        frontend_url = getattr(settings, 'FRONTEND_URL', 'https://imraedu.com')
        verify_link = f"{frontend_url}/verify-email?token={token}"

        if settings.DEBUG:
            print("\n" + "="*50)
            print(f"VERIFICATION LINK: {verify_link}")
            print("="*50 + "\n")

        # HTML Email content
        context = {
            'user': user,
            'verify_link': verify_link
        }
        html_content = render_to_string('core/emails/verify_email.html', context)
        text_content = strip_tags(html_content)

        msg = EmailMultiAlternatives(
            subject="Verify your ImraLearning Account",
            body=text_content,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[user.email],
        )
        msg.attach_alternative(html_content, "text/html")
        msg.send(fail_silently=False)

    @staticmethod
    def send_password_reset_email(user: User):
        """Generates a token and sends a password reset link."""
        token = AuthService.generate_token()
        user.password_reset_token = token
        user.password_reset_expires = timezone.now() + timedelta(hours=1) # 1h expiration
        try:
            user.save(update_fields=['password_reset_token', 'password_reset_expires'])
        except Exception as e:
            logger.error(f"Failed to save password reset token for user {user.email}: {str(e)}")
            raise

        frontend_url = getattr(settings, 'FRONTEND_URL', 'https://imraedu.com')
        reset_link = f"{frontend_url}/reset-password?token={token}"

        if settings.DEBUG:
            print("\n" + "="*50)
            print(f"PASSWORD RESET LINK: {reset_link}")
            print("="*50 + "\n")

        try:
            send_mail(
                subject="Reset Your ImraLearning Password",
                message=f"You requested a password reset.\n\nPlease set a new password by clicking the link below:\n{reset_link}\n\nIf you did not request this, please ignore this email.",
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=False,
            )
        except Exception as e:
            logger.error(f"Failed to send password reset email to {user.email}: {str(e)}")
            # We raise so the custom exception handler catches it and returns 500
            # but now we have it in the logs.
            raise
