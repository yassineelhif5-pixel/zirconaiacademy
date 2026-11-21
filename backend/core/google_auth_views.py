import os

from django.contrib.auth import get_user_model
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token

User = get_user_model()


class GoogleLoginView(APIView):
    permission_classes = [permissions.AllowAny]
    throttle_scope = "registration"

    def post(self, request):
        credential = request.data.get("credential")
        client_id = os.getenv("GOOGLE_CLIENT_ID", "").strip()
        if not client_id:
            return Response({"detail": "Connexion Google non configurée."}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        if not isinstance(credential, str) or not credential:
            return Response({"detail": "Jeton Google manquant."}, status=status.HTTP_400_BAD_REQUEST)
        try:
            claims = id_token.verify_oauth2_token(credential, google_requests.Request(), client_id)
        except ValueError:
            return Response({"detail": "Jeton Google invalide ou expiré."}, status=status.HTTP_401_UNAUTHORIZED)

        email = (claims.get("email") or "").strip().lower()
        if not email or not claims.get("email_verified"):
            return Response({"detail": "Google doit confirmer la propriété de cette adresse email."}, status=status.HTTP_403_FORBIDDEN)

        given_name = (claims.get("given_name") or "")[:150]
        family_name = (claims.get("family_name") or "")[:150]
        user = User.objects.filter(email__iexact=email).first()
        if user is None:
            base = (email.split("@", 1)[0] or "learner")[:140]
            username = base
            suffix = 1
            while User.objects.filter(username__iexact=username).exists():
                username = f"{base[:135]}{suffix}"
                suffix += 1
            user = User.objects.create_user(
                username=username, email=email, first_name=given_name, last_name=family_name
            )
        elif not user.email:
            user.email = email
            user.save(update_fields=["email"])
        if not user.is_active:
            return Response({"detail": "Ce compte est désactivé. Contactez l'administration."}, status=status.HTTP_403_FORBIDDEN)

        refresh = RefreshToken.for_user(user)
        return Response({
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user": {"id": user.id, "email": user.email, "first_name": user.first_name, "is_staff": user.is_staff},
        })
