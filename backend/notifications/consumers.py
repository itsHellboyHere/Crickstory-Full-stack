from channels.generic.websocket import AsyncWebsocketConsumer
import json

class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        user = self.scope["user"]
        if user.is_anonymous:
            await self.close()
        else:
            self.group_name = f"user_{user.id}"
            await self.channel_layer.group_add(self.group_name, self.channel_name)
            await self.accept()
            print(f"✅ Connected to WebSocket group: {self.group_name}")
    

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive(self, text_data):
        pass  # not needed for notifications

    async def send_notification(self, event):
        print(f"Sending notification to user group: {self.group_name}")
        print(f"Event Data: {event}")
        await self.send(text_data=json.dumps(event["content"]))
