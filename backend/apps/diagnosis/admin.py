from django.contrib import admin
from .models import CropImage, DiagnosisResult


@admin.register(CropImage)
class CropImageAdmin(admin.ModelAdmin):
    list_display = ('id', 'submitted_by', 'farm', 'status', 'timestamp')
    list_filter = ('status', 'timestamp')
    search_fields = ('submitted_by__email', 'farm__name')
    raw_id_fields = ('submitted_by', 'farm')
    readonly_fields = ('timestamp',)


@admin.register(DiagnosisResult)
class DiagnosisResultAdmin(admin.ModelAdmin):
    list_display = ('crop_image', 'predicted_label', 'confidence', 'processed_at')
    list_filter = ('processed_at', 'model_version')
    search_fields = ('predicted_label', 'crop_image__id')
    raw_id_fields = ('crop_image',)
    readonly_fields = ('processed_at',)

