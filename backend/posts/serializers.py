from rest_framework import serializers
from .models import Post,SavedPost
from likes.models import Like
from comments.models import Comment
from django.contrib.auth import get_user_model
User = get_user_model()


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

class FullPostSerializer(serializers.ModelSerializer):
    user = MiniUserSerializer(read_only=True)
    likes = LikeSerializer(many=True, read_only=True)
    comments = CommentSerializer(many=True, read_only=True)
    saved_by = SavedPostSerializer(many=True, read_only=True)
    class Meta:
        model = Post
        fields = [
            'id',
            'user',
            'title',
            'imageUrl',
            'created_at',
            'updated_at',
            'likes',
            'comments',
            'saved_by',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

class PostCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Post
        fields = ['title', 'imageUrl']

    def validate_title(self, value):
        
        if not value.strip():
            raise serializers.ValidationError("Title cannot be empty or just spaces.")
        return value

    def create(self, validated_data):
        request = self.context.get('request')
        user = request.user if request else None
        return Post.objects.create(user=user, **validated_data)

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