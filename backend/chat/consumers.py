from channels.generic.websocket import AsyncWebsocketConsumer
import json
from channels.db import database_sync_to_async
from .models import Room, Message, MessageRequest
from .serializers import MessageSerializer
from django.contrib.auth import get_user_model
from .utils import can_message

User = get_user_model()

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_id = self.scope['url_route']['kwargs']['room_id']
        self.user = self.scope["user"]
        print("🧪 CONNECT:", self.user)
        if self.user.is_anonymous:
            print("❌ Anonymous user")
            await self.close()
            return

        is_member = await self.check_membership(self.room_id, self.user)
        print("👥 Membership:", is_member)
        if not is_member:
            print("❌ Not a member of room")
            await self.close()
            return

        self.room_group_name = f'room_{self.room_id}'
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()
        print("✅ WebSocket accepted")

    async def disconnect(self, code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        content = data.get("message")
        message_type = data.get("message_type", "text")
        file_url = data.get("file_url", None)
        print("receive-message ",content)
        sender = self.user
        room_id = self.room_id

        allowed, recipient = await self.can_user_message(room_id, sender)
        if allowed:
            message_data = await self.save_message(room_id, sender, content, message_type, file_url)
            await self.channel_layer.group_send(self.room_group_name, {
                "type": "chat.message",
                "message": message_data,
            })
        else:
            await self.create_message_request(sender, recipient, content, message_type, file_url)
            await self.send(text_data=json.dumps({"message_request_sent": True}))

    async def chat_message(self, event):
        print("event ",event)
        await self.send(text_data=json.dumps(event["message"]))

    @database_sync_to_async
    def check_membership(self, room_id, user):
        try:
            room = Room.objects.get(id=room_id)
            return room.members.filter(id=user.id).exists()
        except Room.DoesNotExist:
            return False

    @database_sync_to_async
    def save_message(self, room_id, sender, content, message_type, file_url):
        room = Room.objects.get(id=room_id)
        message = Message.objects.create(
            room=room,
            sender=sender,
            content=content,
            message_type=message_type,
            file_url=file_url
        )
        return MessageSerializer(message).data

    @database_sync_to_async
    def can_user_message(self, room_id, sender):
        room = Room.objects.get(id=room_id)
        members = room.members.exclude(id=sender.id)
        if not members.exists():
            return False, None
        recipient = members.first()
        return can_message(sender, recipient), recipient

    @database_sync_to_async
    def create_message_request(self, sender, receiver, content, message_type, file_url):
        return MessageRequest.objects.create(
            sender=sender,
            receiver=receiver,
            content=content,
            message_type=message_type,
            file_url=file_url
        )
