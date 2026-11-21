from django.contrib import admin
from .models import ProductInterest, TrainingRegistration


@admin.register(TrainingRegistration)
class TrainingRegistrationAdmin(admin.ModelAdmin):
    list_display = ("full_name", "email", "training", "experience", "status", "created_at")
    list_filter = ("training", "experience", "status", "created_at")
    search_fields = ("full_name", "email", "company")
    readonly_fields = ("created_at",)
    date_hierarchy = "created_at"


@admin.register(ProductInterest)
class ProductInterestAdmin(admin.ModelAdmin):
    list_display = ("full_name", "email", "product", "created_at")
    list_filter = ("product", "created_at")
    search_fields = ("full_name", "email")
    readonly_fields = ("created_at",)
    date_hierarchy = "created_at"
