from rest_framework import serializers
from .models import Transaction
from apps.marketplace.serializers import OrderSerializer


class TransactionSerializer(serializers.ModelSerializer):
    """Serializer for Transaction model."""
    order = OrderSerializer(read_only=True)
    
    class Meta:
        model = Transaction
        fields = ('id', 'order', 'mpesa_transaction_id', 'checkout_request_id',
                  'amount', 'phone', 'status', 'error_message', 'created_at',
                  'updated_at', 'completed_at')
        read_only_fields = ('id', 'mpesa_transaction_id', 'checkout_request_id',
                           'status', 'error_message', 'created_at', 'updated_at',
                           'completed_at')


class STKPushRequestSerializer(serializers.Serializer):
    """Serializer for STK Push initiation request."""
    order_id = serializers.IntegerField()
    phone = serializers.CharField(
        max_length=15,
        help_text='Phone number in format +2547XXXXXXXX'
    )

