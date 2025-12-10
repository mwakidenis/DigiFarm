from rest_framework import serializers
from .models import Article, Category
from apps.users.serializers import UserSerializer


class CategorySerializer(serializers.ModelSerializer):
    """Serializer for Category model."""
    article_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Category
        fields = ('id', 'name', 'slug', 'description', 'article_count', 'created_at')
        read_only_fields = ('id', 'created_at')
    
    def get_article_count(self, obj):
        return obj.articles.filter(published=True).count()


class ArticleSerializer(serializers.ModelSerializer):
    """Serializer for Article model."""
    author = UserSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    category_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    tags_list = serializers.SerializerMethodField()
    
    class Meta:
        model = Article
        fields = ('id', 'title', 'slug', 'body', 'author', 'category', 'category_id',
                  'tags', 'tags_list', 'published', 'publish_date', 'featured_image',
                  'views', 'created_at', 'updated_at')
        read_only_fields = ('id', 'slug', 'author', 'views', 'created_at', 'updated_at')
    
    def get_tags_list(self, obj):
        return obj.get_tags_list()
    
    def to_representation(self, instance):
        representation = super().to_representation(instance)
        if instance.featured_image:
            request = self.context.get('request')
            if request:
                representation['featured_image'] = request.build_absolute_uri(instance.featured_image.url)
        return representation


class ArticleListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for article lists."""
    author_name = serializers.EmailField(source='author.email', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    
    class Meta:
        model = Article
        fields = ('id', 'title', 'slug', 'author_name', 'category_name', 'tags',
                  'published', 'publish_date', 'featured_image', 'views', 'created_at')

