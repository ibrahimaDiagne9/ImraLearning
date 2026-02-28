from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from ..models import User
from ..serializers import RegisterSerializer, UserSerializer
from ..services.auth_service import AuthService

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer

class UserDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_object(self):
        return self.request.user

class RequestPasswordResetView(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response({"error": "Email is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        user = User.objects.filter(email=email).first()
        if user:
            AuthService.send_password_reset_email(user)
        # Always return 200 even if user doesn't exist to prevent email enumeration
        return Response({"message": "If an account with that email exists, a password reset link has been sent."})

class ResetPasswordConfirmView(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        token = request.data.get('token')
        new_password = request.data.get('password')

        if not token or not new_password:
            return Response({"error": "Token and password are required"}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.filter(password_reset_token=token).first()
        if not user:
            return Response({"error": "Invalid or expired reset token"}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.password_reset_token = None
        user.save()
        return Response({"message": "Password successfully reset."})

class VerifyEmailConfirmView(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        token = request.data.get('token')
        if not token:
            return Response({"error": "Token is required"}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.filter(email_verification_token=token).first()
        if not user:
            return Response({"error": "Invalid or expired verification token"}, status=status.HTTP_400_BAD_REQUEST)

        user.email_verified = True
        user.email_verification_token = None
        user.save(update_fields=['email_verified', 'email_verification_token'])
        return Response({"message": "Email successfully verified."})

class RequestEmailVerificationView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        user = request.user
        if user.email_verified:
            return Response({"message": "Email is already verified."}, status=status.HTTP_400_BAD_REQUEST)
        
        AuthService.send_verification_email(user)
        return Response({"message": "A new verification email has been sent."})
