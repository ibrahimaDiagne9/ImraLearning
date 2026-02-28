import uuid
from django.core.mail import send_mail
from django.conf import settings
from ..models import User

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
        user.email_verified = False
        user.save(update_fields=['email_verification_token', 'email_verified'])

        # In production, this should be the frontend URL from settings
        frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:5174')
        verify_link = f"{frontend_url}/verify-email?token={token}"

        if settings.DEBUG:
            print("\n" + "="*50)
            print(f"VERIFICATION LINK: {verify_link}")
            print("="*50 + "\n")

        send_mail(
            subject="Verify your ImraLearning Account",
            message=f"Welcome to ImraLearning!\n\nPlease verify your email address by clicking the link below:\n{verify_link}\n\nThank you!",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False,
        )

    @staticmethod
    def send_password_reset_email(user: User):
        """Generates a token and sends a password reset link."""
        token = AuthService.generate_token()
        user.password_reset_token = token
        user.save(update_fields=['password_reset_token'])

        frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:5174')
        reset_link = f"{frontend_url}/reset-password?token={token}"

        if settings.DEBUG:
            print("\n" + "="*50)
            print(f"PASSWORD RESET LINK: {reset_link}")
            print("="*50 + "\n")

        send_mail(
            subject="Reset Your ImraLearning Password",
            message=f"You requested a password reset.\n\nPlease set a new password by clicking the link below:\n{reset_link}\n\nIf you did not request this, please ignore this email.",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False,
        )
