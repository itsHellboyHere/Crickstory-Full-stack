from rest_framework import serializers
from .models import Post,SavedPost
from likes.models import Like
from comments.models import Comment
from django.contrib.auth import get_user_model
User = get_user_model()
from taggit.serializers import (TagListSerializerField, TaggitSerializer)

class MiniUserSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()
    name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'name', 'image']

    def get_image(self, obj):
        return getattr(obj.profile, 'image', None)

    def get_name(self, obj):
        return getattr(obj.profile, 'name', None)
class LikeSerializer(serializers.ModelSerializer):
    user = MiniUserSerializer(read_only=True)
    class Meta:
        model = Like
        fields = ['id', 'user', 'created_at']
class CommentSerializer(serializers.ModelSerializer):
    user = MiniUserSerializer(read_only=True)
    class Meta:
        model = Comment
        fields = ['id', 'content','user', 'created_at']
class SavedPostSerializer(serializers.ModelSerializer):
    user = MiniUserSerializer(read_only=True)
    class Meta:
        model = SavedPost
        fields = ['id', 'user', 'created_at']

class FullPostSerializer(TaggitSerializer,serializers.ModelSerializer):
    user = MiniUserSerializer(read_only=True)
    likes = LikeSerializer(many=True, read_only=True)
    comments = CommentSerializer(many=True, read_only=True)
    saved_by = SavedPostSerializer(many=True, read_only=True)
    tags = TagListSerializerField(read_only=True)
    location = serializers.CharField(read_only=True)
    class Meta:
        model = Post
        fields = [
            'id',
            'user',
            'title',
            'imageUrl',
            'location',
            'tags',
            'created_at',
            'updated_at',
            'likes',
            'comments',
            'saved_by',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

class PostCreateSerializer(TaggitSerializer,serializers.ModelSerializer):
    tags = TagListSerializerField(required=False)
    location = serializers.CharField(required=False,allow_blank=True)
    class Meta:
        model = Post
        fields = ['title', 'imageUrl','tags','location']

    def validate_title(self, value):
        
        if not value.strip():
            raise serializers.ValidationError("Title cannot be empty or just spaces.")
        return value

    def create(self, validated_data):
        request = self.context.get('request')
        user = request.user if request else None
        tags = validated_data.pop('tags', [])
        post = Post.objects.create(user=user, **validated_data)
        post.tags.set(tags) 
        return post

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model=Post
        fields = [
            'id',
            'title',
            'imageUrl',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class SavedPostListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Post
        fields = ['id', 'title', 'imageUrl', 'created_at']