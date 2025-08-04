from django.urls import path
from .views import (UserView,ProfileUpdateDetailsView,ProfileGetView,PublicProfileView,ProfileImageUploadView,
                    TogglePrivacyAPIView,WebSocketTokenView)

urlpatterns = [
    path("",UserView.as_view()),
    path('profile/', ProfileGetView.as_view(), name='get-profile'),
    path('profiles/<str:username>/', PublicProfileView.as_view(), name='public-profile'),
    path('profile/image/', ProfileImageUploadView.as_view(), name='profile-image-upload'),
    path("update-profile/",ProfileUpdateDetailsView.as_view(),name='profile-update'), 
    path("toggle-privacy/", TogglePrivacyAPIView.as_view(), name='toggle-privacy'), 
     path("auth/ws-token/", WebSocketTokenView.as_view(), name="ws-token"),
]