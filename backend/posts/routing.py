from django.urls import re_path
from .consumers import PostFeedConsumer

websocket_urlpatterns = [
    re_path(r"ws/posts/feed/$", PostFeedConsumer.as_asgi()),
]