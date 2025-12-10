from rest_framework import serializers
from .models import CropImage, DiagnosisResult
from apps.farms.serializers import FarmListSerializer


class CropImageSerializer(serializers.ModelSerializer):
    """Serializer for CropImage model."""
    farm = FarmListSerializer(read_only=True)
    farm_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    
    class Meta:
        model = CropImage
        fields = ('id', 'farm', 'farm_id', 'image', 'timestamp', 'status', 
                  'submitted_by', 'notes')
        read_only_fields = ('id', 'timestamp', 'status', 'submitted_by')
    
    def create(self, validated_data):
        validated_data.pop('farm_id', None)
        validated_data['submitted_by'] = self.context['request'].user
        return super().create(validated_data)


class DiagnosisResultSerializer(serializers.ModelSerializer):
    """Serializer for DiagnosisResult model."""
    crop_image = CropImageSerializer(read_only=True)
    
    class Meta:
        model = DiagnosisResult
        fields = ('id', 'crop_image', 'predicted_label', 'confidence', 
                  'recommendations', 'processed_at', 'model_version')
        read_only_fields = ('id', 'processed_at')


class DiagnosisDetailSerializer(serializers.ModelSerializer):
    """Combined serializer for diagnosis with image and result."""
    crop_image = CropImageSerializer(read_only=True)
    diagnosis_result = DiagnosisResultSerializer(read_only=True, allow_null=True)
    
    class Meta:
        model = CropImage
        fields = ('id', 'crop_image', 'diagnosis_result', 'status', 'timestamp')

