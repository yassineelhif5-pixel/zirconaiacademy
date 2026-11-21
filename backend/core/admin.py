from django.contrib import admin
from .models import ProductInterest, ProjectProposal, TrainingRegistration


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


@admin.register(ProjectProposal)
class ProjectProposalAdmin(admin.ModelAdmin):
    list_display = ("title", "user", "status", "analysis_source", "created_at")
    list_filter = ("status", "analysis_source", "created_at")
    search_fields = ("title", "need", "user__email", "user__username", "company")
    readonly_fields = ("created_at", "updated_at")
    date_hierarchy = "created_at"
