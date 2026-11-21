from django.http import JsonResponse
from rest_framework import generics
from rest_framework.permissions import AllowAny, IsAuthenticated

from .models import ProductInterest, TrainingRegistration
from .serializers import ProductInterestSerializer, TrainingRegistrationSerializer


def health(request):
    return JsonResponse({"status": "ok", "service": "ProjectAcademy API"})


class TrainingRegistrationCreateView(generics.CreateAPIView):
    queryset = TrainingRegistration.objects.all()
    serializer_class = TrainingRegistrationSerializer
    permission_classes = [AllowAny]

    def perform_create(self, serializer):
        user = self.request.user if self.request.user.is_authenticated else None
        serializer.save(user=user)


class ProductInterestCreateView(generics.CreateAPIView):
    queryset = ProductInterest.objects.all()
    serializer_class = ProductInterestSerializer
    permission_classes = [AllowAny]

    def perform_create(self, serializer):
        user = self.request.user if self.request.user.is_authenticated else None
        serializer.save(user=user)
