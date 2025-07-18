from django.shortcuts import render,get_object_or_404
from rest_framework import generics
from rest_framework import permissions
from .serializers import CommentSerializer
from posts.models import Post
from .models import Comment
from notifications.utils import comment_notification
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
import logging
logger = logging.getLogger(__name__)

class CommentListCreateAPIView(generics.ListCreateAPIView):
    permission_classes=[permissions.IsAuthenticatedOrReadOnly]
    serializer_class=CommentSerializer

    def get_queryset(self):
        post_id=self.kwargs["post_id"]
        return Comment.objects.filter(post__id=post_id).order_by('-created_at')

    def perform_create(self, serializer):
        post_id=self.kwargs["post_id"]
        post=get_object_or_404(Post,id=post_id)
        comment=serializer.save(user=self.request.user,post=post)

        try:
            channel_layer = get_channel_layer()
            logger.info(f"Attempting to send to group: post_{post_id}_comments")
            logger.info(f"Channel layer: {channel_layer}")
            
            comment_data = CommentSerializer(comment).data
            # logger.info(f"Comment data to send: {comment_data}")
            
            async_to_sync(channel_layer.group_send)(
                f'post_{post_id}_comments',
                {
                    "type": "new.comment",
                    "comment": comment_data
                }
            )
            # logger.info("✅ Message sent to channel layer")
        except Exception as e:
            logger.error(f"❌ Error sending to channel layer: {e}")
            raise
        if post.user != self.request.user:
            comment_notification(to_user=post.user, from_user=self.request.user,post=post)
