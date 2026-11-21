from datetime import date, timedelta

from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase, APIClient

from .models import TrainingRegistration

User = get_user_model()


class AdminConsoleApiTests(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_user(
            username="academy-admin", email="admin@example.com",
            password="a-very-strong-admin-password", is_staff=True,
        )
        self.learner = User.objects.create_user(
            username="academy-learner", email="learner@example.com",
            password="a-very-strong-learner-password",
        )
        self.registration = TrainingRegistration.objects.create(
            user=self.learner, training="cyber-defense",
            full_name="Test Learner", email="learner@example.com", consent=True,
        )

    def test_non_staff_cannot_open_admin_overview(self):
        self.client.force_authenticate(user=self.learner)
        response = self.client.get("/api/admin/overview/")
        self.assertEqual(response.status_code, 403)

    def test_staff_can_view_overview(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.get("/api/admin/overview/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["counts"]["pending"], 1)
        self.assertEqual(response.data["registrations"][0]["email"], "learner@example.com")

    def test_staff_can_accept_request_with_a_future_date(self):
        self.client.force_authenticate(user=self.admin)
        planned = date.today() + timedelta(days=14)
        response = self.client.patch(
            f"/api/admin/registrations/{self.registration.id}/",
            {"status": "confirmed", "confirmed_date": planned.isoformat()},
            format="json",
        )
        self.assertEqual(response.status_code, 200)
        self.registration.refresh_from_db()
        self.assertEqual(self.registration.status, "confirmed")
        self.assertEqual(self.registration.confirmed_date, planned)

    def test_staff_cannot_confirm_without_a_date(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.patch(
            f"/api/admin/registrations/{self.registration.id}/",
            {"status": "confirmed"},
            format="json",
        )
        self.assertEqual(response.status_code, 400)

    def test_learner_dashboard_only_shows_owned_requests(self):
        other = User.objects.create_user(
            username="other-learner", email="other@example.com",
            password="a-very-strong-other-password",
        )
        TrainingRegistration.objects.create(
            user=other, training="ai-architecture",
            full_name="Other Learner", email="other@example.com", consent=True,
        )
        self.client.force_authenticate(user=self.learner)
        response = self.client.get("/api/learning/dashboard/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data["registrations"]), 1)
        self.assertEqual(response.data["registrations"][0]["id"], self.registration.id)

    def test_staff_cannot_clear_date_of_confirmed_registration(self):
        self.registration.status = "confirmed"
        self.registration.confirmed_date = date.today() + timedelta(days=10)
        self.registration.save(update_fields=["status", "confirmed_date"])
        self.client.force_authenticate(user=self.admin)
        response = self.client.patch(
            f"/api/admin/registrations/{self.registration.id}/",
            {"confirmed_date": None},
            format="json",
        )
        self.assertEqual(response.status_code, 400)
