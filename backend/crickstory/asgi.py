# asgi.py

import os
import django
from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.asgi import get_asgi_application
from channels.auth import AuthMiddlewareStack

# Import your WebSocket URL patterns
import notifications.routing
import comments.routing

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "crickstory.settings")
django.setup()
print("🛠 ASGI loaded routing from comments.routing and notifications.routing")

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
        URLRouter(
            notifications.routing.websocket_urlpatterns +
            comments.routing.websocket_urlpatterns
        )
    ),
})
