from django.db import models
from django.conf import settings
from django.utils import timezone 
from django.db.models.signals import post_save
from django.dispatch import receiver


class Follow(models.Model):
    follower = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name='following_set',
        on_delete=models.CASCADE
    )
    following = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name='followers_set',
        on_delete=models.CASCADE
    )
    created_at = models.DateTimeField(auto_now_add=True)
    unfollowed_at = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = ('follower', 'following')
        ordering = ['-created_at']

    def unfollow(self):
        self.is_active = False
        self.unfollowed_at = timezone.now()
        self.save()

    def follow(self):
        self.is_active = True
        self.unfollowed_at = None
        self.save()

    def __str__(self):
        status = "Following" if self.is_active else f"Unfollowed on {self.unfollowed_at}"
        return f"{self.follower.username} → {self.following.username} ({status})"
    
class FollowRequest(models.Model):
    from_user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='sent_follow_requests', on_delete=models.CASCADE)
    to_user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='received_follow_requests', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('from_user', 'to_user')


@receiver(post_save, sender=Follow)
def update_follower_count(sender, instance, **kwargs):
    # Recalculate the follower count only for the 'following' user
    from search.indexers import index_user
    if instance.following:
        index_user(instance.following)