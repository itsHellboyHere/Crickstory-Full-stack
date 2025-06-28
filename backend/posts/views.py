from django.shortcuts import get_object_or_404, render
from .serializers import PostCreateSerializer,FullPostSerializer,UserProfileSerializer,SavedPostListSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework import generics
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
import cloudinary.uploader
from django.db.models import Count
from .models import Post,SavedPost
from rest_framework import status
from rest_framework.pagination import PageNumberPagination
from follow.models import Follow
from django.contrib.auth import get_user_model
User=get_user_model()

class CreatePostView(APIView):
    permission_classes=[IsAuthenticated]
    parser_classes=[MultiPartParser, FormParser]

    def post(self,request,*args,**kwargs):
        title = request.data.get('title')
        image_file = request.FILES.get("file")

        if not title:
            return Response({"error": "Title is required."}, status=400)
        if not image_file:
            return Response({"error": "Image file is required."}, status=400)
        
                # Validate file size
        if image_file.size > 8 * 1024 * 1024:
            return Response({"error": "Image size should be less than 8MB."}, status=400)
        
        try :
            # Uplaod to cloudinary
            result = cloudinary.uploader.upload(
                image_file,
                folder="post_images",
                transformation=[
                    {"quality": "auto:eco"},
              
                    # {"width": 1080, "crop": "limit"},
                ]
            )
            image_url = result["secure_url"]
        except Exception as e:
            return Response({"error": f"Cloudinary error: {str(e)}"}, status=500)
        
        data={
            "title":title,
            "imageUrl":image_url,
        }
        serializer= PostCreateSerializer(data=data,context={"request":request})
        if serializer.is_valid():
            post = serializer.save()
            return Response({
                "message": "Post created successfully.",
                "post_id": post.id,
                "imageUrl": post.imageUrl
            }, status=201)
        return Response(serializer.errors, status=400)



from rest_framework.pagination import CursorPagination

class FeedCursorPagination(CursorPagination):
    page_size = 10
    ordering = '-created_at'  # Consistent and unique if post times vary


class CustomPageNumberPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

class FeedPostsView(generics.ListAPIView):

    serializer_class = FullPostSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = FeedCursorPagination

    def get_queryset(self):
        user = self.request.user

        # Force evaluation of the queryset
        following_ids = list(Follow.objects.filter(
            follower=user,
            is_active=True
        ).values_list('following__id', flat=True))

        if not following_ids:
            # No followed users, show trending/top posts (optional)
            return Post.objects.all().select_related('user').prefetch_related(
                'likes__user',
                'saved_by__user',
                'comments__user'
            ).order_by('-created_at')
        
        following_ids.append(user.id)
        # Show only posts from followed users
        return Post.objects.filter(user__id__in=following_ids).select_related('user').prefetch_related(
            'likes__user',
            'saved_by__user',
            'comments__user'
        ).order_by('-created_at').distinct()
    
class PostDetailView(generics.RetrieveAPIView):
    serializer_class = FullPostSerializer
    permission_classes = []  # Public access
    queryset = Post.objects.all()
    lookup_field = 'id'




class ToggleSaveView(APIView):
    permission_classes=[IsAuthenticated]

    def post(seld,request,post_id):
        user = request.user 

        try :
            post = Post.objects.get(pk=post_id)
        except Post.DoesNotExist:
            return Response({"error": "Post not found."}, status=status.HTTP_404_NOT_FOUND)
        
        saved_post = SavedPost.objects.filter(user=user,post=post).first()

        if saved_post:
            saved_post.delete()
            saved=False
        else:
            SavedPost.objects.create(user=user,post=post)
            saved=True
        return Response({"saved": saved}, status=status.HTTP_200_OK)


class UserProfilePostAPIView(generics.ListAPIView):
    permission_classes=[IsAuthenticated]
    serializer_class=UserProfileSerializer

    def get_queryset(self):
        username = self.kwargs.get("username")
        user = get_object_or_404(User, username=username)
        return Post.objects.filter(user=user).order_by("-created_at")
    
class SavedPostsAPIView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = SavedPostListSerializer

    def get_queryset(self):
        return Post.objects.filter(saved_by__user=self.request.user).order_by('-created_at')
