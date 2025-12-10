from django.contrib import admin
from .models import Transaction


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ('id', 'order', 'mpesa_transaction_id', 'amount', 'phone', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('mpesa_transaction_id', 'checkout_request_id', 'order__id', 'phone')
    raw_id_fields = ('order',)
    readonly_fields = ('created_at', 'updated_at', 'completed_at')
    
    actions = ['reconcile_transactions']
    
    def reconcile_transactions(self, request, queryset):
        """Admin action to reconcile pending transactions."""
        from .tasks import reconcile_pending_transactions
        reconcile_pending_transactions.delay()
        self.message_user(request, 'Reconciliation task queued')
    reconcile_transactions.short_description = 'Reconcile pending transactions'

