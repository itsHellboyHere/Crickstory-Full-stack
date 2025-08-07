def broadcast_post_to_followers(post):
    from channels.layers import get_channel_layer
    from asgiref.sync import async_to_sync
    from follow.models import Follow
    from .serializers import FullPostSerializer

    channel_layer = get_channel_layer()
    followers = Follow.objects.filter(following=post.user, is_active=True).select_related('follower')

    serialized_post = FullPostSerializer(post).data

    # Get IDs of followers
    follower_ids = [f.follower.id for f in followers]

    #  Include the post author (self)
    if post.user.id not in follower_ids:
        follower_ids.append(post.user.id)

    # Send to each user's group
    for user_id in follower_ids:
        group_name = f"feed_user_{user_id}"
        async_to_sync(channel_layer.group_send)(
            group_name,
            {
                "type": "new_post",
                "post": serialized_post,
            }
        )


def send_recent_posts_to_new_follower(follow_obj):
    from channels.layers import get_channel_layer
    from asgiref.sync import async_to_sync
    from posts.serializers import FullPostSerializer
    from posts.models import Post

    follower = follow_obj.follower
    followed_user = follow_obj.following

    recent_posts = Post.objects.filter(user=followed_user).order_by('-created_at')[:2] 
    serialized_posts = FullPostSerializer(recent_posts, many=True).data
    # print(f"📤 Sent {len(serialized_posts)} posts to {follower.username}")

    group_name = f"feed_user_{follower.id}"
    channel_layer = get_channel_layer()

    async_to_sync(channel_layer.group_send)(
        group_name,
        {
            "type": "bulk_posts",
            "posts": serialized_posts,
        }
    )
