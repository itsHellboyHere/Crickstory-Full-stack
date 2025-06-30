from django.db import models
from django.conf import settings
from taggit.managers import TaggableManager
# Create your models here.


class Post(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL,related_name='posts',on_delete=models.CASCADE)
    title =models.TextField(max_length=500)
    # imageUrl = models.URLField()
    
    location = models.CharField(max_length=100, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    tags = TaggableManager(blank=True) 
    
    class Meta:
        indexes = [
            models.Index(fields=['user']),
        ]

    def __str__(self):
        return self.title
class Media(models.Model):
    IMAGE='image'
    VIDEO='video'

    MEDIA_TYPES=[
        (IMAGE,'Image'),
        (VIDEO,'Video'),
    ]
    post = models.ForeignKey(Post,on_delete=models.CASCADE,related_name='media')
    media_type=models.CharField(max_length=10,choices=MEDIA_TYPES)
    url =models.URLField()
    
class SavedPost(models.Model):
    user =models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.CASCADE)
    post = models.ForeignKey(Post,related_name='saved_by',on_delete=models.CASCADE)
    created_at=models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together= ('user','post')
    
    def __str__(self):
        return f"{self.user.username} saved {self.post.title}"