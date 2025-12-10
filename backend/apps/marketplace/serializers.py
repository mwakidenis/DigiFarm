from rest_framework import serializers
from decimal import Decimal
from .models import Vendor, Product, ProductCategory, ProductImage, Order, OrderItem, Rating
from apps.users.serializers import UserSerializer


class ProductImageSerializer(serializers.ModelSerializer):
    """Serializer for product images."""
    
    class Meta:
        model = ProductImage
        fields = ('id', 'image', 'is_primary')
    
    def to_representation(self, instance):
        representation = super().to_representation(instance)
        if instance.image:
            request = self.context.get('request')
            if request:
                representation['image'] = request.build_absolute_uri(instance.image.url)
        return representation


class ProductCategorySerializer(serializers.ModelSerializer):
    """Serializer for product categories."""
    
    class Meta:
        model = ProductCategory
        fields = ('id', 'name', 'slug', 'description')


class ProductSerializer(serializers.ModelSerializer):
    """Serializer for Product model."""
    vendor_name = serializers.CharField(source='vendor.business_name', read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)
    category = ProductCategorySerializer(read_only=True)
    category_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    average_rating = serializers.SerializerMethodField()
    
    class Meta:
        model = Product
        fields = ('id', 'vendor', 'vendor_name', 'title', 'description', 'price', 
                  'stock', 'category', 'category_id', 'images', 'is_verified', 
                  'is_active', 'average_rating', 'created_at', 'updated_at')
        read_only_fields = ('id', 'vendor', 'is_verified', 'created_at', 'updated_at')
    
    def get_average_rating(self, obj):
        ratings = obj.ratings.all()
        if ratings.exists():
            return round(sum(r.rating for r in ratings) / ratings.count(), 2)
        return 0.0


class VendorSerializer(serializers.ModelSerializer):
    """Serializer for Vendor model."""
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Vendor
        fields = ('id', 'user', 'business_name', 'business_registration', 
                  'description', 'is_verified', 'rating', 'created_at')
        read_only_fields = ('id', 'is_verified', 'rating', 'created_at')


class OrderItemSerializer(serializers.ModelSerializer):
    """Serializer for OrderItem model."""
    product = ProductSerializer(read_only=True)
    product_id = serializers.IntegerField(write_only=True)
    subtotal = serializers.ReadOnlyField()
    
    class Meta:
        model = OrderItem
        fields = ('id', 'product', 'product_id', 'quantity', 'price', 'subtotal')


class OrderSerializer(serializers.ModelSerializer):
    """Serializer for Order model."""
    customer = UserSerializer(read_only=True)
    items = OrderItemSerializer(many=True, read_only=True)
    order_items = serializers.ListField(
        child=serializers.DictField(),
        write_only=True,
        help_text='List of items: [{"product_id": 1, "quantity": 2}, ...]'
    )
    
    class Meta:
        model = Order
        fields = ('id', 'customer', 'status', 'total_amount', 'shipping_address',
                  'shipping_county', 'shipping_phone', 'notes', 'items', 
                  'order_items', 'created_at', 'updated_at')
        read_only_fields = ('id', 'customer', 'status', 'total_amount', 'created_at', 'updated_at')
    
    def create(self, validated_data):
        order_items_data = validated_data.pop('order_items')
        customer = self.context['request'].user
        
        # Calculate total amount
        total = Decimal('0.00')
        items_to_create = []
        
        for item_data in order_items_data:
            product_id = item_data['product_id']
            quantity = item_data['quantity']
            
            try:
                product = Product.objects.get(id=product_id, is_active=True)
            except Product.DoesNotExist:
                raise serializers.ValidationError(f'Product {product_id} not found or inactive')
            
            if product.stock < quantity:
                raise serializers.ValidationError(
                    f'Insufficient stock for {product.title}. Available: {product.stock}'
                )
            
            price = product.price
            subtotal = price * quantity
            total += subtotal
            
            items_to_create.append({
                'product': product,
                'quantity': quantity,
                'price': price
            })
        
        # Create order
        order = Order.objects.create(
            customer=customer,
            total_amount=total,
            **validated_data
        )
        
        # Create order items and update stock
        for item_data in items_to_create:
            OrderItem.objects.create(
                order=order,
                **item_data
            )
            # Update product stock
            item_data['product'].stock -= item_data['quantity']
            item_data['product'].save()
        
        return order


class OrderUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating Order status."""
    class Meta:
        model = Order
        fields = ('status',)


class RatingSerializer(serializers.ModelSerializer):
    """Serializer for Rating model."""
    user = UserSerializer(read_only=True)
    product = ProductSerializer(read_only=True)
    product_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = Rating
        fields = ('id', 'product', 'product_id', 'user', 'rating', 'comment', 'created_at')
        read_only_fields = ('id', 'user', 'created_at')
    
    def create(self, validated_data):
        validated_data.pop('product_id')
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

