from rest_framework import serializers
from .models import Farm
from apps.users.serializers import UserSerializer


class FarmSerializer(serializers.ModelSerializer):
    """Serializer for Farm model."""
    owner = UserSerializer(read_only=True)
    owner_id = serializers.IntegerField(write_only=True, required=False)
    
    class Meta:
        model = Farm
        fields = ('id', 'owner', 'owner_id', 'name', 'description', 'location',
                  'latitude', 'longitude', 'size_hectares', 'soil_type', 
                  'main_crops', 'created_at', 'updated_at')
        read_only_fields = ('id', 'created_at', 'updated_at')
    
    def create(self, validated_data):
        # Set owner from request user if not provided
        if 'owner_id' in validated_data:
            validated_data.pop('owner_id')
        validated_data['owner'] = self.context['request'].user
        return super().create(validated_data)


class FarmListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for farm lists."""
    owner_email = serializers.EmailField(source='owner.email', read_only=True)
    
    class Meta:
        model = Farm
        fields = ('id', 'name', 'location', 'size_hectares', 'main_crops', 
                  'owner_email', 'created_at')

