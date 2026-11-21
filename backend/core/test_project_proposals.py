from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.test import TestCase
from rest_framework.test import APIClient

from .models import ProjectProposal

User = get_user_model()

PAYLOAD = {
    "title": "Assistant IA support client",
    "need": "Nous voulons un assistant qui répond aux clients à partir de notre documentation.",
    "analysis": "### Ce que je comprends\nUn assistant RAG.",
    "analysis_source": "guided",
    "conversation": [
        {"role": "user", "content": "Nous voulons un assistant pour nos clients."},
        {"role": "assistant", "content": "### Ce que je comprends\nUn assistant RAG."},
    ],
    "company": "Acme",
    "consent": True,
}


class ProjectProposalTests(TestCase):
    def setUp(self):
        cache.clear()
        self.alice = User.objects.create_user("alice", "alice@example.com", "pw-alice-123456")
        self.bob = User.objects.create_user("bob", "bob@example.com", "pw-bob-1234567")
        self.admin = User.objects.create_user("admin", "admin@example.com", "pw-admin-123456", is_staff=True)
        self.client = APIClient()

    def test_anonymous_cannot_submit_or_list(self):
        self.assertEqual(self.client.post("/api/project-proposals/", PAYLOAD, format="json").status_code, 401)
        self.assertEqual(self.client.get("/api/project-proposals/").status_code, 401)

    def test_member_submits_and_sees_only_own_proposals(self):
        self.client.force_authenticate(self.alice)
        created = self.client.post("/api/project-proposals/", PAYLOAD, format="json")
        self.assertEqual(created.status_code, 201)
        self.assertEqual(created.data["status"], "submitted")
        proposal_id = created.data["id"]
        self.assertEqual(ProjectProposal.objects.get(pk=proposal_id).user, self.alice)

        listing = self.client.get("/api/project-proposals/")
        self.assertEqual([p["id"] for p in listing.data], [proposal_id])
        dashboard = self.client.get("/api/learning/dashboard/")
        self.assertEqual(dashboard.data["project_proposals"][0]["title"], PAYLOAD["title"])

        self.client.force_authenticate(self.bob)
        self.assertEqual(self.client.get("/api/project-proposals/").data, [])
        self.assertEqual(self.client.get(f"/api/project-proposals/{proposal_id}/").status_code, 404)

    def test_consent_and_minimum_content_required(self):
        self.client.force_authenticate(self.alice)
        self.assertEqual(self.client.post("/api/project-proposals/", {**PAYLOAD, "consent": False}, format="json").status_code, 400)
        self.assertEqual(self.client.post("/api/project-proposals/", {**PAYLOAD, "need": "court"}, format="json").status_code, 400)

    def test_user_cannot_set_status_or_note(self):
        self.client.force_authenticate(self.alice)
        created = self.client.post("/api/project-proposals/", {**PAYLOAD, "status": "accepted", "admin_note": "hack"}, format="json")
        item = ProjectProposal.objects.get(pk=created.data["id"])
        self.assertEqual(item.status, "submitted")
        self.assertEqual(item.admin_note, "")

    def test_admin_sees_all_and_updates_status_visible_to_sender(self):
        item = ProjectProposal.objects.create(user=self.alice, title="Projet A", need="Un besoin assez détaillé")
        self.client.force_authenticate(self.alice)
        self.assertEqual(self.client.patch(f"/api/admin/proposals/{item.id}/", {"status": "accepted"}, format="json").status_code, 403)

        self.client.force_authenticate(self.admin)
        overview = self.client.get("/api/admin/overview/")
        self.assertEqual(overview.data["counts"]["proposals"], 1)
        self.assertEqual(overview.data["project_proposals"][0]["user"]["email"], "alice@example.com")
        updated = self.client.patch(f"/api/admin/proposals/{item.id}/", {"status": "accepted", "admin_note": "Nous vous appelons lundi."}, format="json")
        self.assertEqual(updated.status_code, 200)
        self.assertEqual(self.client.patch(f"/api/admin/proposals/{item.id}/", {"status": "nope"}, format="json").status_code, 400)

        self.client.force_authenticate(self.alice)
        mine = self.client.get(f"/api/project-proposals/{item.id}/").data
        self.assertEqual(mine["status"], "accepted")
        self.assertEqual(mine["admin_note"], "Nous vous appelons lundi.")
