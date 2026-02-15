import logging
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
from django.db.models import Sum
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from ..models import Order, Course, Enrollment, Membership, LiveSession, Notification
from ..serializers import OrderSerializer, LiveSessionSerializer
from ..services.paydunya_service import PayDunyaService

logger = logging.getLogger(__name__)

class OrderListCreateView(generics.ListCreateAPIView):
    serializer_class = OrderSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user)

class CreatePaymentIntentView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        course_id = request.data.get('course_id')
        try:
            course = Course.objects.get(pk=course_id)
            order = Order.objects.create(
                user=request.user,
                course=course,
                amount=course.price,
                status='pending'
            )
            return Response({
                "client_secret": f"pi_mock_{order.id}_secret_12345",
                "order_id": order.id
            })
        except Course.DoesNotExist:
            return Response({"error": "Course not found"}, status=404)

class ConfirmPaymentView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        order_id = request.data.get('order_id')
        transaction_id = request.data.get('transaction_id', 'tx_mock_123')
        
        try:
            order = Order.objects.get(pk=order_id, user=request.user)
            order.status = 'completed'
            order.provider_transaction_id = transaction_id
            order.save()
            
            Enrollment.objects.get_or_create(user=request.user, course=order.course)
            return Response({"status": "success", "message": "Payment confirmed and enrolled"})
        except Order.DoesNotExist:
            return Response({"error": "Order not found"}, status=404)

class CreatePayDunyaCheckoutView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        course_id = request.data.get('course_id')
        try:
            course = Course.objects.get(pk=course_id)
            order = Order.objects.create(
                user=request.user,
                course=course,
                amount=course.price,
                status='pending'
            )
            
            paydunya_service = PayDunyaService()
            token, checkout_url = paydunya_service.create_checkout_invoice(order, request)
            
            order.provider_transaction_id = token
            order.save()

            return Response({
                "checkout_url": checkout_url,
                "order_id": order.id,
                "token": token
            })
        except Course.DoesNotExist:
            return Response({"error": "Course not found"}, status=404)
        except Exception as e:
            logger.error(f"PayDunya Checkout Error: {str(e)}")
            return Response({"error": str(e)}, status=500)

class InitiateDirectPaymentView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        course_id = request.data.get('course_id')
        phone_number = request.data.get('phone_number')
        channel = request.data.get('channel')

        if not course_id or not phone_number or not channel:
            return Response({"error": "Missing required fields"}, status=400)

        try:
            course = Course.objects.get(pk=course_id)
            order = Order.objects.create(
                user=request.user,
                course=course,
                amount=course.price if course.price else 0,
                status='pending'
            )
            
            paydunya_service = PayDunyaService()
            token, _ = paydunya_service.initiate_direct_payment(order, phone_number, channel, request)
            
            order.provider_transaction_id = token
            order.save()

            return Response({
                "status": "pending",
                "token": token,
                "order_id": order.id,
                "message": "Paiement initié. Veuillez confirmer sur votre téléphone."
            })
        except Course.DoesNotExist:
            return Response({"error": "Course not found"}, status=404)
        except Exception as e:
            logger.error(f"Direct Payment Error: {str(e)}")
            return Response({"error": str(e)}, status=500)

