from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from .models import Notification
from .serializers import NotificationSerializer

class NotificationListAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        seen_filter = request.query_params.get('seen')
        qs = Notification.objects.filter(recipient=request.user)
        if seen_filter == 'false':
            qs = qs.filter(is_seen=False)
        return Response(NotificationSerializer(qs, many=True).data)

class MarkNotificationSeenAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, notification_id):
        try:
            notif = Notification.objects.get(id=notification_id, recipient=request.user)
            notif.is_seen = True
            notif.save()
            return Response({"success": True})
        except Notification.DoesNotExist:
            return Response({"error": "Not found"}, status=status.HTTP_404_NOT_FOUND)
