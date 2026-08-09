from django.conf import settings
from django.db import models


class OrganizationApplication(models.Model):
    ORGANIZATION_ROLES = [
        ("service_center", "Service Center"),
        ("charity_center", "Charity Center"),
        ("social_work_unit", "Social Work Unit"),
    ]

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="organization_application",
    )
    organization_role = models.CharField(max_length=30, choices=ORGANIZATION_ROLES)
    org_type = models.CharField(max_length=100, blank=True, default="")
    org_subtype = models.CharField(max_length=100, blank=True, default="")
    name = models.CharField(max_length=255, blank=True, default="")
    province = models.CharField(max_length=100, blank=True, default="")
    city = models.CharField(max_length=100, blank=True, default="")
    payload = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.name or self.user.username} ({self.organization_role})"
