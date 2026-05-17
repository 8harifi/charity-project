from django.db import models

from . import Gender
from .user import CustomUser


class Benefactor(models.Model):
    user = models.OneToOneField(
        CustomUser,
        on_delete=models.CASCADE,
        related_name="benefactor_profile",
    )

    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)

    gender = models.ForeignKey(
        Gender,
        on_delete=models.SET_NULL,
        null=True
    )

    national_code = models.CharField(
        max_length=10,
        unique=True,
    )

    phone_number = models.CharField(
        max_length=11,
        blank=True,
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"
