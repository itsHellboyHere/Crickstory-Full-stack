
from django.contrib.auth import get_user_model

User = get_user_model()
def createUser():

    common_password = "qscwdv12"

    for i in range(11, 21):
        username = f"testuser{i}"
        email = f"{username}@example.com"

        if not User.objects.filter(email=email).exists():
            user = User.objects.create_user(
                username=username,
                email=email,
                password=common_password
            )
            print(f"Created user: {username}")
        else:
            print(f"User with email {email} already exists.")
