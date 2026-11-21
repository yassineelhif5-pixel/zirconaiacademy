from django.contrib.auth import get_user_model
from rest_framework import serializers
User=get_user_model()
class RegisterSerializer(serializers.ModelSerializer):
    password=serializers.CharField(write_only=True,min_length=12,max_length=128)
    class Meta:
        model=User
        fields=["id","username","email","first_name","last_name","password"]
        read_only_fields=["id"]
    def validate_email(self,value):
        value=value.strip().lower()
        if User.objects.filter(email__iexact=value).exists(): raise serializers.ValidationError("Cette adresse email est déjà utilisée.")
        return value
    def validate_username(self,value):
        value=value.strip()
        if User.objects.filter(username__iexact=value).exists(): raise serializers.ValidationError("Cet identifiant est déjà utilisé.")
        return value
    def create(self,validated_data): return User.objects.create_user(**validated_data)
