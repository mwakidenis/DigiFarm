from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters
from django.db.models import Q
from .models import Product, ProductCategory, Order, Rating, Vendor, ProductImage
from .serializers import (
    ProductSerializer, ProductCategorySerializer, OrderSerializer,
    RatingSerializer, VendorSerializer, OrderUpdateSerializer
)


class ProductViewSet(viewsets.ModelViewSet):
    """ViewSet for Product CRUD operations."""
    queryset = Product.objects.filter(is_active=True).select_related('vendor', 'category').prefetch_related('images', 'ratings')
    serializer_class = ProductSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'vendor', 'is_verified']
    search_fields = ['title', 'description']
    ordering_fields = ['price', 'created_at']
    ordering = ['-created_at']
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAuthenticated()]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        # Filter by price range
        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')
        if min_price:
            queryset = queryset.filter(price__gte=min_price)
        if max_price:
            queryset = queryset.filter(price__lte=max_price)
        return queryset
    
    def perform_create(self, serializer):
        # Only vendors can create products
        if self.request.user.role != 'vendor':
            raise PermissionError('Only vendors can create products')
        
        # Get or create vendor profile
        vendor, _ = Vendor.objects.get_or_create(user=self.request.user)
        # Ensure product is active and verified by default for this release
        product = serializer.save(vendor=vendor, is_active=True, is_verified=True)
        
        # Handle images
        images = self.request.FILES.getlist('images')
        for i, image in enumerate(images):
            ProductImage.objects.create(
                product=product, 
                image=image,
                is_primary=(i==0)
            )


class ProductCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for ProductCategory (read-only)."""
    queryset = ProductCategory.objects.all()
    serializer_class = ProductCategorySerializer
    permission_classes = [AllowAny]


class OrderViewSet(viewsets.ModelViewSet):
    """ViewSet for Order CRUD operations."""
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action in ['update', 'partial_update']:
            return OrderUpdateSerializer
        return OrderSerializer
    
    def get_queryset(self):
        user = self.request.user
        if getattr(user, 'role', None) == 'admin':
            return Order.objects.all().prefetch_related('items__product')
        elif getattr(user, 'role', None) == 'vendor':
            # Vendors see orders they placed (as customer) OR orders containing their products (as vendor)
            return Order.objects.filter(
                Q(customer=user) | Q(items__product__vendor__user=user)
            ).distinct().prefetch_related('items__product')
        
        # Customers can only see their own orders
        return Order.objects.filter(customer=user).prefetch_related('items__product')
    
    def perform_create(self, serializer):
        serializer.save()
    
    @action(detail=True, methods=['patch'])
    def cancel(self, request, pk=None):
        """Cancel an order."""
        order = self.get_object()
        if order.status not in ['pending', 'paid']:
            return Response(
                {'error': 'Only pending or paid orders can be cancelled'},
                status=status.HTTP_400_BAD_REQUEST
            )
        order.status = 'cancelled'
        order.save()
        # Restore stock
        for item in order.items.all():
            item.product.stock += item.quantity
            item.product.save()
        return Response({'status': 'Order cancelled'})


class RatingViewSet(viewsets.ModelViewSet):
    """ViewSet for Rating CRUD operations."""
    serializer_class = RatingSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Rating.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class VendorViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for Vendor (read-only for customers)."""
    queryset = Vendor.objects.filter(is_verified=True)
    serializer_class = VendorSerializer
    permission_classes = [AllowAny]
