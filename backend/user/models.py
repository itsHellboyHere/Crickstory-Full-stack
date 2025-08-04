from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import RegexValidator
from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver

phone_regex = RegexValidator(
    regex=r'^\+?\d{10,15}$',
    message="Phone number must be entered in the format: '+999999999'. Up to 15 digits allowed."
)

class CustomUser(AbstractUser):
    email = models.EmailField(unique=True, blank=False, null=False)

class Profile(models.Model):
    MESSAGE_PRIVACY_CHOICES = [
        ('everyone', 'Everyone'),
        ('followers', 'Followers Only'),
        ('mutual', 'Mutual Followers Only'),
    ]
    
    user = models.OneToOneField('user.CustomUser', on_delete=models.CASCADE)
    name = models.CharField(max_length=255, blank=True)
    bio = models.TextField(max_length=500, blank=True)
    location = models.CharField(max_length=30, blank=True)
    birth_date = models.DateField(null=True, blank=True)
    image = models.URLField(blank=True, null=True)
    is_private = models.BooleanField(default=False)
    message_privacy = models.CharField(max_length=20, choices=MESSAGE_PRIVACY_CHOICES, default='everyone')
    phone_number = models.CharField(
        max_length=15,
        # unique=True,
        validators=[phone_regex],
        null=True,
        blank=True
    )

    def __str__(self):
        return f"{self.user} profile"

@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)

@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()
