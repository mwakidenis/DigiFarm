from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly, AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters
from .models import Article, Category
from .serializers import ArticleSerializer, ArticleListSerializer, CategorySerializer


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for Category (read-only)."""
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]
    lookup_field = 'slug'


class ArticleViewSet(viewsets.ModelViewSet):
    """ViewSet for Article CRUD operations."""
    queryset = Article.objects.filter(published=True).select_related('author', 'category')
    serializer_class = ArticleSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'author', 'published']
    search_fields = ['title', 'body', 'tags']
    ordering_fields = ['publish_date', 'views', 'created_at']
    ordering = ['-publish_date', '-created_at']
    lookup_field = 'slug'
    
    def get_serializer_class(self):
        if self.action == 'list':
            return ArticleListSerializer
        return ArticleSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        # Admins can see unpublished articles
        if self.request.user.is_authenticated and self.request.user.is_staff:
            queryset = Article.objects.all()
        
        # Filter by tag
        tag = self.request.query_params.get('tag')
        if tag:
            queryset = queryset.filter(tags__icontains=tag)
        
        return queryset
    
    def perform_create(self, serializer):
        serializer.save(author=self.request.user)
    
    @action(detail=True, methods=['post'])
    def increment_views(self, request, slug=None):
        """Increment article view count."""
        article = self.get_object()
        article.views += 1
        article.save()
        return Response({'views': article.views})
    
    @action(detail=True, methods=['get'])
    def markdown(self, request, slug=None):
        """Get article body as markdown (for editing)."""
        article = self.get_object()
        return Response({
            'id': article.id,
            'title': article.title,
            'body': article.body,
            'tags': article.tags
        })

