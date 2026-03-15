from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from users.permissions import IsAdmin, IsApproved
from audit.utils import log_action
from .models import Subscription, Payment, Invoice
from .serializers import SubscriptionSerializer, PaymentSerializer, InvoiceSerializer


@api_view(['GET'])
@permission_classes([IsApproved])
def subscription_detail(request, candidate_id):
    try:
        sub = Subscription.objects.get(candidate_id=candidate_id)
        return Response(SubscriptionSerializer(sub).data)
    except Subscription.DoesNotExist:
        return Response({})


@api_view(['POST'])
@permission_classes([IsAdmin])
def create_subscription(request, candidate_id):
    data = request.data.copy()
    data['candidate'] = candidate_id
    serializer = SubscriptionSerializer(data=data)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    log_action(request.user, 'subscription_created', str(candidate_id), 'subscription', data)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['PATCH'])
@permission_classes([IsAdmin])
def update_subscription(request, candidate_id):
    try:
        sub = Subscription.objects.get(candidate_id=candidate_id)
    except Subscription.DoesNotExist:
        return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

    serializer = SubscriptionSerializer(sub, data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsApproved])
def payments(request, candidate_id):
    pays = Payment.objects.filter(candidate_id=candidate_id)
    return Response(PaymentSerializer(pays, many=True).data)


@api_view(['POST'])
@permission_classes([IsAdmin])
def record_payment(request, candidate_id):
    data = request.data.copy()
    data['candidate'] = candidate_id
    serializer = PaymentSerializer(data=data)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    log_action(request.user, 'payment_recorded', str(candidate_id), 'payment', data)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsApproved])
def invoices(request, candidate_id):
    invs = Invoice.objects.filter(candidate_id=candidate_id)
    return Response(InvoiceSerializer(invs, many=True).data)
