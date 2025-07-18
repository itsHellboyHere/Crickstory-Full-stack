from channels.generic.websocket import AsyncWebsocketConsumer
import json
import logging
logger = logging.getLogger(__name__)

class CommentConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        user = self.scope["user"]
        # print(f"Authenticated: {user.is_authenticated}")
        # print(f"Session: {self.scope.get('session')}")
        # print(f"Headers: {self.scope.get('headers')}")
        if user.is_anonymous:
            # logger.warning("❌ Anonymous user connection rejected")
            await self.close()
        else:
            self.post_id = self.scope["url_route"]['kwargs']['post_id']
            self.group_name = f'post_{self.post_id}_comments'
            
          
            
            await self.channel_layer.group_add(self.group_name, self.channel_name)
            await self.accept()
            logger.info(f"✅ Connection accepted for group {self.group_name}")

    async def disconnect(self, close_code):
     
        await self.channel_layer.group_discard(self.group_name, self.channel_name)
        
    async def receive(self, text_data=None, bytes_data=None):
        logger.warning(f"📥 Fallback receive: {text_data}")


    async def new_comment(self,event):
        logger.info(f"📢 Sending comment: {event['comment']}")
        await self.send(text_data=json.dumps(event['comment']))