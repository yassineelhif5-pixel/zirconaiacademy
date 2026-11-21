from django.conf import settings
from django.db import models


class TrainingRegistration(models.Model):
    TRAINING_CHOICES = [
        ("cyber-defense", "AI Cyber Defense"),
        ("ai-architecture", "AI Future Architect"),
    ]
    EXPERIENCE_CHOICES = [
        ("beginner", "Débutant"),
        ("intermediate", "Intermédiaire"),
        ("advanced", "Avancé"),
    ]
    STATUS_CHOICES = [
        ("received", "Demande reçue"),
        ("reviewing", "À traiter"),
        ("confirmed", "Confirmée"),
        ("cancelled", "Refusée / annulée"),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name="training_registrations")
    training = models.CharField(max_length=40, choices=TRAINING_CHOICES)
    full_name = models.CharField(max_length=150)
    email = models.EmailField(max_length=254)
    company = models.CharField(max_length=150, blank=True)
    experience = models.CharField(max_length=20, choices=EXPERIENCE_CHOICES, default="beginner")
    question = models.TextField(blank=True, max_length=1000)
    consent = models.BooleanField(default=False)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="received")
    confirmed_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["training", "created_at"], name="core_train_training_1a1f_idx"),
            models.Index(fields=["email"], name="core_train_email_7c2d_idx"),
        ]

    def __str__(self):
        return f"{self.full_name} — {self.get_training_display()}"


class ProductInterest(models.Model):
    PRODUCT_CHOICES = [
        ("ZirconShield AI", "ZirconShield AI"),
        ("Docyra AI", "Docyra AI"),
        ("StockPilot AI", "StockPilot AI"),
        ("ZirconAcademy AI", "ZirconAcademy AI"),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name="product_interests")
    product = models.CharField(max_length=60, choices=PRODUCT_CHOICES)
    full_name = models.CharField(max_length=150)
    email = models.EmailField(max_length=254)
    consent = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["product", "created_at"], name="core_prod_product_5e3a_idx")]

    def __str__(self):
        return f"{self.full_name} — {self.product}"


class ProjectProposal(models.Model):
    """Besoin projet soumis par un membre après échange avec le conseiller IA."""

    STATUS_CHOICES = [
        ("submitted", "Proposition envoyée"),
        ("reviewing", "En cours d'étude"),
        ("accepted", "Acceptée — un expert vous contacte"),
        ("declined", "Non retenue"),
    ]
    SOURCE_CHOICES = [("ai", "IA"), ("guided", "Analyse guidée")]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="project_proposals")
    title = models.CharField(max_length=150)
    need = models.TextField(max_length=3000)
    analysis = models.TextField(max_length=8000, blank=True)
    analysis_source = models.CharField(max_length=10, choices=SOURCE_CHOICES, default="guided")
    conversation = models.JSONField(default=list, blank=True)
    company = models.CharField(max_length=150, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="submitted")
    admin_note = models.TextField(max_length=2000, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["status", "created_at"], name="core_proposal_status_idx")]

    def __str__(self):
        return f"{self.title} — {self.user}"
