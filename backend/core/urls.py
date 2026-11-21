from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .admin_api_views import AdminOverviewView, AdminRegistrationUpdateView, AdminUserUpdateView
from .auth_views import MeView, RegisterView, LogoutView
from .chat_views import ChatView
from .google_auth_views import GoogleLoginView
from .learning_views import LearningDashboardView
from .views import ProductInterestCreateView, TrainingRegistrationCreateView, health

urlpatterns = [
    path("health/", health, name="health"),
    path("auth/register/", RegisterView.as_view(), name="auth-register"),
    path("auth/token/", TokenObtainPairView.as_view(), name="token-obtain-pair"),
    path("auth/token/refresh/", TokenRefreshView.as_view(), name="token-refresh"),
    path("auth/google/", GoogleLoginView.as_view(), name="auth-google"),
    path("auth/me/", MeView.as_view(), name="auth-me"),
    path("auth/logout/", LogoutView.as_view(), name="auth-logout"),
    path("assistant/chat/", ChatView.as_view(), name="assistant-chat"),
    path("learning/dashboard/", LearningDashboardView.as_view(), name="learning-dashboard"),
    path("admin/overview/", AdminOverviewView.as_view(), name="admin-overview"),
    path("admin/registrations/<int:registration_id>/", AdminRegistrationUpdateView.as_view(), name="admin-registration-update"),
    path("admin/users/<int:user_id>/", AdminUserUpdateView.as_view(), name="admin-user-update"),
    path("registrations/", TrainingRegistrationCreateView.as_view(), name="training-registration"),
    path("product-interests/", ProductInterestCreateView.as_view(), name="product-interest"),
]
