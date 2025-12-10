from django.db import models
from apps.users.models import User


class Notification(models.Model):
    """In-app notification model."""
    NOTIFICATION_TYPES = [
        ('order', 'Order Update'),
        ('payment', 'Payment'),
        ('diagnosis', 'Crop Diagnosis'),
        ('system', 'System'),
        ('marketplace', 'Marketplace'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=200)
    body = models.TextField()
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES, default='system')
    read = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    link = models.URLField(blank=True, help_text='Optional link to related resource')
    
    class Meta:
        db_table = 'notifications'
        indexes = [
            models.Index(fields=['user', 'read']),
            models.Index(fields=['created_at']),
        ]
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.title} - {self.user.email}"
    
    def mark_as_read(self):
        """Mark notification as read."""
        from django.utils import timezone
        self.read = True
        self.read_at = timezone.now()
        self.save()

