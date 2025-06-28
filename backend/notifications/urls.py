from django.urls import path
from .views import NotificationListAPIView, MarkNotificationSeenAPIView

urlpatterns = [
    path('', NotificationListAPIView.as_view(), name='notification-list'),
    path('<int:notification_id>/seen/', MarkNotificationSeenAPIView.as_view(), name='mark-seen'),
]
