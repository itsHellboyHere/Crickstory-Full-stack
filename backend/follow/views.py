from django.shortcuts import render, get_object_or_404
from rest_framework import generics, permissions, status,filters
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.utils import timezone
from django.contrib.auth import get_user_model
from .models import Follow,FollowRequest
from posts.utils import send_recent_posts_to_new_follower
from .serializers import (FollowSerializer,
FollowerDetailSerializer,FollowingDetailSerializer
,UserBasicSerializer
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
            follow = Follow.objects.filter(follower=request.user, following=target).first()
            is_private = hasattr(target,'profile') and target.profile.is_private
            # private account
            if is_private:
                # check already following
                if follow and follow.is_active:
                    return Response({"info": "Already following."}, status=200)
                # Already requested

                if FollowRequest.objects.filter(from_user=request.user, to_user=target).exists():
                    return Response({"info": "Follow request already sent."}, status=200)
                
                # send request 
                FollowRequest.objects.create(from_user=request.user, to_user=target)
                send_follow_notification(to_user=target, from_user=request.user, is_request=True)
                return Response({"success": "Follow request sent."}, status=200)

            else:
                # public account -> follow directly
                if follow:
                    if not follow.is_active:
                        follow.follow() # reactivate
                        send_recent_posts_to_new_follower(follow)
                else:
                    follow=Follow.objects.create(
                           follower=request.user,
                    following=target,
                    is_active=True
                    )
                    send_recent_posts_to_new_follower(follow)

                # Send real-time notification
            send_follow_notification(to_user=target, from_user=request.user)
            return Response({"success": "Following"}, status=200)

        except User.DoesNotExist:
            return Response({"error": "User not found."}, status=404)

class AcceptFollowRequestAPIView(APIView):
    permission_classes=[permissions.IsAuthenticated]

    def post(self,request,username):
        try:
            from_user = User.objects.get(username=username)
            follow_request = FollowRequest.objects.get(from_user=from_user, to_user=request.user)
            follow = Follow.objects.filter(
                follower = from_user,
                following = request.user
            ).first()
            if follow:
                if not follow.is_active:
                    follow.follow()
                    send_recent_posts_to_new_follower(follow)
            else:
                follow=Follow.objects.create(follower=from_user, following=request.user, is_active=True)
                send_recent_posts_to_new_follower(follow)
            follow_request.delete()
            return Response({"success": "Request accepted."})
        except(User.DoesNotExist , FollowRequest.DoesNotExist):
            return Response({"error": "Request not found."}, status=404)

class RejectFollowRequestAPIView(APIView):
    permission_classes=[permissions.IsAuthenticated]

    def post(self,request,username):
        try:
            from_user = User.objects.get(username=username)
            follow_request = FollowRequest.objects.get(from_user=from_user,to_user = request.user)
            follow_request.delete()
            return Response({"success": "Request rejected."})

        except(User.DoesNotExist ,FollowRequest.DoesNotExist):
            return Response({"error": "Request not found."}, status=404)
class CancelFollowRequestAPIView(APIView):
    permission_classes=[permissions.IsAuthenticated]

    def post(self,request,username):
        try:
            to_user = User.objects.get(username=username)
            follow_request = FollowRequest.objects.get(from_user=request.user, to_user=to_user)
            follow_request.delete()
            return Response({"success": "Follow request cancelled."})
        except(User.DoesNotExist,FollowRequest.DoesNotExist):
            return Response({"error":"Request not found."})

class FollowRequestsListAPIView(generics.ListAPIView):
    serializer_class = UserBasicSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return User.objects.filter(sent_follow_requests__to_user=self.request.user)

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
        
class RemoveFollowerAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self,request, username):
        try:    
            follower = User.objects.get(username=username)
            follow= Follow.objects.get(
                follower=follower,
                following= request.user,
                is_active=True
            )
            follow.unfollow()
            return Response({"success": "Removed follower"}, status=200)
        except (User.DoesNotExist, Follow.DoesNotExist):
            return Response({'error': 'This user is not following you.'}, status=400)
        

class SentFollowRequestsAPIView(generics.ListAPIView):
    serializer_class = UserBasicSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return User.objects.filter(
            received_follow_requests__from_user=self.request.user
        )


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