from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from .models import Notification

def send_follow_notification(to_user, from_user):
    notif = Notification.objects.create(
        recipient=to_user,
        sender=from_user,
        type="follow",
        message=f"{from_user.username} followed you!",
        extra_data={
            "username": from_user.username,
            "profile_image": from_user.profile.image if from_user.profile and from_user.profile.image else None,
        }
    )

    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        f"user_{to_user.id}",
        {
            "type": "send_notification",
            "content": {
                "id": notif.id,
                "message": notif.message,
                "type": notif.type,
                "is_seen": False,
                "created_at": notif.created_at.isoformat(),
                "extra_data": {
                    "username": from_user.username,
                    "name": from_user.profile.name if from_user.profile else "",
                    "profile_image": from_user.profile.image if from_user.profile and from_user.profile.image else None,
                },
            },
        }
    )

def like_notification(to_user,from_user,post):
    notif = Notification.objects.create(
        recipient=to_user,
        sender=from_user,
        type="like",
        message=f"{from_user.username} liked your post.",
        extra_data={
            "username": from_user.username,
            "profile_image": from_user.profile.image if from_user.profile and from_user.profile.image else None,
            "post_id": post.id,
            "post_title": post.title,
            "post_image": post.imageUrl,
        }
    )
    channel_layer=get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        f"user_{to_user.id}",
           {
            "type": "send_notification",
            "content": {
                "id": notif.id,
                "message": notif.message,
                "type": notif.type,
                "is_seen": False,
                "created_at": notif.created_at.isoformat(),
                "extra_data": {
                    "username": from_user.username,
                    "name": from_user.profile.name if from_user.profile else "",
                    "profile_image": from_user.profile.image if from_user.profile and from_user.profile.image else None,
                    "post_id": post.id,
                    "post_title": post.title,
                    "post_image": post.imageUrl,
                },
            },
        }
    )


def comment_notification(to_user, from_user, post):
    notif = Notification.objects.create(
        recipient=to_user,
        sender=from_user,
        type="comment",
        message=f"{from_user.username} commented on your post 🙂",
        extra_data={
            "username": from_user.username,
            "profile_image": from_user.profile.image if from_user.profile and from_user.profile.image else None,
            "post_id": post.id,
            "post_title": post.title,
            "post_image": post.imageUrl,
        }
    )
  
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        f"user_{to_user.id}",
        {
            "type": "send_notification",
            "content": {
                "id": notif.id,
                "message": notif.message,
                "type": notif.type,
                "is_seen": False,
                "created_at": notif.created_at.isoformat(),
                "extra_data": {
                    "username": from_user.username,
                    "name": from_user.profile.name if from_user.profile else "",
                    "profile_image": from_user.profile.image if from_user.profile and from_user.profile.image else None,
                    "post_id": post.id,
                    "post_title": post.title,
                    "post_image": post.imageUrl,
                },
            },
        }
    )
