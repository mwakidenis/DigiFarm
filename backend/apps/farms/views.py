from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Farm
from .serializers import FarmSerializer, FarmListSerializer


class FarmViewSet(viewsets.ModelViewSet):
    """ViewSet for Farm CRUD operations."""
    queryset = Farm.objects.select_related('owner').all()
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['owner', 'soil_type']
    search_fields = ['name', 'location', 'description', 'main_crops']
    ordering_fields = ['created_at', 'size_hectares']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return FarmListSerializer
        return FarmSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        # Filter by county/location if provided
        location = self.request.query_params.get('county', None)
        if location:
            queryset = queryset.filter(location__icontains=location)
        
        # Filter by crop if provided
        crop = self.request.query_params.get('crop', None)
        if crop:
            queryset = queryset.filter(main_crops__contains=[crop])
        
        return queryset
    
    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)
    
    @action(detail=False, methods=['get'])
    def my_farms(self, request):
        """Get farms owned by the current user."""
        farms = self.queryset.filter(owner=request.user)
        serializer = self.get_serializer(farms, many=True)
        return Response(serializer.data)

