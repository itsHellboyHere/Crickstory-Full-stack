
from django.urls import path
from .views import (
    FollowUserAPIView, UnFollowUserAPIView,
    FollowersListAPIView, FollowingListAPIView,
    FollowedYouHistoryAPIView,FollowStatusAPIView,FollowCountsAPIView,
    RemoveFollowerAPIView,
    AcceptFollowRequestAPIView,
    RejectFollowRequestAPIView,
    FollowRequestsListAPIView,
    SentFollowRequestsAPIView,
    CancelFollowRequestAPIView
)

urlpatterns = [
    path('follow/<str:username>/', FollowUserAPIView.as_view(), name='follow-user'),
    path('unfollow/<str:username>/', UnFollowUserAPIView.as_view(), name='unfollow-user'),
    path('followers/<str:username>/', FollowersListAPIView.as_view(), name='followers'),
    path('following/<str:username>/', FollowingListAPIView.as_view(), name='following'),
    path('unfollowed-you/', FollowedYouHistoryAPIView.as_view(), name='unfollowed-you'),
    path('remove-follower/<str:username>/',RemoveFollowerAPIView.as_view(),name="remove-follower"),
    path('<str:username>/is-following/', FollowStatusAPIView.as_view(), name='is-following'),
    path('<str:username>/follow-counts/', FollowCountsAPIView.as_view(), name='follow-counts'),
    path('follow-requests/', FollowRequestsListAPIView.as_view(), name='follow-requests'),
    path('follow-request/sent/', SentFollowRequestsAPIView.as_view(), name='sent-follow-request'),
    path('follow-request/<str:username>/accept/', AcceptFollowRequestAPIView.as_view(), name='accept-follow-request'),
    path('follow-request/<str:username>/reject/', RejectFollowRequestAPIView.as_view(), name='reject-follow-request'),
    path('follow-request/<str:username>/cancel/', CancelFollowRequestAPIView.as_view(), name='cancel-follow-request'),
]
