from rest_framework import serializers
from .models import Room, Message,MessageRequest
from django.contrib.auth import get_user_model

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    image=serializers.SerializerMethodField()
    name = serializers.SerializerMethodField()
    class Meta:
        model =User
        fields=['id','username','name','image']
    
    def get_name(self,obj):
        return getattr(obj.profile, 'name', None)
    def get_image(self,obj):
        return getattr(obj.profile,'image',None)

class MessageSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)
    class Meta:
        model=Message
        fields=['id',
            'room',
            'sender',
            'content',
            'file_url',
            'message_type',
            'created_at',
            'updated_at'
            ]

    
class RoomSerializer(serializers.ModelSerializer):
    members = UserSerializer(many=True, read_only=True)
    last_message = serializers.SerializerMethodField()
    display_name = serializers.SerializerMethodField()
    display_avatar = serializers.SerializerMethodField()

    class Meta:
        model = Room
        fields = [
            'id',
            'room_type',
            'name',
            'members',
            'created_at',
            'last_message',
            'display_name',
            'display_avatar'
        ]

    def get_last_message(self, obj):
        last = obj.messages.order_by('-created_at').first()
        if last:
            return MessageSerializer(last).data
        return None

    def get_display_name(self, obj):
        request = self.context.get("request")
        if obj.room_type == "group":
            return obj.name
        # DM logic: show other user's name
        if request:
            user = request.user
            other = next((u for u in obj.members.all() if u != user), None)
            if other:
                return getattr(other.profile, "name", other.username)
        return "Chat"

    def get_display_avatar(self, obj):
        request = self.context.get("request")
        if obj.room_type == "group":
            return None  # you can add group avatars later
        if request:
            user = request.user
            other = next((u for u in obj.members.all() if u != user), None)
            if other and hasattr(other, "profile"):
                return other.profile.image if other.profile.image else ""
        return None
class MessageRequestSerializer(serializers.ModelSerializer):
    sender = UserSerializer()
    class Meta :
        model=MessageRequest
        fields=['id','sender','content','message_type','file_url','created_at']
        
