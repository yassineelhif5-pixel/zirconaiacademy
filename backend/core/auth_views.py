from django.contrib.auth import get_user_model
from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from .auth_serializers import RegisterSerializer

User=get_user_model()

class RegisterView(generics.CreateAPIView):
    serializer_class=RegisterSerializer
    permission_classes=[permissions.AllowAny]
    throttle_scope="registration"

class MeView(APIView):
    permission_classes=[permissions.IsAuthenticated]
    def get(self,request):
        return Response({"id":request.user.id,"username":request.user.username,"email":request.user.email,"first_name":request.user.first_name,"last_name":request.user.last_name})

class LogoutView(APIView):
    permission_classes=[permissions.IsAuthenticated]
    def post(self,request):
        token=request.data.get("refresh")
        if token:
            try: RefreshToken(token).blacklist()
            except Exception: return Response({"detail":"Jeton de déconnexion invalide."},status=400)
        return Response(status=204)
