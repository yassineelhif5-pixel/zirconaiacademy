from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView


class LearningDashboardView(APIView):
    """Authenticated learner profile.

    Registration requests are not exposed by email until email ownership
    verification is implemented. Matching an unverified account email to
    public registration data would allow personal-data disclosure.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({
            "profile": {
                "username": request.user.username,
                "email": request.user.email,
                "first_name": request.user.first_name,
                "last_name": request.user.last_name,
            },
            "registrations": [],
            "product_interests": [],
            "notice": (
                "Votre espace personnel est actif. L'historique des demandes "
                "sera affiché après la mise en place de la vérification d'adresse email."
            ),
        })
