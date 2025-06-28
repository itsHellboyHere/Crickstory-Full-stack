from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated,AllowAny
from .serializers import ProfileSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
import cloudinary.uploader
from rest_framework.generics import RetrieveAPIView
from .permissions import IsOwnerProfile
from .models import Profile
from allauth.account.models import EmailConfirmation, EmailConfirmationHMAC
from allauth.account.views import ConfirmEmailView
from django.http import HttpResponseRedirect, Http404

class UserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        print("User:", request.user)  
        return Response({
            "username": request.user.username,
            "email": request.user.email
        })

from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .permissions import IsOwnerProfile
from .serializers import ProfileSerializer
from .models import Profile
from rest_framework.generics import UpdateAPIView

class ProfileUpdateDetailsView(UpdateAPIView):
    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated, IsOwnerProfile]

    def get_object(self):
        return self.request.user.profile

    
class ProfileImageUploadView(APIView):
    permission_classes = [IsAuthenticated, IsOwnerProfile]
    parser_classes = [MultiPartParser, FormParser]

    def patch(self, request, *args, **kwargs):
        user_profile = request.user.profile
        self.check_object_permissions(request, user_profile)

        image_file = request.FILES.get('image')

        if not image_file:
            return Response({'error': 'No image uploaded.'}, status=400)

        if image_file.size > 3 * 1024 * 1024:
            return Response({'error': "Image size should be less than 3MB."}, status=400)

        try:
            if user_profile.image:
                public_id = user_profile.image.split('/')[-1].split('.')[0]
                cloudinary.uploader.destroy(f"profile_images/{public_id}", invalidate=True)

            result = cloudinary.uploader.upload(
                image_file,
                folder="profile_images",
                transformation=[
                    {"width": 300, "height": 300, "crop": "fill", "gravity": "face"},
                    {"quality": "auto:good"}
                ]
            )

            user_profile.image = result['secure_url']
            user_profile.save()

            return Response({'image': user_profile.image}, status=200)

        except Exception as e:
            return Response({'error': str(e)}, status=500)


class ProfileGetView(RetrieveAPIView):
    permission_classes=[IsAuthenticated]
    serializer_class=ProfileSerializer
    def get_object(self):
        return self.request.user.profile
    
class PublicProfileView(RetrieveAPIView):
    permission_classes = [AllowAny]
    serializer_class = ProfileSerializer
    lookup_field = 'user__username'  
    lookup_url_kwarg = 'username'    

    def get_queryset(self):
        return Profile.objects.select_related('user')
    

class CustomConfirmEmailView(APIView):
    def get(self, request, key):
        try:
            confirmation = EmailConfirmationHMAC.from_key(key)
            if confirmation:
                confirmation.confirm(request)
                return HttpResponseRedirect("http://localhost:3000/email-confirmed")  
            raise Http404()
        except Exception:
            raise Http404()