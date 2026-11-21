from datetime import date

from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from rest_framework import serializers, status
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import ProductInterest, TrainingRegistration

User = get_user_model()


def registration_payload(item):
    return {
        "id": item.id,
        "training": item.training,
        "training_label": item.get_training_display(),
        "full_name": item.full_name,
        "email": item.email,
        "company": item.company,
        "experience": item.experience,
        "question": item.question,
        "status": item.status,
        "status_label": item.get_status_display(),
        "confirmed_date": item.confirmed_date.isoformat() if item.confirmed_date else None,
        "created_at": item.created_at.isoformat(),
        "user_id": item.user_id,
    }


class AdminOverviewView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        registrations = TrainingRegistration.objects.select_related("user").all()
        return Response({
            "counts": {
                "users": User.objects.count(),
                "active_users": User.objects.filter(is_active=True).count(),
                "pending": TrainingRegistration.objects.filter(status="received").count(),
                "confirmed": TrainingRegistration.objects.filter(status="confirmed").count(),
                "interests": ProductInterest.objects.count(),
            },
            "registrations": [registration_payload(item) for item in registrations],
            "product_interests": [{
                "id": item.id, "product": item.product, "full_name": item.full_name,
                "email": item.email, "created_at": item.created_at.isoformat(),
            } for item in ProductInterest.objects.all()],
            "users": [{
                "id": user.id, "username": user.username, "email": user.email,
                "first_name": user.first_name, "last_name": user.last_name,
                "is_active": user.is_active, "is_staff": user.is_staff,
                "date_joined": user.date_joined.isoformat(),
            } for user in User.objects.order_by("-date_joined")],
        })


class AdminRegistrationUpdateSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=TrainingRegistration.STATUS_CHOICES, required=False)
    confirmed_date = serializers.DateField(required=False, allow_null=True)

    def validate(self, attrs):
        new_status = attrs.get("status")
        confirmed_date = attrs.get("confirmed_date")
        if new_status == "confirmed" and not confirmed_date and not self.instance.confirmed_date:
            raise serializers.ValidationError({"confirmed_date": "Choisissez une date avant de confirmer."})
        if confirmed_date and confirmed_date < date.today():
            raise serializers.ValidationError({"confirmed_date": "La date doit être aujourd'hui ou ultérieure."})
        return attrs


class AdminRegistrationUpdateView(APIView):
    permission_classes = [IsAdminUser]

    def patch(self, request, registration_id):
        item = get_object_or_404(TrainingRegistration, pk=registration_id)
        serializer = AdminRegistrationUpdateSerializer(item, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        for key, value in serializer.validated_data.items():
            setattr(item, key, value)
        item.save(update_fields=[*serializer.validated_data.keys()])
        return Response(registration_payload(item))


class AdminUserUpdateView(APIView):
    permission_classes = [IsAdminUser]

    def patch(self, request, user_id):
        user = get_object_or_404(User, pk=user_id)
        if user.is_superuser:
            return Response({"detail": "La protection du super-administrateur interdit cette action."}, status=status.HTTP_403_FORBIDDEN)
        is_active = request.data.get("is_active")
        if not isinstance(is_active, bool):
            return Response({"is_active": "La valeur doit être booléenne."}, status=status.HTTP_400_BAD_REQUEST)
        user.is_active = is_active
        user.save(update_fields=["is_active"])
        return Response({"id": user.id, "is_active": user.is_active})
