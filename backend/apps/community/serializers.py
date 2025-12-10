from rest_framework import serializers
from .models import Post, Comment
from apps.users.serializers import UserSerializer

class CommentSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.first_name', read_only=True)
    author_email_prefix = serializers.SerializerMethodField()
    
    class Meta:
        model = Comment
        fields = ['id', 'post', 'author', 'author_name', 'author_email_prefix', 'content', 'created_at']
        read_only_fields = ['id', 'author', 'created_at']

    def get_author_email_prefix(self, obj):
        return obj.author.email.split('@')[0]

class PostSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.first_name', read_only=True)
    author_email_prefix = serializers.SerializerMethodField()
    likes_count = serializers.IntegerField(source='likes.count', read_only=True)
    comments_count = serializers.IntegerField(source='comments.count', read_only=True)
    is_liked = serializers.SerializerMethodField()
    comments = CommentSerializer(many=True, read_only=True)

    class Meta:
        model = Post
        fields = ['id', 'author', 'author_name', 'author_email_prefix', 'title', 'content', 'tags', 
                  'likes_count', 'comments_count', 'is_liked', 'comments', 'created_at']
        read_only_fields = ['id', 'author', 'likes_count', 'comments_count', 'is_liked', 'created_at']

    def get_author_email_prefix(self, obj):
        return obj.author.email.split('@')[0]

    def get_is_liked(self, obj):
        user = self.context.get('request').user
        if user and user.is_authenticated:
            return user in obj.likes.all()
        return False
