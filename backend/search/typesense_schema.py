USER_COLLECTION={
    "name":"users",
    "fields":[
       {"name": "id", "type": "string"},
        {"name": "username", "type": "string"},
        {"name": "name", "type": "string", "optional": True},
        {"name": "bio", "type": "string", "optional": True},
        {"name": "follower_count", "type": "int32"},
         { "name": "image", "type": "string", "optional": True }
    ],
      "default_sorting_field": "follower_count"
}

# posts_index.py or inside a signal (once per startup)

post_schema = {
    "name": "posts",
    "fields": [
        {"name": "id", "type": "string"},
        {"name": "title", "type": "string"},
        {"name": "tags", "type": "string[]"},
        {"name": "location", "type": "string", "optional": True},
        {"name": "user_id", "type": "string"},
        {"name": "username", "type": "string"},  
        {"name": "created_at", "type": "int64"},
    ],
    "default_sorting_field": "created_at"
}


