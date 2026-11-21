import os
from unittest.mock import patch

from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase

User = get_user_model()


class GoogleAuthenticationTests(APITestCase):
    @patch.dict(os.environ, {"GOOGLE_CLIENT_ID": "test-google-client-id"})
    @patch("core.google_auth_views.id_token.verify_oauth2_token")
    def test_verified_google_identity_creates_account_and_tokens(self, verify):
        verify.return_value = {
            "email": "google-learner@gmail.com",
            "email_verified": True,
            "given_name": "Google",
            "family_name": "Learner",
        }
        response = self.client.post(
            "/api/auth/google/", {"credential": "valid-google-id-token"}, format="json"
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn("access", response.data)
        self.assertTrue(User.objects.filter(email="google-learner@gmail.com").exists())

    @patch.dict(os.environ, {"GOOGLE_CLIENT_ID": "test-google-client-id"})
    @patch("core.google_auth_views.id_token.verify_oauth2_token")
    def test_unverified_google_email_is_rejected(self, verify):
        verify.return_value = {
            "email": "unverified@gmail.com",
            "email_verified": False,
        }
        response = self.client.post(
            "/api/auth/google/", {"credential": "unverified-token"}, format="json"
        )
        self.assertEqual(response.status_code, 403)
        self.assertFalse(User.objects.filter(email="unverified@gmail.com").exists())
