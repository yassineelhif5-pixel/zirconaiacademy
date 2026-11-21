import logging
from datetime import date

from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from django.shortcuts import get_object_or_404
from rest_framework import serializers, status
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import ProductInterest, ProjectProposal, TrainingRegistration
from .proposal_views import proposal_payload

logger = logging.getLogger(__name__)
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
                "proposals": ProjectProposal.objects.count(),
                "proposals_pending": ProjectProposal.objects.filter(status__in=["submitted", "reviewing"]).count(),
            },
            "project_proposals": [proposal_payload(item, include_user=True) for item in ProjectProposal.objects.select_related("user")],
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
        effective_status = attrs.get("status", self.instance.status)
        effective_date = attrs.get("confirmed_date", self.instance.confirmed_date)
        if effective_status == "confirmed" and not effective_date:
            raise serializers.ValidationError({"confirmed_date": "Une date est obligatoire pour une demande confirmée."})
        if effective_date and effective_date < date.today():
            raise serializers.ValidationError({"confirmed_date": "La date doit être aujourd'hui ou ultérieure."})
        return attrs


class AdminRegistrationUpdateView(APIView):
    permission_classes = [IsAdminUser]

    def patch(self, request, registration_id):
        item = get_object_or_404(TrainingRegistration, pk=registration_id)
        previous_status = item.status
        previous_date = item.confirmed_date
        serializer = AdminRegistrationUpdateSerializer(item, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        for key, value in serializer.validated_data.items():
            setattr(item, key, value)
        item.save(update_fields=[*serializer.validated_data.keys()])

        notification_sent = False
        changed = item.status != previous_status or item.confirmed_date != previous_date
        if changed and item.email and getattr(settings, "EMAIL_HOST", ""):
            if item.status == "confirmed":
                subject = "Votre formation ProjectAcademy est confirmée"
                message = (
                    f"Bonjour {item.full_name},\n\n"
                    f"Votre demande pour {item.get_training_display()} est acceptée. "
                    f"Votre session est planifiée le {item.confirmed_date:%d/%m/%Y}.\n\n"
                    "Connectez-vous à votre espace apprenant pour retrouver les informations.\n"
                    "L'équipe ProjectAcademy"
                )
            elif item.status == "cancelled":
                subject = "Mise à jour de votre demande ProjectAcademy"
                message = (
                    f"Bonjour {item.full_name},\n\n"
                    f"Votre demande pour {item.get_training_display()} n'a pas été retenue. "
                    "Vous pouvez contacter l'équipe ProjectAcademy pour toute question.\n\n"
                    "L'équipe ProjectAcademy"
                )
            else:
                subject = "Mise à jour de votre demande ProjectAcademy"
                message = (
                    f"Bonjour {item.full_name},\n\n"
                    "Votre demande est en cours de traitement. Nous reviendrons vers vous.\n\n"
                    "L'équipe ProjectAcademy"
                )
            try:
                notification_sent = bool(send_mail(
                    subject, message, settings.DEFAULT_FROM_EMAIL, [item.email], fail_silently=False
                ))
            except Exception:
                logger.exception("Unable to send registration update email for registration %s", item.id)

        return Response({**registration_payload(item), "notification_sent": notification_sent})


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
