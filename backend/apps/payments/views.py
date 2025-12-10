from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, throttle_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import UserRateThrottle
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.views.decorators.http import require_http_methods
from django.utils import timezone
import json
import logging

from .models import Transaction
from .serializers import TransactionSerializer, STKPushRequestSerializer
from .mpesa_service import MPesaService, parse_mpesa_callback
from apps.marketplace.models import Order

logger = logging.getLogger(__name__)


class PaymentThrottle(UserRateThrottle):
    """Custom throttle for payment endpoints."""
    rate = '10/minute'


@api_view(['POST'])
@permission_classes([IsAuthenticated])
@throttle_classes([PaymentThrottle])
def initiate_stk_push(request):
    """
    Initiate M-Pesa STK Push payment for an order.
    
    POST /api/payments/mpesa/initiate/
    Body: {
        "order_id": 1,
        "phone": "+254712345678"
    }
    """
    serializer = STKPushRequestSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    order_id = serializer.validated_data['order_id']
    phone = serializer.validated_data['phone']
    
    try:
        order = Order.objects.get(id=order_id, customer=request.user)
    except Order.DoesNotExist:
        return Response(
            {'error': 'Order not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Check if order is already paid
    if order.status == 'paid':
        return Response(
            {'error': 'Order is already paid'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Check if there's already a successful transaction
    if Transaction.objects.filter(order=order, status='success').exists():
        return Response(
            {'error': 'Order already has a successful payment'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Initialize M-Pesa service
    mpesa_service = MPesaService()
    
    try:
        # Initiate STK Push
        result = mpesa_service.initiate_stk_push(
            phone_number=phone,
            amount=order.total_amount,
            account_reference=f'ORDER{order.id}',
            transaction_desc=f'Payment for order {order.id}'
        )
        
        # Create transaction record
        transaction = Transaction.objects.create(
            order=order,
            checkout_request_id=result['checkout_request_id'],
            amount=order.total_amount,
            phone=phone,
            status='initiated',
            raw_response=result['raw_response']
        )
        
        return Response({
            'message': result.get('customer_message', 'STK Push initiated'),
            'checkout_request_id': result['checkout_request_id'],
            'transaction_id': transaction.id,
            'order_id': order.id
        }, status=status.HTTP_200_OK)
    
    except Exception as e:
        logger.error(f'STK Push initiation failed: {str(e)}')
        return Response(
            {'error': f'Failed to initiate payment: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([AllowAny])  # M-Pesa webhook doesn't use JWT
@csrf_exempt
def mpesa_webhook(request):
    """
    M-Pesa webhook endpoint for payment confirmations.
    
    POST /api/payments/mpesa/webhook/
    This endpoint is called by M-Pesa when payment is completed.
    """
    try:
        data = json.loads(request.body)
        logger.info(f'M-Pesa webhook received: {data}')
        
        # Parse callback data
        callback_data = parse_mpesa_callback(data)
        
        checkout_request_id = callback_data.get('checkout_request_id')
        result_code = callback_data.get('result_code')
        
        if not checkout_request_id:
            logger.warning('Webhook missing checkout_request_id')
            return Response({'status': 'error', 'message': 'Missing checkout_request_id'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        # Find transaction
        try:
            transaction = Transaction.objects.get(checkout_request_id=checkout_request_id)
        except Transaction.DoesNotExist:
            logger.warning(f'Transaction not found for checkout_request_id: {checkout_request_id}')
            return Response({'status': 'error', 'message': 'Transaction not found'}, 
                          status=status.HTTP_404_NOT_FOUND)
        
        # Update transaction based on result code
        if result_code == 0:
            # Payment successful
            transaction.status = 'success'
            transaction.mpesa_transaction_id = callback_data.get('mpesa_receipt_number')
            transaction.completed_at = timezone.now()
            transaction.raw_response = callback_data.get('raw_data', {})
            
            # Update order status
            transaction.order.status = 'paid'
            transaction.order.save()
            
            transaction.save()
            
            logger.info(f'Transaction {transaction.id} marked as success')
            return Response({'status': 'success'}, status=status.HTTP_200_OK)
        
        else:
            # Payment failed
            transaction.status = 'failed'
            transaction.error_message = callback_data.get('result_desc', 'Payment failed')
            transaction.raw_response = callback_data.get('raw_data', {})
            transaction.save()
            
            logger.info(f'Transaction {transaction.id} marked as failed')
            return Response({'status': 'failed'}, status=status.HTTP_200_OK)
    
    except json.JSONDecodeError:
        logger.error('Invalid JSON in webhook payload')
        return Response({'status': 'error', 'message': 'Invalid JSON'}, 
                      status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        logger.error(f'Webhook processing error: {str(e)}')
        return Response({'status': 'error', 'message': str(e)}, 
                      status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def simulate_webhook(request):
    """
    Development helper endpoint to simulate M-Pesa webhook.
    Only available in DEBUG mode.
    
    POST /api/payments/mpesa/confirmation_sim/
    Body: {
        "checkout_request_id": "ws_CO_123456789",
        "result_code": 0,  # 0 = success, other = failed
        "mpesa_receipt_number": "QLXXXXX"
    }
    """
    from django.conf import settings
    if not settings.DEBUG:
        return Response(
            {'error': 'This endpoint is only available in DEBUG mode'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    checkout_request_id = request.data.get('checkout_request_id')
    result_code = request.data.get('result_code', 0)
    mpesa_receipt_number = request.data.get('mpesa_receipt_number', 'QLTEST123')
    
    if not checkout_request_id:
        return Response(
            {'error': 'checkout_request_id is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        transaction = Transaction.objects.get(checkout_request_id=checkout_request_id)
    except Transaction.DoesNotExist:
        return Response(
            {'error': 'Transaction not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Simulate webhook callback
    if result_code == 0:
        transaction.status = 'success'
        transaction.mpesa_transaction_id = mpesa_receipt_number
        transaction.completed_at = timezone.now()
        transaction.order.status = 'paid'
        transaction.order.save()
    else:
        transaction.status = 'failed'
        transaction.error_message = 'Simulated failure'
    
    transaction.save()
    
    return Response({
        'message': 'Webhook simulated successfully',
        'transaction_id': transaction.id,
        'status': transaction.status
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def transaction_list(request):
    """Get list of transactions for the current user's orders."""
    transactions = Transaction.objects.filter(
        order__customer=request.user
    ).select_related('order').order_by('-created_at')
    
    serializer = TransactionSerializer(transactions, many=True)
    return Response(serializer.data)

