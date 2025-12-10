from rest_framework import serializers
from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    """Serializer for Notification model."""
    
    class Meta:
        model = Notification
        fields = ('id', 'title', 'body', 'notification_type', 'read', 'read_at',
                  'created_at', 'link')
        read_only_fields = ('id', 'created_at', 'read_at')

