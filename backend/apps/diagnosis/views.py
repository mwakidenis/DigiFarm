from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.throttling import UserRateThrottle
from .models import CropImage, DiagnosisResult
from .serializers import CropImageSerializer, DiagnosisResultSerializer, DiagnosisDetailSerializer
from .tasks import diagnose_image, mock_crop_diagnosis
from .models import DiagnosisResult


class DiagnosisThrottle(UserRateThrottle):
    """Custom throttle for diagnosis uploads."""
    rate = '100/hour'


class CropImageViewSet(viewsets.ModelViewSet):
    """ViewSet for crop image upload and diagnosis."""
    queryset = CropImage.objects.select_related('submitted_by', 'farm').all()
    serializer_class = CropImageSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    # throttle_classes = [DiagnosisThrottle]
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return DiagnosisDetailSerializer
        return CropImageSerializer
    
    def get_queryset(self):
        # Users can only see their own diagnoses
        return self.queryset.filter(submitted_by=self.request.user)
    
    def perform_create(self, serializer):
        crop_image = serializer.save()
        
        # DEMO MODE: Process synchronously to avoid needing Celery worker
        try:
             result = mock_crop_diagnosis(crop_image)
             DiagnosisResult.objects.create(
                crop_image=crop_image,
                predicted_label=result['label'],
                confidence=result['confidence'],
                recommendations=result['recommendations'],
                model_version='v1.0-mock'
             )
             crop_image.status = 'processed'
             crop_image.save()
        except Exception as e:
             # Fallback to async if needed, or log error
             pass

        return crop_image
    
    @action(detail=True, methods=['get'], url_path='result')
    def result(self, request, pk=None):
        """Get diagnosis result for a specific crop image."""
        try:
            crop_image = self.get_object()
            if crop_image.status == 'processed' and hasattr(crop_image, 'diagnosis_result'):
                serializer = DiagnosisDetailSerializer(crop_image)
                return Response(serializer.data)
            elif crop_image.status == 'failed':
                return Response(
                    {'error': 'Diagnosis processing failed. Please try uploading again.'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
            else:
                return Response(
                    {'status': crop_image.status, 'message': 'Diagnosis is still being processed.'},
                    status=status.HTTP_202_ACCEPTED
                )
        except CropImage.DoesNotExist:
            return Response(
                {'error': 'Crop image not found'},
                status=status.HTTP_404_NOT_FOUND
            )

