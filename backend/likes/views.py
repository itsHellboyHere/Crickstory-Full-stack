from django.shortcuts import get_object_or_404
from .models import Like
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from posts.models import Post
from notifications.utils import like_notification
class ToggleLikeView(APIView):
    permission_classes=[IsAuthenticated]

    def post(self,request,post_id):
        user = request.user

        post = get_object_or_404(Post, pk=post_id)
        
        liked_post = Like.objects.filter(user=user,post=post).first()

        if liked_post:
            liked_post.delete()
            liked=False
           
        else:
            Like.objects.create(user=user,post=post)
            liked=True
            if post.user != user:
                like_notification(to_user=post.user, from_user=user,post=post)

        total_likes = Like.objects.filter(post=post).count()

        return Response({"liked":liked, "total_likes": total_likes},status=status.HTTP_200_OK)
