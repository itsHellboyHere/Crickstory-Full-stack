from django.shortcuts import render, get_object_or_404
from rest_framework import generics, permissions, status,filters
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.utils import timezone
from django.contrib.auth import get_user_model
from .models import Follow
from .serializers import (FollowSerializer,
FollowerDetailSerializer,FollowingDetailSerializer
)
from notifications.utils import send_follow_notification

User = get_user_model()

class CustomPageNumberPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100

class FollowUserAPIView(APIView):
    permission_classes=[permissions.IsAuthenticated]

    def post(self,request,username):
        try:
            target = User.objects.get(username=username)
            if request.user == target:
                return Response({"error":"Cannot follow yourself."},status=400)
            
            follow,created= Follow.objects.get_or_create(
                follower=request.user,
                following=target
            )
            if not created and not follow.is_active:
                follow.follow()
            
                # Send real-time notification
            send_follow_notification(to_user=target, from_user=request.user)
            return Response({"success": "Following"}, status=200)

        except User.DoesNotExist:
            return Response({"error": "User not found."}, status=404)
class UnFollowUserAPIView(APIView):
    permission_classes=[permissions.IsAuthenticated]

    def post(self,request,username):
        try:
            target= User.objects.get(username=username)
            follow=Follow.objects.get(
                follower=request.user,
                following=target,
                is_active=True
            )
            follow.unfollow()
            return Response({"success":"Unfollowed"},status=200)
        except(User.DoesNotExist, Follow.DoesNotExist):
            return Response({'error': 'Not following.'}, status=400)

class FollowersListAPIView(generics.ListAPIView):
    serializer_class = FollowerDetailSerializer
    permission_classes = [permissions.AllowAny]
    pagination_class=CustomPageNumberPagination
    filter_backends = [filters.SearchFilter]
    search_fields = ['follower__username', 'follower__profile__name']
    def get_queryset(self):
        username = self.kwargs.get("username")
        user = get_object_or_404(User, username=username)
        return Follow.objects.filter(following=user, is_active=True)
    def get_serializer_context(self):
        return {'request': self.request}

class FollowingListAPIView(generics.ListAPIView):
    serializer_class = FollowingDetailSerializer
    permission_classes = [permissions.AllowAny]
    pagination_class=CustomPageNumberPagination
    filter_backends = [filters.SearchFilter]
    search_fields = ['following__username', 'following__profile__name']
    def get_queryset(self):
        username = self.kwargs.get("username")
        user=get_object_or_404(User,username=username)
        return Follow.objects.filter(follower=user, is_active=True)

    def get_serializer_context(self):
        return {'request': self.request}

class FollowedYouHistoryAPIView(generics.ListAPIView):
    serializer_class = FollowSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Follow.objects.filter(
            following=self.request.user,
            is_active=False
        ).order_by('-unfollowed_at')

class FollowStatusAPIView(APIView):
    permission_classes=[permissions.IsAuthenticated]

    def get(self,request,username):
        try:
            target=User.objects.get(username=username)
            is_following=Follow.objects.filter(
                follower=request.user,
                following=target,
                is_active=True
            ).exists()
            return Response({"is_following":is_following})
        except User.DoesNotExist:
            return Response({"error":"User not found"},status=404)
        
class FollowCountsAPIView(APIView):
    def get(self, request, username):
        try:
            user = User.objects.get(username=username)
            followers = Follow.objects.filter(following=user, is_active=True).count()
            following = Follow.objects.filter(follower=user, is_active=True).count()
            return Response({"followers": followers, "following": following})
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=404)