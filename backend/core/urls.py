from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .auth_views import MeView, RegisterView, LogoutView
from .chat_views import ChatView
from .views import ProductInterestCreateView, TrainingRegistrationCreateView, health

urlpatterns = [
    path("health/", health, name="health"),
    path("auth/register/", RegisterView.as_view(), name="auth-register"),
    path("auth/token/", TokenObtainPairView.as_view(), name="token-obtain-pair"),
    path("auth/token/refresh/", TokenRefreshView.as_view(), name="token-refresh"),
    path("auth/me/", MeView.as_view(), name="auth-me"),
    path("auth/logout/", LogoutView.as_view(), name="auth-logout"),
    path("assistant/chat/", ChatView.as_view(), name="assistant-chat"),
    path("registrations/", TrainingRegistrationCreateView.as_view(), name="training-registration"),
    path("product-interests/", ProductInterestCreateView.as_view(), name="product-interest"),
]
