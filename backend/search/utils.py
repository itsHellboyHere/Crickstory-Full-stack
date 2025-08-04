from .typesense_client import client
from .typesense_schema import USER_COLLECTION,post_schema

def create_user_collection():
    try:
        client.collections["users"].delete() 
    except:
        pass
    client.collections.create(USER_COLLECTION)
def create_posts_collection():
    try:
        client.collections["posts"].delete()
    except:
        pass
    client.collections.create(post_schema)