"""
Celery tasks for payment processing and reconciliation.
"""
from celery import shared_task
from django.utils import timezone
from datetime import timedelta
from .models import Transaction
from .mpesa_service import MPesaService
import logging

logger = logging.getLogger(__name__)


@shared_task
def reconcile_pending_transactions():
    """
    Reconcile pending transactions by querying M-Pesa API.
    This task should run periodically (e.g., every 5 minutes).
    """
    # Get transactions that are pending and older than 2 minutes
    cutoff_time = timezone.now() - timedelta(minutes=2)
    pending_transactions = Transaction.objects.filter(
        status__in=['initiated', 'pending'],
        created_at__lt=cutoff_time,
        checkout_request_id__isnull=False
    )
    
    mpesa_service = MPesaService()
    reconciled_count = 0
    
    for transaction in pending_transactions:
        try:
            result = mpesa_service.query_stk_status(transaction.checkout_request_id)
            
            if result['result_code'] == 0:
                # Transaction successful
                transaction.status = 'success'
                transaction.mpesa_transaction_id = result.get('raw_response', {}).get('MpesaReceiptNumber')
                transaction.completed_at = timezone.now()
                transaction.raw_response = result['raw_response']
                
                # Update order status
                transaction.order.status = 'paid'
                transaction.order.save()
                
                transaction.save()
                reconciled_count += 1
                logger.info(f'Transaction {transaction.id} reconciled as success')
            
            elif result['result_code'] != 1032:  # 1032 = Request processing
                # Transaction failed or cancelled
                transaction.status = 'failed'
                transaction.error_message = result.get('result_desc', 'Transaction failed')
                transaction.raw_response = result['raw_response']
                transaction.save()
                logger.info(f'Transaction {transaction.id} reconciled as failed')
        
        except Exception as e:
            logger.error(f'Error reconciling transaction {transaction.id}: {str(e)}')
            continue
    
    logger.info(f'Reconciled {reconciled_count} transactions')
    return reconciled_count

