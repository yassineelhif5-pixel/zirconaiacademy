from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from .models import ProductInterest, TrainingRegistration

User = get_user_model()


class LearningDashboardPrivacyTests(APITestCase):
    def test_dashboard_requires_authentication(self):
        response = self.client.get("/api/learning/dashboard/")
        self.assertEqual(response.status_code, 401)

    def test_unverified_email_does_not_expose_matching_requests(self):
        user = User.objects.create_user(
            username="learner-privacy",
            email="learner@example.com",
            password="a-very-strong-password-2026",
        )
        TrainingRegistration.objects.create(
            training="cyber-defense",
            full_name="Learner Private",
            email="learner@example.com",
            consent=True,
        )
        ProductInterest.objects.create(
            product="Docyra AI",
            full_name="Learner Private",
            email="learner@example.com",
            consent=True,
        )
        self.client.credentials(
            HTTP_AUTHORIZATION="Bearer " + str(RefreshToken.for_user(user).access_token)
        )
        response = self.client.get("/api/learning/dashboard/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["registrations"], [])
        self.assertEqual(response.data["product_interests"], [])
