class JwtCookieMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        
        # If adapter set tokens on request, set cookies on response
        if hasattr(request, 'jwt_access') and hasattr(request, 'jwt_refresh'):
            response.set_cookie(
                'access-token',
                request.jwt_access,
                httponly=True,
                secure=False,  # True if HTTPS
                samesite='Lax',
                path='/',
            )
            response.set_cookie(
                'refresh-token',
                request.jwt_refresh,
                httponly=True,
                secure=False,
                samesite='Lax',
                path='/',
            )
        return response
