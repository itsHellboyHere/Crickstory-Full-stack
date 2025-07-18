from rest_framework import serializers
from .models import Post,SavedPost,Media
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
class MediaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Media
        fields=["id","media_type",'url']

class SavedPostSerializer(serializers.ModelSerializer):
    user = MiniUserSerializer(read_only=True)
    # media = MediaSerializer(many=True, read_only=True)
    class Meta:
        model = SavedPost
        fields = ['id', 'user', 'created_at']

class FullPostSerializer(TaggitSerializer,serializers.ModelSerializer):
    user = MiniUserSerializer(read_only=True)
    is_saved=serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()
    likes_count = serializers.IntegerField(read_only=True)  
    comments_count = serializers.IntegerField(read_only=True)
    tags = TagListSerializerField(read_only=True)
    location = serializers.CharField(read_only=True)
    media = MediaSerializer(many=True,read_only=True)
    class Meta:
        model = Post
        fields = [
            'id',
            'user',
            'title',
            'location',
            'tags',
            'media',
            'is_saved',
            'is_liked',
            'likes_count',
            'comments_count',
            'created_at',
            'updated_at',
        ]
        
        read_only_fields = ['id', 'created_at', 'updated_at']
    def get_is_saved(self,obj):
        request = self.context.get("request")
        user = request.user if request else None
        if not user or user.is_anonymous:
            return False
        return obj.saved_by.filter(user=user).exists()
    def get_is_liked(self,obj):
        request = self.context.get("request")
        user = request.user if request and request.user.is_authenticated else None
        return obj.likes.filter(user=user).exists() if user else False

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

    # def create(self, validated_data):
    #     request = self.context.get('request')
    #     user = request.user if request else None
    #     tags = validated_data.pop('tags', [])
    #     post = Post.objects.create(user=user, **validated_data)
    #     post.tags.set(tags) 
    #     return post

class UserProfileSerializer(serializers.ModelSerializer):
    media = MediaSerializer(many=True, read_only=True)
    class Meta:
        model=Post
        fields = [
            'id',
            'title',
            'media',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class SavedPostListSerializer(serializers.ModelSerializer):
    media = MediaSerializer(many=True, read_only=True)
    class Meta:
        model = Post
        fields = ['id', 'title', 'media', 'created_at']