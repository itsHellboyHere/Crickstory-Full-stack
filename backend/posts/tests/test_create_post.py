from django.urls import reverse
import tempfile
from rest_framework.test import APITestCase
from rest_framework import status
from django.core.files.uploadedfile import SimpleUploadedFile
from django.contrib.auth import get_user_model
from unittest.mock import patch
User = get_user_model()

@patch("posts.views.cloudinary.uploader.upload")  
class CreatePostTest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="testuser", password="testpass123")
        self.client.login(username="testuser", password="testpass123")

    def test_create_post_without_title(self, mock_upload):
        url = reverse("create-post")
        image = SimpleUploadedFile("test.jpg", b"fake_image_data", content_type="image/jpeg")
        data = {"file": image}

        response = self.client.post(url, data, format="multipart")
        self.assertEqual(response.status_code, 400)
        self.assertIn("Title is required", str(response.data))

    def test_create_post_success(self, mock_upload):
        url = reverse("create-post")
        image = SimpleUploadedFile("test.jpg", b"fake_image_data", content_type="image/jpeg")
        data = {"title": "Test Post", "file": image}

        # Simulate Cloudinary returning a successful upload response
        mock_upload.return_value = {
            "secure_url": "https://fake.cloudinary.com/test.jpg"
        }

        response = self.client.post(url, data, format="multipart")
        print("DEBUG:", response.json())

        self.assertEqual(response.status_code, 201)
        self.assertIn("imageUrl", response.data)