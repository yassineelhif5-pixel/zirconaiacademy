from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [
        ("core", "0001_initial"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AddField(
            model_name="trainingregistration",
            name="user",
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="training_registrations", to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name="trainingregistration",
            name="confirmed_date",
            field=models.DateField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="productinterest",
            name="user",
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="product_interests", to=settings.AUTH_USER_MODEL),
        ),
    ]
