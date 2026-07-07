from django.db import models

from .user import CustomUser


class AdminProfile(models.Model):
    user = models.OneToOneField(
        CustomUser,
        on_delete=models.CASCADE,
        related_name="admin_profile",
    )
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    phone_number = models.CharField(max_length=11, unique=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name}".strip() or self.phone_number

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        if self.user.username != self.phone_number:
            self.user.username = self.phone_number
            self.user.save(update_fields=["username"])
