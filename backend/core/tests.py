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
