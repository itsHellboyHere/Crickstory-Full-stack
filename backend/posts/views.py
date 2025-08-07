from django.shortcuts import get_object_or_404, render
from .serializers import PostCreateSerializer,FullPostSerializer,UserProfileSerializer,SavedPostListSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework import generics
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
import cloudinary.uploader
from django.db.models import Count
from .models import Post,SavedPost,Media
from rest_framework import status
from rest_framework.pagination import PageNumberPagination
from follow.models import Follow
from django.contrib.auth import get_user_model
from .utils import broadcast_post_to_followers
User=get_user_model()

class CreatePostView(APIView):
    permission_classes=[IsAuthenticated]
    parser_classes=[MultiPartParser, FormParser]

    def post(self,request,*args,**kwargs):
        title = request.data.get('title')
        tags = request.data.getlist('tags')  
        location = request.data.get('location')
        files = request.FILES.getlist("files")

        if not title:
            return Response({"error": "Title is required."}, status=400)
        if not files:
            return Response({"error": "At least one media file is required."}, status=400)
        
                # Validate file size
        for file in files:
            if file.size > 50 *1024 *1024:
                return Response({"error": "Each file must be under 50MB."}, status=400)
        post = Post.objects.create(user=request.user,title=title,location=location)
        post.tags.set(tags)

        for file in files:
            resource_type = "video" if "video" in file.content_type else "image"
            try:
                result = cloudinary.uploader.upload(
                    file,
                    resource_type=resource_type,
                    folder="post_media",
                    transformation=[
                        {"quality": "auto"},
                        {"fetch_format": "auto"},
                    ]
                )
                Media.objects.create(
                    post=post,
                    media_type=resource_type,
                    url=result["secure_url"]
                )
            except Exception as e:
                post.delete()  # Clean up partial post
                return Response({"error": f"Cloudinary error: {str(e)}"}, status=500)

        broadcast_post_to_followers(post)
        serialized_post = FullPostSerializer(post, context={'request': request})
        return Response(serialized_post.data, status=201)


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
            ).annotate(
            likes_count=Count('likes', distinct=True),
            comments_count=Count('comments', distinct=True)
        ).order_by('-created_at')
        
        following_ids.append(user.id)
        # Show only posts from followed users
        return Post.objects.filter(user__id__in=following_ids).select_related('user').prefetch_related(
            'likes__user',
            'saved_by__user',
        ).annotate(
            likes_count=Count('likes', distinct=True),
            comments_count=Count('comments', distinct=True)
        ).order_by('-created_at').distinct()
    
class PostDetailView(generics.RetrieveAPIView):
    serializer_class = FullPostSerializer
    permission_classes = []  # Public access
    queryset = Post.objects.all()
    lookup_field = 'id'

    def get_queryset(self):
        return Post.objects.annotate(
            likes_count = Count('likes',distinct=True),
            comments_count=Count('comments',distinct=True)
        ).select_related('user').prefetch_related(
              'likes__user',
            'saved_by__user',
        )



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
