from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from chat.models import Room
import random

User = get_user_model()

class Command(BaseCommand):
    help = "Create 10 test rooms between random users"

    def handle(self, *args, **options):
        users = list(User.objects.all())

        if len(users) < 2:
            self.stdout.write(self.style.ERROR("Need at least 2 users to create rooms."))
            return

        created = 0

        for i in range(10):
            user1, user2 = random.sample(users, 2)

            # Skip if room already exists
            existing = Room.objects.filter(participants__in=[user1]).filter(participants__in=[user2]).distinct()
            if existing.exists():
                continue

            room = Room.objects.create(name=f"Room {i+1}")
            room.participants.add(user1, user2)
            room.save()
            self.stdout.write(self.style.SUCCESS(f"Created room between {user1.username} and {user2.username}"))
            created += 1

        self.stdout.write(self.style.SUCCESS(f"✅ Total rooms created: {created}"))
