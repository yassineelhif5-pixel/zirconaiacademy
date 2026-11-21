from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .admin_api_views import registration_payload
from .models import ProductInterest, TrainingRegistration


class LearningDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        registrations = TrainingRegistration.objects.filter(user=request.user).order_by("-created_at")
        interests = ProductInterest.objects.filter(user=request.user).order_by("-created_at")
        return Response({
            "profile": {
                "username": request.user.username,
                "email": request.user.email,
                "first_name": request.user.first_name,
                "last_name": request.user.last_name,
            },
            "registrations": [registration_payload(item) for item in registrations],
            "product_interests": [{
                "id": item.id, "product": item.product,
                "created_at": item.created_at.isoformat(),
            } for item in interests],
        })
