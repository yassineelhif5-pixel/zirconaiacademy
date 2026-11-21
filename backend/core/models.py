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
        ("cancelled", "Annulée"),
    ]

    training = models.CharField(max_length=40, choices=TRAINING_CHOICES)
    full_name = models.CharField(max_length=150)
    email = models.EmailField(max_length=254)
    company = models.CharField(max_length=150, blank=True)
    experience = models.CharField(max_length=20, choices=EXPERIENCE_CHOICES, default="beginner")
    question = models.TextField(blank=True, max_length=1000)
    consent = models.BooleanField(default=False)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="received")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["training", "created_at"]), models.Index(fields=["email"])]

    def __str__(self):
        return f"{self.full_name} — {self.get_training_display()}"


class ProductInterest(models.Model):
    PRODUCT_CHOICES = [
        ("ZirconShield AI", "ZirconShield AI"),
        ("Docyra AI", "Docyra AI"),
        ("StockPilot AI", "StockPilot AI"),
        ("ZirconAcademy AI", "ZirconAcademy AI"),
    ]

    product = models.CharField(max_length=60, choices=PRODUCT_CHOICES)
    full_name = models.CharField(max_length=150)
    email = models.EmailField(max_length=254)
    consent = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["product", "created_at"])]

    def __str__(self):
        return f"{self.full_name} — {self.product}"
