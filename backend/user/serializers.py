from rest_framework.serializers import ModelSerializer, CharField
from .models import Profile
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

    class Meta:
        model = Profile
        fields = ['username', 'name', 'bio', 'location', 'birth_date', 'image']
        extra_kwargs = {
            'image': {'required': False, 'allow_null': True},
            'birth_date': {'required': False},
        }

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
    phone_number = serializers.CharField(
        required=False,
        allow_blank=True,
        validators=[
            RegexValidator(
                regex=r'^\+?\d{10,15}$',
                message="Phone number must be in the format: '+999999999'. Up to 15 digits allowed."
            )
        ]
    )

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
    
    def get_cleaned_data(self):
        data = super().get_cleaned_data()
        data['phone_number'] = self.validated_data.get('phone_number', '')
        return data

    @transaction.atomic
    def save(self, request):
        user = super().save(request)
        user.phone_number = self.get_cleaned_data().get('phone_number')
        user.save()
        return user

