from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView\nfrom .auth_views import MeView, RegisterView, LogoutView\nfrom .chat_views import ChatView\nfrom .views import ProductInterestCreateView, TrainingRegistrationCreateView, health

urlpatterns = [
    path("health/", health, name="health"),\n    path("auth/register/", RegisterView.as_view(), name="auth-register"),\n    path("auth/token/", TokenObtainPairView.as_view(), name="token-obtain-pair"),\n    path("auth/token/refresh/", TokenRefreshView.as_view(), name="token-refresh"),\n    path("auth/me/", MeView.as_view(), name="auth-me"),\n    path("auth/logout/", LogoutView.as_view(), name="auth-logout"),\n    path("assistant/chat/", ChatView.as_view(), name="assistant-chat"),
    path("registrations/", TrainingRegistrationCreateView.as_view(), name="training-registration"),
    path("product-interests/", ProductInterestCreateView.as_view(), name="product-interest"),
]
