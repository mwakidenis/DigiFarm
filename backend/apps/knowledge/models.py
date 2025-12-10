from django.db import models
from django.utils.text import slugify
from apps.users.models import User


class Category(models.Model):
    """Category model for knowledge articles."""
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(unique=True, blank=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'knowledge_categories'
        verbose_name_plural = 'Categories'
        ordering = ['name']
    
    def __str__(self):
        return self.name
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


class Article(models.Model):
    """Article model for knowledge hub."""
    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True, blank=True)
    body = models.TextField(help_text='Markdown supported')
    author = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='articles')
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True, related_name='articles')
    tags = models.CharField(
        max_length=500,
        blank=True,
        help_text='Comma-separated tags'
    )
    published = models.BooleanField(default=False)
    publish_date = models.DateTimeField(null=True, blank=True)
    featured_image = models.ImageField(upload_to='articles/', blank=True, null=True)
    views = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'articles'
        indexes = [
            models.Index(fields=['slug']),
            models.Index(fields=['published', 'publish_date']),
            models.Index(fields=['category']),
        ]
        ordering = ['-publish_date', '-created_at']
    
    def __str__(self):
        return self.title
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        if self.published and not self.publish_date:
            from django.utils import timezone
            self.publish_date = timezone.now()
        super().save(*args, **kwargs)
    
    def get_tags_list(self):
        """Return tags as a list."""
        if self.tags:
            return [tag.strip() for tag in self.tags.split(',') if tag.strip()]
        return []

