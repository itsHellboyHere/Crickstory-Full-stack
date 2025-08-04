from .typesense_client import client
from django.contrib.auth import get_user_model
from follow.models import Follow
User = get_user_model()


def index_user(user):
    print("indexuser called")
    profile = getattr(user,'profile',None)
    follower_count = Follow.objects.filter(
        following=user, is_active=True
    ).count()
    document={
            "id": str(user.id),
            "username":user.username,
            "name":profile.name if profile.name else  "",
            "bio":profile.bio if profile.bio else "",
            "follower_count": follower_count,
            "image": str(profile.image) if profile.image else ""
        }
    try:
        client.collections["users"].documents.upsert(document)
    except Exception as e:
        print(f"❌ Typesense index failed: {e}")

def index_all_users():
    users = User.objects.all()
    documents=[]
    
    for user in users:
        profile = getattr(user,'profile',None) 
        follower_count = Follow.objects.filter(
        following=user, is_active=True
        ).count()
        doc = {
            "id": str(user.id),
            "username": user.username,
            "name": profile.name or "",
            "bio": profile.bio or "",
            "follower_count": follower_count,
            "image": str(profile.image) if profile.image else ""
        }

        print("➡️ Adding document:", doc)
        documents.append(doc)
    if documents:
        print(f"🔁 Importing {len(documents)} users...")
        result = client.collections["users"].documents.import_(
            documents, {"action": "upsert"}
        )
        print("✅ Import result:", result)
    else:
        print("⚠️ No documents to index.")



def index_post(post):
    document = {
        "id": str(post.id),
        "title": post.title,
        "tags": list(post.tags.names()),
        "location": post.location or "",
        "user_id": str(post.user.id),
        "username": post.user.username,
        "created_at": int(post.created_at.timestamp()),
    }
    client.collections["posts"].documents.upsert(document)

def index_all_posts():
    from posts.models import Post

    posts = Post.objects.select_related("user").all()
    documents = []

    for post in posts:
        doc = {
            "id": str(post.id),
            "title": post.title,
            "tags": list(post.tags.names()),
            "location": post.location or "",
            "user_id": str(post.user.id),
            "username": post.user.username,
            "created_at": int(post.created_at.timestamp()),
        }
        print("➡️ Adding post:", doc)
        documents.append(doc)

    if documents:
        print(f"🔁 Importing {len(documents)} posts...")
        result = client.collections["posts"].documents.import_(
            documents, {"action": "upsert"}
        )
        print("✅ Import result:", result)
    else:
        print("⚠️ No posts to index.")
