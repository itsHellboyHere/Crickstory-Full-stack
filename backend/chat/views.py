from django.shortcuts import render
from django.db import models

from .utils import can_message
from .models import Message ,Room,MessageRequest
from .serializers import MessageSerializer,RoomSerializer,MessageRequestSerializer
from django.contrib.auth import get_user_model
from rest_framework.views import APIView
from rest_framework import permissions,status,generics
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
import cloudinary.uploader
from rest_framework.pagination import PageNumberPagination

User = get_user_model()

class RoomPagination(PageNumberPagination):
    page_size = 4


class RoomListCreateAPIView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = RoomSerializer
    pagination_class = RoomPagination

    def get_queryset(self):
        return Room.objects.filter(members=self.request.user).prefetch_related('members', 'messages')

    def create(self, request, *args, **kwargs):
        room_type = request.data.get('room_type')
        member_ids = request.data.get('members', [])
        name = request.data.get('name')

        try:
            member_ids = list(map(int, member_ids))
        except (ValueError, TypeError):
            return Response({"error": "Invalid member IDs"}, status=status.HTTP_400_BAD_REQUEST)

        if request.user.id not in member_ids:
            member_ids.append(request.user.id)

        if room_type == "dm":
                    # Self-DM
            if len(member_ids) == 1 and member_ids[0] == request.user.id:
                existing = Room.objects.filter(room_type="dm", members=request.user).annotate(count=models.Count('members')).filter(count=1).first()
                if existing:
                    return Response(RoomSerializer(existing, context={'request': request}).data)

                room = Room.objects.create(room_type="dm")
                room.members.set([request.user.id])
                return Response(RoomSerializer(room, context={'request': request}).data, status=201)
            if len(member_ids) != 2:

                return Response({"error": "DMs must have exactly 2 members"}, status=status.HTTP_400_BAD_REQUEST)

            sender = request.user
            receiver_id = next(uid for uid in member_ids if uid != sender.id)
            try:
                receiver = User.objects.get(id=receiver_id)
            except User.DoesNotExist:
                return Response({"error": "Invalid receiver ID"}, status=404)

            if can_message(sender, receiver):
                existing = Room.objects.filter(room_type="dm")
                for room in existing:
                    if sorted([u.id for u in room.members.all()]) == sorted(member_ids):
                        return Response(RoomSerializer(room, context={'request': request}).data)

                room = Room.objects.create(room_type="dm")
                room.members.set(member_ids)
                return Response(RoomSerializer(room, context={'request': request}).data, status=201)

            else:
                req, created = MessageRequest.objects.get_or_create(sender=sender, receiver=receiver)
                return Response({
                    "message_request": True,
                    "request_id": req.id,
                    "sender_id": sender.id,
                    "receiver_id": receiver.id,
                }, status=202)

        if room_type == 'group' and not name:
            return Response({"error": "Group name is required"}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(id__in=member_ids).count() != len(member_ids):
            return Response({"error": "Some user IDs are invalid"}, status=status.HTTP_400_BAD_REQUEST)

        room = Room.objects.create(room_type=room_type, name=name)
        room.members.set(member_ids)
        return Response(RoomSerializer(room, context={'request': request}).data, status=status.HTTP_201_CREATED)

class RoomDetailAPIView(generics.RetrieveAPIView):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer
    lookup_field = 'id'  
class ChatMediaUploadView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, *args, **kwargs):
        file = request.FILES.get('file')
        room_id = request.data.get('room_id')

        if not file or not room_id:
            return Response({"error": "Both file and room_id are required."}, status=400)

        if file.size > 50 * 1024 * 1024:
            return Response({"error": "File must be under 50MB."}, status=400)

        # Check room exists and user is a member
        try:
            room = Room.objects.get(id=int(room_id))
            if request.user not in room.members.all():
                return Response({"error": "You are not a member of this room."}, status=403)
        except Room.DoesNotExist:
            return Response({"error": "Room does not exist."}, status=404)

        content_type = file.content_type
        if "image" in content_type:
            message_type = "image"
        elif "video" in content_type:
            message_type = "video"
        else:
            message_type = "file"

        # Decide resource_type
        if message_type in ["image", "video"]:
            resource_type = "auto"
        else:
            resource_type = "raw"

        try:
            result = cloudinary.uploader.upload(
                file,
                resource_type=resource_type,
                folder="chat_files"
            )

            return Response({
                "file_url": result["secure_url"],
                "message_type": message_type,
                "room_id": room_id
            }, status=201)

        except Exception as e:
            return Response({"error": f"Upload failed: {str(e)}"}, status=500)

class MessageListAPIView(generics.ListAPIView):
    permission_classes=[permissions.IsAuthenticated]
    serializer_class=MessageSerializer

    def get_queryset(self):
        room_id= self.kwargs['room_id']
        user = self.request.user

        try:
            room= Room.objects.get(id=room_id)
            if user not in room.members.all():
                return Message.objects.none()
        except Room.DoesNotExist:
            return Message.objects.none()
        
        return Message.objects.filter(room_id=room_id).order_by('-created_at')
    
class MessageRequestListView(APIView):
    permission_classes=[permissions.IsAuthenticated]

    def get(self, request):
        requests = MessageRequest.objects.filter(receiver=request.user,is_accepted=False)
        return Response(MessageRequestSerializer(requests,many=True).data)

class AcceptMessageRequestView(APIView):
    permission_classes=[permissions.IsAuthenticated]

    def post(self,request,request_id):
        try:
            msg_request = MessageRequest.objects.get(id=request_id,receiver=request.user)
            msg_request.is_accepted = True
            msg_request.save()

            room = Room.objects.create(room_type="dm")
            room.members.set([msg_request.sender.id,msg_request.receiver.id])

            return Response({"room_id":room.id})
        
        except MessageRequest.DoesNotExist:
            return Response({"error": "Request not found"}, status=404)

class RejectMessageRequestView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, request_id):
        try:
            msg_request = MessageRequest.objects.get(id=request_id, receiver=request.user)
            msg_request.delete()
            return Response({"message": "Request rejected"})
        except MessageRequest.DoesNotExist:
            return Response({"error": "Request not found"}, status=404)
