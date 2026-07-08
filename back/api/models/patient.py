from django.db import models

from .lookups import (
    Gender,
    MaritalStatus,
    Education,
    JobStatus,
    HousingStatus,
    CoveredOrganization,
    Insurance,
)
from .health_assistant import HealthAssistant
from .user import CustomUser


class Patient(models.Model):
    user = models.OneToOneField(
        CustomUser,
        on_delete=models.CASCADE,
        related_name="patient_profile"
    )

    # ✅ system identifier (NO UUID)
    patient_code = models.CharField(
        max_length=20,
        unique=True,
        editable=False
    )

    # optional government identifiers
    national_code = models.CharField(
        max_length=10,
        blank=True,
        null=True,
        unique=True,
    )
    # id_number = models.CharField(
    #     max_length=20,
    #     blank=True,
    #     null=True
    # )

    # personal info
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    father_name = models.CharField(max_length=100)

    gender = models.ForeignKey(
        Gender,
        on_delete=models.SET_NULL,
        null=True
    )

    age = models.PositiveIntegerField()

    marital_status = models.ForeignKey(
        MaritalStatus,
        on_delete=models.SET_NULL,
        null=True
    )

    # family
    head_household = models.BooleanField()
    number_dependents = models.PositiveIntegerField(default=0)
    family_status = models.TextField(blank=True)

    # education & job
    education = models.ForeignKey(
        Education,
        on_delete=models.SET_NULL,
        null=True
    )
    job_status = models.ForeignKey(
        JobStatus,
        on_delete=models.SET_NULL,
        null=True
    )
    skill = models.CharField(max_length=100, blank=True)

    # housing
    housing_status = models.ForeignKey(
        HousingStatus,
        on_delete=models.SET_NULL,
        null=True
    )

    # supporting organization
    covered_organization = models.ForeignKey(
        CoveredOrganization,
        on_delete=models.SET_NULL,
        null=True
    )

    # contact
    phone_number = models.CharField(max_length=11)
    landline_number = models.CharField(max_length=20, blank=True)

    # address
    province = models.CharField(max_length=100)
    city = models.CharField(max_length=100)
    address = models.TextField()

    # insurance & medical
    insurance = models.ForeignKey(
        Insurance,
        on_delete=models.SET_NULL,
        null=True
    )
    sickness_description = models.TextField(blank=True, default="")

    # acquaintances
    contact1_full_name = models.CharField(max_length=100, blank=True)
    contact1_phone_number = models.CharField(max_length=20, blank=True)

    contact2_full_name = models.CharField(max_length=100, blank=True)
    contact2_phone_number = models.CharField(max_length=20, blank=True)

    # attachments
    national_card_image = models.ImageField(
        upload_to="patients/national_cards/",
        blank=True,
        null=True
    )
    birth_certificate_image = models.ImageField(
        upload_to="patients/birth_certificates/",
        blank=True,
        null=True
    )

    # introducer (real person)
    introducer = models.ForeignKey(
        HealthAssistant,
        on_delete=models.SET_NULL,
        null=True
    )

    # approval workflow: self-registered patients with an introducer need
    # BOTH admin approval and introducer HA approval before activation.
    admin_approved = models.BooleanField(default=False)
    ha_approved = models.BooleanField(default=False)

    # meta
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.patient_code}"
