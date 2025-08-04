from django.db import models
from django.conf import settings

class Room(models.Model):
    ROOM_TYPE_CHOICES = (
        ('dm', 'Direct Message'),
        ('group', 'Group Chat'),
    )
    room_type = models.CharField(max_length=10, choices=ROOM_TYPE_CHOICES)
    name = models.CharField(max_length=255, blank=True, null=True)
    members = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='chat_rooms')
    created_at = models.DateTimeField(auto_now_add=True)

    def get_group_name(self):
        return f"room_{self.id}"


class Message(models.Model):
    MESSAGE_TYPES = [
        ('text', 'Text'),
        ('image', 'Image'),
        ('video', 'Video'),
        ('file', 'File'),
    ]
    room = models.ForeignKey(Room, related_name='messages', on_delete=models.CASCADE)
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    content = models.TextField(blank=True, null=True)
    file_url = models.URLField(blank=True, null=True)
    message_type = models.CharField(max_length=10, choices=MESSAGE_TYPES, default='text')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.sender.username}: {self.message_type} in room {self.room.id}"

class MessageRequest(models.Model):
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sent_requests')
    receiver = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='received_requests')
    content = models.TextField(blank=True, null=True)
    file_url = models.URLField(blank=True, null=True)
    message_type = models.CharField(max_length=10, choices=Message.MESSAGE_TYPES, default='text')
    is_accepted = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)