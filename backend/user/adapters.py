from allauth.account.utils import user_username
from allauth.socialaccount.adapter import DefaultSocialAccountAdapter
from allauth.account.utils import user_email
from django.utils.text import slugify
from django.contrib.auth import get_user_model
from .models import Profile
from allauth.socialaccount.models import SocialAccount
import random

User = get_user_model()
class MySocialAccountAdapter(DefaultSocialAccountAdapter):

    def populate_user(self, request, sociallogin, data):
        user = super().populate_user(request, sociallogin, data)
        if not user.username:
            base_username = slugify(user.email.split("@")[0])
            user.username = f"{base_username}{random.randint(1000, 9999)}"
        return user

# def pre_social_login(self, request, sociallogin):
#     if request.user.is_authenticated:
#         return

#     email = user_email(sociallogin.user)
#     if not email:
#         return

#     try:
#         existing_user = User.objects.get(email=email)

#         # Save app if necessary to avoid ValueError
#         if hasattr(sociallogin, 'token') and sociallogin.token:
#             if sociallogin.token.app and not sociallogin.token.app.pk:
#                 sociallogin.token.app.save()

#         if not SocialAccount.objects.filter(user=existing_user, provider=sociallogin.account.provider).exists():
#             # Attach this social login to the existing user
#             sociallogin.connect(request, existing_user)
#             sociallogin.state['process'] = 'connect'
#             sociallogin.user = existing_user
#             sociallogin.account.user = existing_user

#     except User.DoesNotExist:
#         pass


    def save_user(self, request, sociallogin, form=None):
        if hasattr(sociallogin, 'token') and sociallogin.token and sociallogin.token.app and not sociallogin.token.app.pk:
            sociallogin.token.app.save()

        user = super().save_user(request, sociallogin, form)
        Profile.objects.get_or_create(user=user)
        return user