@method_decorator(csrf_exempt, name='dispatch')
class PayDunyaIPNView(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        token = request.data.get('token')
        if not token:
             return Response({"status": "error", "message": "No token provided"}, status=400)

        paydunya_service = PayDunyaService()
        verification_data = paydunya_service.verify_ipn(token)

        if verification_data and verification_data['status'] == 'completed':
            try:
                order_id = verification_data['order_id']
                order = Order.objects.get(pk=order_id)
                
                expected_amount = float(order.amount)
                received_amount = float(verification_data['total_amount'])
                
                if abs(expected_amount - received_amount) > 0.01:
                    logger.error(f"Amount mismatch for Order {order.id}")
                    return Response({"status": "error", "message": "Amount mismatch"}, status=400)

                if order.status != 'completed':
                    order.status = 'completed'
                    order.provider_transaction_id = verification_data['transaction_id']
                    order.save()
                    
                    Enrollment.objects.get_or_create(user=order.user, course=order.course)
                    
                    Notification.objects.create(
                        user=order.user,
                        type='course',
                        title="Inscription réussie",
                        description=f"Bienvenue dans le cours {order.course.title}!",
                        link=f"/learn/{order.course.id}"
                    )
                
                return Response({"status": "success"})
            except Order.DoesNotExist:
                return Response({"status": "error", "message": "Order not found"}, status=404)
        else:
            return Response({"status": "error", "message": "Verification failed"}, status=400)

class UpgradeMembershipView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        import datetime
        plan_id = request.data.get('planId', 'pro').lower()
        if plan_id not in ['pro', 'elite']:
            plan_id = 'pro'
            
        user = request.user
        membership, created = Membership.objects.get_or_create(user=user)
        membership.tier = plan_id
        membership.is_active = True
        membership.start_date = timezone.now()
        membership.end_date = timezone.now() + datetime.timedelta(days=30)
        membership.save()
        
        user.is_pro = True
        user.save()
        
        return Response({
            'message': f'Membership upgraded to {plan_id.upper()} successfully',
            'tier': plan_id,
            'expires_at': membership.end_date,
            'is_pro': user.is_pro
        }, status=200)

class LiveSessionListView(generics.ListCreateAPIView):
    serializer_class = LiveSessionSerializer
    permission_classes = (permissions.IsAuthenticatedOrReadOnly,)

    def get_queryset(self):
        queryset = LiveSession.objects.all().order_by('-created_at')
        is_live = self.request.query_params.get('is_live')
        if is_live:
            queryset = queryset.filter(is_live=(is_live.lower() == 'true'))
        return queryset

    def perform_create(self, serializer):
        serializer.save(instructor=self.request.user)

class LiveSessionDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = LiveSession.objects.all()
    serializer_class = LiveSessionSerializer
    permission_classes = (permissions.IsAuthenticatedOrReadOnly,)

    def perform_update(self, serializer):
        obj = self.get_object()
        if obj.instructor != self.request.user:
            raise permissions.exceptions.PermissionDenied("You are not the instructor of this session.")
        serializer.save()

class StartLiveSessionView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request, pk):
        try:
            session = LiveSession.objects.get(pk=pk, instructor=request.user)
            session.is_live = True
            session.started_at = timezone.now()
            session.save()
            return Response(LiveSessionSerializer(session).data)
        except LiveSession.DoesNotExist:
            return Response({"error": "Session not found or permission denied"}, status=404)

class EndLiveSessionView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request, pk):
        try:
            session = LiveSession.objects.get(pk=pk, instructor=request.user)
            session.is_live = False
            session.ended_at = timezone.now()
            session.save()
            return Response(LiveSessionSerializer(session).data)
        except LiveSession.DoesNotExist:
            return Response({"error": "Session not found or permission denied"}, status=404)

class UpcomingClassesView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        now = timezone.now()
        if request.user.role == 'teacher':
            upcoming_sessions = LiveSession.objects.filter(
                instructor=request.user,
                scheduled_at__gte=now
            ).order_by('scheduled_at')[:5]
        else:
            upcoming_sessions = LiveSession.objects.filter(
                course__enrollments__user=request.user,
                scheduled_at__gte=now
            ).order_by('scheduled_at')[:5]
        
        data = []
        for session in upcoming_sessions:
            data.append({
                "id": session.id,
                "title": session.title,
                "course": session.course.title if session.course else "General Session",
                "time": session.scheduled_at.strftime("%I:%M %p"),
                "duration": "1 hour",
                "students": session.attendees_count,
                "isLive": session.is_live,
                "date": session.scheduled_at.strftime("%Y-%m-%d")
            })
            
        return Response(data)
