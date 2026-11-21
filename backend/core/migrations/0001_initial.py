# Generated for ProjectAcademy core data models.
from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True
    dependencies = []
    operations = [
        migrations.CreateModel(
            name="TrainingRegistration",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("training", models.CharField(choices=[("cyber-defense", "AI Cyber Defense"), ("ai-architecture", "AI Future Architect")], max_length=40)),
                ("full_name", models.CharField(max_length=150)),
                ("email", models.EmailField(max_length=254)),
                ("company", models.CharField(blank=True, max_length=150)),
                ("experience", models.CharField(choices=[("beginner", "Débutant"), ("intermediate", "Intermédiaire"), ("advanced", "Avancé")], default="beginner", max_length=20)),
                ("question", models.TextField(blank=True, max_length=1000)),
                ("consent", models.BooleanField(default=False)),
                ("status", models.CharField(choices=[("received", "Demande reçue"), ("reviewing", "À traiter"), ("confirmed", "Confirmée"), ("cancelled", "Annulée")], default="received", max_length=20)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
            ],
            options={"ordering": ["-created_at"]},
        ),
        migrations.CreateModel(
            name="ProductInterest",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("product", models.CharField(choices=[("ZirconShield AI", "ZirconShield AI"), ("Docyra AI", "Docyra AI"), ("StockPilot AI", "StockPilot AI"), ("ZirconAcademy AI", "ZirconAcademy AI")], max_length=60)),
                ("full_name", models.CharField(max_length=150)),
                ("email", models.EmailField(max_length=254)),
                ("consent", models.BooleanField(default=False)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
            ],
            options={"ordering": ["-created_at"]},
        ),
        migrations.AddIndex(
            model_name="trainingregistration",
            index=models.Index(fields=["training", "created_at"], name="core_train_training_1a1f_idx"),
        ),
        migrations.AddIndex(
            model_name="trainingregistration",
            index=models.Index(fields=["email"], name="core_train_email_7c2d_idx"),
        ),
        migrations.AddIndex(
            model_name="productinterest",
            index=models.Index(fields=["product", "created_at"], name="core_prod_product_5e3a_idx"),
        ),
    ]
