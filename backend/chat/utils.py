from .models import MessageRequest
from follow.models import Follow
def is_following(from_user, to_user):
    return Follow.objects.filter(
        follower=from_user, following=to_user, is_active=True
    ).exists()

def has_accepted_message_request(sender, receiver):
    return MessageRequest.objects.filter(
        sender=sender,
        receiver=receiver,
        is_accepted=True
    ).exists()

def can_message(sender, receiver):
    """Returns True if sender is allowed to message receiver."""
    if sender == receiver:
        return True

    privacy = receiver.profile.message_privacy

    if privacy == 'everyone':
        return True
    elif privacy == 'followers':
        return is_following(sender, receiver) or has_accepted_message_request(sender, receiver)
    elif privacy == 'mutual':
        return (
            (is_following(sender, receiver) and is_following(receiver, sender)) or
            has_accepted_message_request(sender, receiver)
        )

    return False
