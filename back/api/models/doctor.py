from django.db import models

from .user import CustomUser
from .lookups import Gender, Specialty


class Doctor(models.Model):
    user = models.OneToOneField(
        CustomUser,
        on_delete=models.CASCADE,
        related_name="doctor_profile",
    )

    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    father_name = models.CharField(max_length=100)
    gender = models.ForeignKey(
        Gender,
        on_delete=models.SET_NULL,
        null=True,
    )
    national_code = models.CharField(max_length=10, unique=True)
    medical_system_code = models.CharField(
        max_length=20,
        unique=True,
    )
    phone_number = models.CharField(
        max_length=11,
        help_text="Doctor or secretary mobile",
    )
    specialty = models.ForeignKey(
        Specialty,
        on_delete=models.SET_NULL,
        null=True,
    )

    # Address
    province = models.CharField(max_length=100)
    city = models.CharField(max_length=100)
    address = models.TextField()

    cooperating_health_assistants = models.ManyToManyField(
        "HealthAssistant",
        related_name="cooperating_doctors",
        blank=True,
        help_text="Selected health assistants to cooperate with. Empty means all.",
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

    def cooperates_with_all_health_assistants(self) -> bool:
        return not self.cooperating_health_assistants.exists()

    def filter_patients_by_cooperation(self, queryset):
        """Restrict patients to those introduced by selected health assistants."""
        if self.cooperates_with_all_health_assistants():
            return queryset
        return queryset.filter(
            introducer_id__in=self.cooperating_health_assistants.values_list("pk", flat=True)
        )
