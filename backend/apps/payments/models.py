from django.db import models
from django.core.validators import RegexValidator
from apps.marketplace.models import Order


class Transaction(models.Model):
    """Transaction model for M-Pesa payments."""
    STATUS_CHOICES = [
        ('initiated', 'Initiated'),
        ('pending', 'Pending'),
        ('success', 'Success'),
        ('failed', 'Failed'),
        ('cancelled', 'Cancelled'),
    ]
    
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='transactions')
    mpesa_transaction_id = models.CharField(
        max_length=50,
        unique=True,
        db_index=True,
        null=True,
        blank=True,
        help_text='M-Pesa transaction ID (e.g., QLXXXXX)'
    )
    checkout_request_id = models.CharField(
        max_length=100,
        unique=True,
        db_index=True,
        null=True,
        blank=True,
        help_text='M-Pesa checkout request ID'
    )
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    phone = models.CharField(
        max_length=15,
        validators=[
            RegexValidator(
                regex=r'^\+254[17]\d{8}$',
                message='Phone number must be in format +2547XXXXXXXX or +2541XXXXXXXX'
            )
        ]
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='initiated')
    raw_response = models.JSONField(default=dict, help_text='Raw response from M-Pesa API')
    error_message = models.TextField(blank=True, help_text='Error message if transaction failed')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'transactions'
        indexes = [
            models.Index(fields=['mpesa_transaction_id']),
            models.Index(fields=['checkout_request_id']),
            models.Index(fields=['status']),
            models.Index(fields=['order']),
            models.Index(fields=['created_at']),
        ]
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Transaction {self.id} - {self.status} - {self.amount}"

