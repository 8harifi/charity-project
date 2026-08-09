from django.db import models
from .lookups import (
    HealthAssistantCooperationType,
    Gender,
    Education,
    OrganizationType
)
from .user import CustomUser


class HealthAssistant(models.Model):
    user = models.OneToOneField(
        CustomUser,
        on_delete=models.CASCADE,
        related_name="health_assistant_profile",
    )

    # system identifier
    health_assistance_code = models.CharField(
        max_length=20,
        unique=True,
        editable=False
    )

    cooperation_type = models.ForeignKey(
        HealthAssistantCooperationType,
        on_delete=models.SET_NULL,
        null=True
    )
    cooperation_description = models.TextField()

    # Baseline capabilities, scoped to patients this assistant introduced.
    can_approve_patients = models.BooleanField(default=True)
    can_claim_orphan_patients = models.BooleanField(default=True)
    can_create_financial = models.BooleanField(default=True)
    can_create_services = models.BooleanField(default=True)
    can_create_visits = models.BooleanField(default=True)
    can_edit_patients = models.BooleanField(default=True)

    # Widen approve/edit from "my caseload" to every patient on the platform.
    can_approve_registration_all = models.BooleanField(default=False)
    can_edit_registration_all = models.BooleanField(default=False)
    can_approve_visits_all = models.BooleanField(default=False)
    can_edit_visits_all = models.BooleanField(default=False)
    can_approve_financial_all = models.BooleanField(default=False)
    can_edit_financial_all = models.BooleanField(default=False)
    can_approve_services_all = models.BooleanField(default=False)
    can_edit_services_all = models.BooleanField(default=False)

    # Which entity types this assistant may reach through the global search.
    can_search_patients = models.BooleanField(default=True)
    can_search_doctors = models.BooleanField(default=True)
    can_search_assistants = models.BooleanField(default=False)
    can_search_benefactors = models.BooleanField(default=False)
    can_search_organizations = models.BooleanField(default=False)

    org_approved = models.BooleanField(default=False)
    parent_organization = models.ForeignKey(
        "self",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="subordinate_assistants",
    )

    created_at = models.DateTimeField(auto_now_add=True)


class IndividualHealthAssistant(models.Model):
    health_assistant = models.OneToOneField(
        HealthAssistant,
        on_delete=models.CASCADE,
        related_name="individual_profile"
    )
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    gender = models.ForeignKey(
        Gender,
        on_delete=models.SET_NULL,
        null=True
    )
    national_code = models.CharField(max_length=10, unique=True)
    phone_number = models.CharField(max_length=11)
    education = models.ForeignKey(
        Education,
        on_delete=models.SET_NULL,
        null=True
    )
    job = models.CharField(max_length=100)

    # address
    province = models.CharField(max_length=100)
    city = models.CharField(max_length=100)
    home_address = models.TextField()
    work_address = models.TextField()


class OrganizationHealthAssistant(models.Model):
    health_assistant = models.OneToOneField(
        HealthAssistant,
        on_delete=models.CASCADE,
        related_name="organization_profile"
    )
    organization_type = models.ForeignKey(
        OrganizationType,
        on_delete=models.SET_NULL,
        null=True
    )
    name = models.CharField(max_length=100)

    director_first_name = models.CharField(max_length=100)
    director_last_name = models.CharField(max_length=100)
    director_phone_number = models.CharField(max_length=11)
    director_landline_number = models.CharField(max_length=11)

    province = models.CharField(max_length=100)
    city = models.CharField(max_length=100)
    address = models.TextField()

    social_unit_head_first_name = models.CharField(max_length=100)
    social_unit_head_last_name = models.CharField(max_length=100)
    social_unit_head_phone_number = models.CharField(max_length=100)
    social_unit_head_landline_number = models.CharField(max_length=100)
