from django.db import models

from apps.users.models import User


class Farm(models.Model):
    """Farm model representing a farmer's farm."""
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='farms')
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    location = models.CharField(max_length=200, help_text='Address or location name')
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    size_hectares = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    soil_type = models.CharField(max_length=100, blank=True)
    main_crops = models.JSONField(
        default=list,
        blank=True,
        help_text='List of main crops grown on this farm'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'farms'
        indexes = [
            models.Index(fields=['owner']),
            models.Index(fields=['latitude', 'longitude']),
        ]
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.name} - {self.owner.email}"

