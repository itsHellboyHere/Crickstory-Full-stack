"""
URL configuration for crickstory project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from dj_rest_auth.registration.views import SocialLoginView

from dj_rest_auth.views import UserDetailsView
from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from allauth.socialaccount.providers.github.views import GitHubOAuth2Adapter
from dj_rest_auth.registration.views import SocialLoginView
from dj_rest_auth.registration.views import VerifyEmailView,ConfirmEmailView
from user.views import CustomConfirmEmailView
from django.conf.urls.static import static
from django.conf import settings
class GoogleLogin(SocialLoginView):
    adapter_class = GoogleOAuth2Adapter



urlpatterns = [
    # Auth endpoints
    path('admin/', admin.site.urls),
    path('api/auth/', include('dj_rest_auth.urls')),
    path(
    'api/auth/registration/account-confirm-email/<str:key>/',
        ConfirmEmailView.as_view(),
    ),
    path('api/auth/registration/', include('dj_rest_auth.registration.urls')),
    path(
        'api/auth/account-confirm-email/',
        VerifyEmailView.as_view(),
        name='account_email_verification_sent'
    ),
    # Social auth endpoint
    path('api/auth/google/', GoogleLogin.as_view(), name='google_login'),
    path("api/auth/", include("allauth.socialaccount.urls")), 
    # Allauth URLs (required for OAuth flow)
    path('accounts/', include('allauth.urls')),
    path('api/user/',include('user.urls')),
    path('api/auth/user/', UserDetailsView.as_view(), name='rest_user_details'),
    path('api/posts/',include('posts.urls'),name='posts'),
    path('api/posts/',include('likes.urls'),name='likes'),
    path('api/posts/',include('comments.urls'),name='comments'),
    path('api/user/',include('follow.urls'),name='follow'),
    path('api/notifications/', include('notifications.urls')),
    path('api/chat/',include('chat.urls')),
    path('api/search/',include('search.urls'))


]+static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)