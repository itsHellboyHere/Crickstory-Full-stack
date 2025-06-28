# urls.py
from django.urls import path
from .views import CommentListCreateAPIView

urlpatterns = [
    path('<int:post_id>/comments/', CommentListCreateAPIView.as_view(), name='post-comments'),
]
