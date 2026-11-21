from django.urls import path
from .views import ProductInterestCreateView, TrainingRegistrationCreateView, health

urlpatterns = [
    path("health/", health, name="health"),
    path("registrations/", TrainingRegistrationCreateView.as_view(), name="training-registration"),
    path("product-interests/", ProductInterestCreateView.as_view(), name="product-interest"),
]
