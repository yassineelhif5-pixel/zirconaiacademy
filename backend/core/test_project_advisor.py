from unittest.mock import patch

from django.core.cache import cache
from django.test import TestCase
from rest_framework.test import APIClient

from .ai import AIProviderError


class ProjectAdvisorTests(TestCase):
    def setUp(self):
        cache.clear()
        self.client = APIClient()
        self.url = "/api/assistant/project/"

    @patch.dict("os.environ", {"AI_API_KEY": ""})
    def test_returns_503_when_ai_not_configured(self):
        response = self.client.post(self.url, {"message": "Je veux un chatbot pour mon support client"}, format="json")
        self.assertEqual(response.status_code, 503)
        self.assertEqual(response.data["code"], "ai_not_configured")

    def test_is_public_and_returns_ai_answer(self):
        with patch("core.chat_views.generate_project_answer", return_value="### Ce que je comprends\nUn chatbot.") as mocked:
            response = self.client.post(self.url, {
                "message": "Je veux un chatbot",
                "history": [{"role": "assistant", "content": "Bonjour"}],
            }, format="json")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["source"], "ai")
        self.assertIn("chatbot", response.data["answer"])
        mocked.assert_called_once()

    def test_provider_error_returns_502(self):
        with patch("core.chat_views.generate_project_answer", side_effect=AIProviderError("down")):
            response = self.client.post(self.url, {"message": "Un projet"}, format="json")
        self.assertEqual(response.status_code, 502)

    def test_rejects_empty_and_oversized_messages(self):
        self.assertEqual(self.client.post(self.url, {"message": ""}, format="json").status_code, 400)
        self.assertEqual(self.client.post(self.url, {"message": "x" * 3001}, format="json").status_code, 400)

    def test_system_prompt_forbids_prices_and_uses_project_role(self):
        from .ai import PROJECT_SYSTEM_PROMPT
        self.assertIn("RÉPONSE DE PRINCIPE", PROJECT_SYSTEM_PROMPT)
        self.assertIn("aucun prix", PROJECT_SYSTEM_PROMPT)
