from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Follow

User=get_user_model()

class UserBasicSerializer(serializers.ModelSerializer):
    image=serializers.SerializerMethodField()
    name= serializers.SerializerMethodField()

    class Meta:
        model = User
        fields=['id', 'username', 'name', 'image']
    def get_image(self, obj):
        return getattr(obj.profile, 'image', None)

    def get_name(self, obj):
        return getattr(obj.profile, 'name', None)

class FollowSerializer(serializers.ModelSerializer):
    follower = UserBasicSerializer(read_only=True)
    following = UserBasicSerializer(read_only=True)

    class Meta:
        model = Follow
        fields=['id', 'follower', 'following', 'created_at', 'unfollowed_at', 'is_active']

class FollowerDetailSerializer(serializers.ModelSerializer):
    follower = UserBasicSerializer(read_only=True)
    is_following = serializers.SerializerMethodField()

    class Meta:
        model = Follow
        fields = ['id', 'follower', 'created_at', 'is_following']

    def get_is_following(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Follow.objects.filter(
                follower=request.user,
                following=obj.follower,
                is_active=True
            ).exists()
        return False


class FollowingDetailSerializer(serializers.ModelSerializer):
    following = UserBasicSerializer(read_only=True)
    is_following = serializers.SerializerMethodField()

    class Meta:
        model = Follow
        fields = ['id', 'following', 'created_at', 'is_following']

    def get_is_following(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Follow.objects.filter(
                follower=request.user,
                following=obj.following,
                is_active=True
            ).exists()
        return False