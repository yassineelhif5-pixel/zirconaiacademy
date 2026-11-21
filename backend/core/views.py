from django.http import JsonResponse
from rest_framework import generics
from rest_framework.permissions import AllowAny

from .models import ProductInterest, TrainingRegistration
from .serializers import ProductInterestSerializer, TrainingRegistrationSerializer


def health(request):
    return JsonResponse({"status": "ok", "service": "ProjectAcademy API"})


class TrainingRegistrationCreateView(generics.CreateAPIView):
    queryset = TrainingRegistration.objects.all()
    serializer_class = TrainingRegistrationSerializer
    permission_classes = [AllowAny]


class ProductInterestCreateView(generics.CreateAPIView):
    queryset = ProductInterest.objects.all()
    serializer_class = ProductInterestSerializer
    permission_classes = [AllowAny]
