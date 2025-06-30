from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status
from posts.models import Post, SavedPost
User = get_user_model()

class SavedPostsTestView(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="testuser",password="testuser123")
        self.client.login(username="testuser",password="testuser123")
        self.post= Post.objects.create(user=self.user,title="my-post",imageUrl="http://example.com/image.jpg")

    def test_saved_post(self):
        url = reverse("save-post",args=[self.post.id])