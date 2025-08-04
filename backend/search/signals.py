from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from user.models import Profile
from .typesense_client import client
from follow.models import Follow
from .indexers import index_user,index_post
from posts.models import Post
User = get_user_model()



@receiver(post_save,sender=User)
def sync_user_on_save(sender,instance, **kwargs):
    index_user(instance)

@receiver(post_save,sender = Profile)
def sync_profile_on_save(sender, instance, **kwargs):
    index_user(instance.user)

@receiver(post_save,sender=Post)
def sync_post_on_save(sender,instance,**kwargs):
    index_post(instance)