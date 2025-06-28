from django.urls import path
from .views import ( CreatePostView,FeedPostsView,PostDetailView,ToggleSaveView,UserProfilePostAPIView,
                  SavedPostsAPIView )
urlpatterns = [
    path('create/',CreatePostView.as_view(),name='create-post'),
    path('',FeedPostsView.as_view(),name="posts"),
    path("<int:id>/",PostDetailView.as_view(),name='post-detail'),
    path("<int:post_id>/save/",ToggleSaveView.as_view(),name='save-post'),
    path("user/<str:username>/",UserProfilePostAPIView.as_view(),name="user-posts"),
    path("saved-posts/", SavedPostsAPIView.as_view(), name="saved-posts"),

]