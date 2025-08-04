from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.response import Response
from .typesense_client import client
# views.py
class SearchUsersAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        query = request.query_params.get("q", "")
        page = int(request.query_params.get("page", 1))
        search_type = request.query_params.get("type", "all")  # 'users', 'posts', 'all'

        if not query.strip():
            return Response({
                "users": [],
                "posts": [],
                "page": page,
                "has_more": False
            })

        PER_PAGE = 5
        data = {"users": [], "posts": []}
        has_more_users = has_more_posts = False

        if search_type in ["all", "users"]:
            user_results = client.collections["users"].documents.search({
                "q": query,
                "query_by": "username,name,bio",
                "prefix": "true",
                "per_page": PER_PAGE,
                "page": page,
                "sort_by": "follower_count:desc",
                "num_typos": 2
            })
            data["users"] = user_results.get("hits", [])
            has_more_users = page * PER_PAGE < user_results.get("found", 0)

        if search_type in ["all", "posts"]:
            post_results = client.collections["posts"].documents.search({
                "q": query,
                "query_by": "title,tags,location",
                "prefix": "true",
                "per_page": PER_PAGE,
                "page": page,
                "sort_by": "created_at:desc",
                "num_typos": 2
            })
            data["posts"] = post_results.get("hits", [])
            has_more_posts = page * PER_PAGE < post_results.get("found", 0)

        data["has_more"] = has_more_users or has_more_posts
        data["page"] = page
        return Response(data, status=status.HTTP_200_OK)
