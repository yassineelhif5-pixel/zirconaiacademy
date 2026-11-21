from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("core", "0002_registration_ownership_and_date"),
    ]

    operations = [
        migrations.AlterField(
            model_name="trainingregistration",
            name="status",
            field=models.CharField(
                choices=[
                    ("received", "Demande reçue"),
                    ("reviewing", "À traiter"),
                    ("confirmed", "Confirmée"),
                    ("cancelled", "Refusée / annulée"),
                ],
                default="received",
                max_length=20,
            ),
        ),
    ]
