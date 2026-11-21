import logging

from django.conf import settings
from django.core.mail import send_mail
from django.shortcuts import get_object_or_404
from rest_framework import serializers, status
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import ProjectProposal

logger = logging.getLogger(__name__)
MAX_TURNS = 20


def proposal_payload(item, include_user=False):
    data = {
        "id": item.id,
        "title": item.title,
        "need": item.need,
        "analysis": item.analysis,
        "analysis_source": item.analysis_source,
        "conversation": item.conversation,
        "company": item.company,
        "status": item.status,
        "status_label": item.get_status_display(),
        "admin_note": item.admin_note,
        "created_at": item.created_at.isoformat(),
        "updated_at": item.updated_at.isoformat(),
    }
    if include_user:
        user = item.user
        data["user"] = {
            "id": user.id, "username": user.username, "email": user.email,
            "full_name": f"{user.first_name} {user.last_name}".strip(),
        }
    return data


class ConversationTurnSerializer(serializers.Serializer):
    role = serializers.ChoiceField(choices=["user", "assistant"])
    content = serializers.CharField(max_length=8000, trim_whitespace=True)


class ProjectProposalCreateSerializer(serializers.Serializer):
    title = serializers.CharField(max_length=150, trim_whitespace=True)
    need = serializers.CharField(max_length=3000, trim_whitespace=True)
    analysis = serializers.CharField(max_length=8000, required=False, allow_blank=True, trim_whitespace=True)
    analysis_source = serializers.ChoiceField(choices=[c[0] for c in ProjectProposal.SOURCE_CHOICES], required=False, default="guided")
    conversation = ConversationTurnSerializer(many=True, required=False)
    company = serializers.CharField(max_length=150, required=False, allow_blank=True, trim_whitespace=True)
    consent = serializers.BooleanField()

    def validate_title(self, value):
        value = " ".join(value.split())
        if len(value) < 3:
            raise serializers.ValidationError("Donnez un titre d'au moins 3 caractères à votre projet.")
        return value

    def validate_need(self, value):
        if len(value) < 10:
            raise serializers.ValidationError("Décrivez votre besoin en quelques mots (10 caractères minimum).")
        return value

    def validate_conversation(self, value):
        return value[-MAX_TURNS:]

    def validate_consent(self, value):
        if value is not True:
            raise serializers.ValidationError("Le consentement est obligatoire pour transmettre votre proposition.")
        return value


class ProjectProposalListCreateView(APIView):
    permission_classes = [IsAuthenticated]
    throttle_scope = "proposal"

    def get_throttles(self):
        # Le throttle ne s'applique qu'aux créations, pas à la consultation.
        return super().get_throttles() if self.request.method == "POST" else []

    def get(self, request):
        items = ProjectProposal.objects.filter(user=request.user)
        return Response([proposal_payload(item) for item in items])

    def post(self, request):
        serializer = ProjectProposalCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = dict(serializer.validated_data)
        data.pop("consent")
        item = ProjectProposal.objects.create(user=request.user, **data)
        return Response(proposal_payload(item), status=status.HTTP_201_CREATED)


class ProjectProposalDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, proposal_id):
        item = get_object_or_404(ProjectProposal, pk=proposal_id, user=request.user)
        return Response(proposal_payload(item))


class AdminProposalUpdateSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=ProjectProposal.STATUS_CHOICES, required=False)
    admin_note = serializers.CharField(max_length=2000, required=False, allow_blank=True, trim_whitespace=True)


class AdminProposalUpdateView(APIView):
    permission_classes = [IsAdminUser]

    def patch(self, request, proposal_id):
        item = get_object_or_404(ProjectProposal.objects.select_related("user"), pk=proposal_id)
        previous = (item.status, item.admin_note)
        serializer = AdminProposalUpdateSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        for key, value in serializer.validated_data.items():
            setattr(item, key, value)
        item.save()

        notification_sent = False
        email = item.user.email
        if (item.status, item.admin_note) != previous and email and getattr(settings, "EMAIL_HOST", ""):
            message = (
                f"Bonjour,\n\nVotre proposition de projet « {item.title} » a été mise à jour.\n"
                f"Statut : {item.get_status_display()}\n"
                + (f"\nMessage de l'équipe ZirconAI :\n{item.admin_note}\n" if item.admin_note else "")
                + "\nRetrouvez le détail dans votre espace personnel ProjectAcademy.\n\nL'équipe ZirconAI"
            )
            try:
                notification_sent = bool(send_mail(
                    "Mise à jour de votre proposition de projet", message,
                    settings.DEFAULT_FROM_EMAIL, [email], fail_silently=False,
                ))
            except Exception:
                logger.exception("Unable to send proposal update email for proposal %s", item.id)
        return Response({**proposal_payload(item, include_user=True), "notification_sent": notification_sent})
