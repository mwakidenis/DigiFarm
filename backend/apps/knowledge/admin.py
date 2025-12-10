from django.contrib import admin
from .models import Category, Article


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'created_at')
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ('name',)


@admin.register(Article)
class ArticleAdmin(admin.ModelAdmin):
    list_display = ('title', 'author', 'category', 'published', 'publish_date', 'views', 'created_at')
    list_filter = ('published', 'category', 'publish_date', 'created_at')
    search_fields = ('title', 'body', 'tags', 'author__email')
    prepopulated_fields = {'slug': ('title',)}
    raw_id_fields = ('author', 'category')
    readonly_fields = ('views', 'created_at', 'updated_at')
    
    fieldsets = (
        (None, {
            'fields': ('title', 'slug', 'author', 'category')
        }),
        ('Content', {
            'fields': ('body', 'featured_image', 'tags')
        }),
        ('Publishing', {
            'fields': ('published', 'publish_date', 'views')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['publish_articles', 'unpublish_articles']
    
    def publish_articles(self, request, queryset):
        from django.utils import timezone
        queryset.update(published=True, publish_date=timezone.now())
    publish_articles.short_description = 'Publish selected articles'
    
    def unpublish_articles(self, request, queryset):
        queryset.update(published=False)
    unpublish_articles.short_description = 'Unpublish selected articles'

