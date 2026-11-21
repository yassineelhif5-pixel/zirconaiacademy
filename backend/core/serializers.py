from rest_framework import serializers
from .models import ProductInterest, TrainingRegistration


class TrainingRegistrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = TrainingRegistration
        fields = ["id", "training", "full_name", "email", "company", "experience", "question", "consent", "status", "confirmed_date", "created_at"]
        read_only_fields = ["id", "status", "confirmed_date", "created_at"]

    def validate_consent(self, value):
        if value is not True:
            raise serializers.ValidationError("Le consentement est obligatoire pour traiter votre demande.")
        return value

    def validate_full_name(self, value):
        value = " ".join(value.split())
        if len(value) < 2:
            raise serializers.ValidationError("Veuillez saisir votre nom et prénom.")
        return value

    def validate_question(self, value):
        return value.strip()


class ProductInterestSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductInterest
        fields = ["id", "product", "full_name", "email", "consent", "created_at"]
        read_only_fields = ["id", "created_at"]

    def validate_consent(self, value):
        if value is not True:
            raise serializers.ValidationError("Le consentement est obligatoire pour traiter votre demande.")
        return value

    def validate_full_name(self, value):
        return " ".join(value.split())
