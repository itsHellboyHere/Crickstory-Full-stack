from rest_framework.serializers import ModelSerializer, CharField
from .models import Profile
from follow.models import Follow,FollowRequest
from dj_rest_auth.registration.serializers import RegisterSerializer
from rest_framework import serializers
from django.core.validators import RegexValidator
from django.contrib.auth import get_user_model
from django.db import transaction
from allauth.account.adapter import get_adapter
from allauth.account.utils import setup_user_email
from allauth.account.models import EmailAddress
from allauth.account import app_settings as allauth_account_settings
User = get_user_model()
class ProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', required=False)
    user_id = serializers.IntegerField(source='user.id', read_only=True)
    is_following = serializers.SerializerMethodField()
    has_requested = serializers.SerializerMethodField()
    is_me = serializers.SerializerMethodField()
    class Meta:
        model = Profile
        fields = ['user_id','username', 'name', 'bio', 'location', 'birth_date', 'image','is_private','is_following', 'has_requested', 'is_me','phone_number']
        extra_kwargs = {
            'image': {'required': False, 'allow_null': True},
            'birth_date': {'required': False},
        }
    def get_is_following(self,obj):
        request = self.context.get("request")
        if not request or request.user.is_anonymous:
            return False
        return Follow.objects.filter(
            follower=request.user,
            following=obj.user,
            is_active=True
        ).exists()
    
    def get_has_requested(self,obj):
        request = self.context.get("request")
        if not request or request.user.is_anonymous:
            return False
        return FollowRequest.objects.filter(
            from_user=request.user,
            to_user=obj.user
        ).exists()
    
    def get_is_me(self, obj):
        request = self.context.get("request")
        return request and obj.user == request.user
    
    def validate_username(self, value):
        # Exclude current user from check
        if User.objects.exclude(pk=self.instance.user.pk).filter(username=value).exists():
            raise serializers.ValidationError("This username is already taken.")
        return value

    def update(self, instance, validated_data):
        user_data = validated_data.pop('user', {})
        username = user_data.get('username')

        # Update username
        if username:
            instance.user.username = username
            instance.user.save()

        # Update profile fields
        for attr, val in validated_data.items():
            setattr(instance, attr, val)
        instance.save()

        return instance

class CustomRegisterSerializer(RegisterSerializer):
    email = serializers.EmailField(required=True)

    def validate_email(self, email):
        email = get_adapter().clean_email(email)

        # Check if the email exists in the User table
        if User.objects.filter(email__iexact=email).exists():
            raise serializers.ValidationError("A user with that email already exists.")

        # Additionally check allauth EmailAddress table if using verification
        if allauth_account_settings.UNIQUE_EMAIL:
            if EmailAddress.objects.filter(email__iexact=email).exists():
                raise serializers.ValidationError("That email address is already registered.")

        return email

    @transaction.atomic
    def save(self, request):
        user = super().save(request)
        # Do NOT access or assign phone_number here anymore
        return user

