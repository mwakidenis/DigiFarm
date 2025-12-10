from django.db import models
from apps.farms.models import Farm
from apps.users.models import User


class CropImage(models.Model):
    """Model for storing uploaded crop images for diagnosis."""
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('processed', 'Processed'),
        ('failed', 'Failed'),
    ]
    
    farm = models.ForeignKey(Farm, on_delete=models.CASCADE, related_name='crop_images', null=True, blank=True)
    image = models.ImageField(upload_to='crop_images/')
    timestamp = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    submitted_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='submitted_diagnoses')
    notes = models.TextField(blank=True, help_text='Optional notes about the crop condition')
    
    class Meta:
        db_table = 'crop_images'
        indexes = [
            models.Index(fields=['submitted_by']),
            models.Index(fields=['status']),
            models.Index(fields=['timestamp']),
        ]
        ordering = ['-timestamp']
    
    def __str__(self):
        return f"Crop Image {self.id} - {self.status}"


class DiagnosisResult(models.Model):
    """Model for storing AI diagnosis results."""
    crop_image = models.OneToOneField(CropImage, on_delete=models.CASCADE, related_name='diagnosis_result')
    predicted_label = models.CharField(max_length=200, help_text='Predicted disease or issue')
    confidence = models.FloatField(help_text='Confidence score (0.0 to 1.0)')
    recommendations = models.JSONField(
        default=dict,
        help_text='Structured recommendations including treatment, products, etc.'
    )
    processed_at = models.DateTimeField(auto_now_add=True)
    model_version = models.CharField(max_length=50, default='v1.0', help_text='ML model version used')
    
    class Meta:
        db_table = 'diagnosis_results'
        ordering = ['-processed_at']
    
    def __str__(self):
        return f"Diagnosis for Image {self.crop_image.id}: {self.predicted_label} ({self.confidence:.2%})"

