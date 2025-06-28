from django.urls import path
from .views import ToggleLikeView

urlpatterns = [
    path('<int:post_id>/like/',ToggleLikeView.as_view(),name="like"),    
]