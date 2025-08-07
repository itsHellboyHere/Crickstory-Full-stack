# asgi.py

import os
import django

# First: Set DJANGO_SETTINGS_MODULE and run setup
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "crickstory.settings")
django.setup()  # MUST be before any model or routing import

# Now safe to import Django modules
from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.asgi import get_asgi_application
from channels.auth import AuthMiddlewareStack

# Import routing AFTER setup
import notifications.routing
import comments.routing
import chat.routing  # delay this till now
import posts.routing
application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
        URLRouter(
            notifications.routing.websocket_urlpatterns +
            comments.routing.websocket_urlpatterns +
            chat.routing.websocket_urlpatterns +
            posts.routing.websocket_urlpatterns
        )
    ),
})
