from rest_framework import serializers
from django.contrib.auth import get_user_model

from .models import Comment

User=get_user_model()


class UserBasicSerializer(serializers.ModelSerializer):
    image=serializers.SerializerMethodField()
    name=serializers.SerializerMethodField()
    class Meta:
        model=User
        fields=['id','username','name','image']
    def get_image(self, obj):
        return getattr(obj.profile, 'image', None)

    def get_name(self, obj):
        return getattr(obj.profile, 'name', None)

class CommentSerializer(serializers.ModelSerializer):
    user= UserBasicSerializer(read_only=True)

    class Meta:
        model=Comment
        fields=['id','content','user','created_at']