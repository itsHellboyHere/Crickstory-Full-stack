from rest_framework import serializers
from .models import Notification

class NotificationSerializer(serializers.ModelSerializer):
    sender_username = serializers.CharField(source="sender.username", read_only=True)

    class Meta:
        model = Notification
        fields = ['id', 'message', 'type', 'is_seen', 'created_at', 'sender_username', 'extra_data']
