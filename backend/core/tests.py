from django.test import TestCase
from rest_framework.test import APIClient

from .models import ProductInterest, TrainingRegistration


class RegistrationApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_registration_requires_consent(self):
        response = self.client.post("/api/registrations/", {
            "training": "cyber-defense",
            "full_name": "Camille Test",
            "email": "camille@example.com",
            "experience": "beginner",
            "consent": False,
        }, format="json")
        self.assertEqual(response.status_code, 400)
        self.assertEqual(TrainingRegistration.objects.count(), 0)

    def test_registration_is_saved(self):
        response = self.client.post("/api/registrations/", {
            "training": "ai-architecture",
            "full_name": "Camille Test",
            "email": "camille@example.com",
            "experience": "beginner",
            "consent": True,
        }, format="json")
        self.assertEqual(response.status_code, 201)
        self.assertEqual(TrainingRegistration.objects.count(), 1)
        self.assertEqual(TrainingRegistration.objects.first().status, "received")

    def test_unknown_product_cannot_be_submitted(self):
        response = self.client.post("/api/product-interests/", {
            "product": "Unknown Product",
            "full_name": "Camille Test",
            "email": "camille@example.com",
            "consent": True,
        }, format="json")
        self.assertEqual(response.status_code, 400)
        self.assertEqual(ProductInterest.objects.count(), 0)


class AuthenticationAndAssistantTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_register_and_obtain_jwt(self):
        response = self.client.post("/api/auth/register/", {
            "username": "learner01",
            "email": "learner@example.com",
            "first_name": "Alex",
            "last_name": "Learner",
            "password": "a-very-strong-password-2026",
        }, format="json")
        self.assertEqual(response.status_code, 201)
        token = self.client.post("/api/auth/token/", {
            "username": "learner01",
            "password": "a-very-strong-password-2026",
        }, format="json")
        self.assertEqual(token.status_code, 200)
        self.assertIn("access", token.data)
        self.assertIn("refresh", token.data)

    def test_assistant_requires_authentication(self):
        response = self.client.post("/api/assistant/chat/", {
            "message": "Quelles sont les formations ?",
        }, format="json")
        self.assertEqual(response.status_code, 401)
