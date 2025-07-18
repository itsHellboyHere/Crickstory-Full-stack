from .consumers import CommentConsumer
from django.urls import re_path

websocket_urlpatterns = [
    re_path(r'ws/posts/(?P<post_id>\d+)/comments/$', CommentConsumer.as_asgi()),
]