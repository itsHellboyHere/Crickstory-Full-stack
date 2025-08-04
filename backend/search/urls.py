# search/urls.py
from django.urls import path
from .views import SearchUsersAPIView

urlpatterns = [
    path("", SearchUsersAPIView.as_view(), name="search-users"),
]
