from django.urls import path
from .views import (
    RoomListCreateAPIView,
    ChatMediaUploadView,
    MessageListAPIView,
    MessageRequestListView,
    AcceptMessageRequestView,
    RejectMessageRequestView,
    RoomDetailAPIView
)

urlpatterns = [
    path('rooms/', RoomListCreateAPIView.as_view(), name='room-list-create'),
    path('rooms/<int:id>/', RoomDetailAPIView.as_view(), name='room-detail'),
    path('upload/', ChatMediaUploadView.as_view(), name='chat-media-upload'),
    path('rooms/<int:room_id>/messages/', MessageListAPIView.as_view(), name='room-messages'),

    #  Message Requests APIs
    path('message-requests/', MessageRequestListView.as_view(), name='message-request-list'),
    path('message-requests/<int:request_id>/accept/', AcceptMessageRequestView.as_view(), name='accept-message-request'),
    path('message-requests/<int:request_id>/reject/', RejectMessageRequestView.as_view(), name='reject-message-request'),
]
