from django.shortcuts import render,get_object_or_404
from rest_framework import generics
from rest_framework import permissions
from .serializers import CommentSerializer
from posts.models import Post
from .models import Comment
from notifications.utils import comment_notification
class CommentListCreateAPIView(generics.ListCreateAPIView):
    permission_classes=[permissions.IsAuthenticatedOrReadOnly]
    serializer_class=CommentSerializer

    def get_queryset(self):
        post_id=self.kwargs["post_id"]
        return Comment.objects.filter(post__id=post_id).order_by('-created_at')

    def perform_create(self, serializer):
        post_id=self.kwargs["post_id"]
        post=get_object_or_404(Post,id=post_id)
        serializer.save(user=self.request.user,post=post)
        if post.user != self.request.user:
            comment_notification(to_user=post.user, from_user=self.request.user,post=post)
