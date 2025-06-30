from django.urls import reverse
import tempfile
from rest_framework.test import APITestCase
from rest_framework import status
from django.core.files.uploadedfile import SimpleUploadedFile
from django.contrib.auth import get_user_model
User = get_user_model()


class FeedViewTest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="testuser",password="testuser123")
        self.client.login(username="testuser",password="testuser123")
    def test_feed_posts(self):
        url = reverse("posts")
        response = self.client.get(url)
        self.assertEqual(response.status_code , 200)
        self.assertIn("results",response.json())