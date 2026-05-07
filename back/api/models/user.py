from django.contrib.auth.models import AbstractUser
from django.db import models


class CustomUser(AbstractUser):
    ROLE_CHOICES = [
        ("admin", "Admin"),
        ("patient", "Patient"),
        ("benefactor", "Benefactor"),
        ("health_assistant", "Health Assistant"),
        ("doctor", "Doctor"),
        ("service_center", "Service Center"),
        ("charity_center", "Charity Center"),
        ("social_work_unit", "Social Work Unit"),
    ]

    role = models.CharField(max_length=30, choices=ROLE_CHOICES)

    state = models.BooleanField(default=False)

    def save(self, *args, **kwargs):
        if self.is_superuser:
            self.role = "admin"
        super().save(*args, **kwargs)

    def __str__(self):
        return self.username
