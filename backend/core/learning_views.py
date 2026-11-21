from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import ProductInterest, TrainingRegistration


class LearningDashboardView(APIView):
    """Return only the registrations linked to the authenticated user's email."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        email = (request.user.email or "").strip()
        if not email:
            return Response({
                "profile": {"username": request.user.username, "email": ""},
                "registrations": [],
                "product_interests": [],
                "notice": "Ajoutez une adresse email à votre profil pour retrouver vos demandes.",
            })

        registrations = TrainingRegistration.objects.filter(
            email__iexact=email
        ).order_by("-created_at")
        interests = ProductInterest.objects.filter(
            email__iexact=email
        ).order_by("-created_at")

        return Response({
            "profile": {
                "username": request.user.username,
                "email": email,
                "first_name": request.user.first_name,
                "last_name": request.user.last_name,
            },
            "registrations": [{
                "id": item.id,
                "training": item.training,
                "training_label": item.get_training_display(),
                "status": item.status,
                "status_label": item.get_status_display(),
                "created_at": item.created_at.isoformat(),
            } for item in registrations],
            "product_interests": [{
                "id": item.id,
                "product": item.product,
                "created_at": item.created_at.isoformat(),
            } for item in interests],
        })
