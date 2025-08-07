

import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async

class PostFeedConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        if self.scope["user"].is_anonymous:
            await self.close()
            return
        
        self.user = self.scope["user"]
        self.group_name = f"feed_user_{self.user.id}"

        # Join group specific to this user
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()
        print(f"✅ Connected to WebSocket group-posts: {self.group_name}")

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive(self, text_data):
        # Not expecting any message from client
        pass

    async def new_post(self, event):
        await self.send(text_data=json.dumps({
            "type": "new_post",
            "post": event["post"]
        }))

    async def bulk_posts(self, event):
        # print("👀 bulk_posts handler called!", event)
        await self.send(text_data=json.dumps({
            "type": "bulk_posts",
            "posts": event["posts"]
        }))

