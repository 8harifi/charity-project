from django.conf import settings
from django.db import models


class PlatformAuditLog(models.Model):
    EVENT_TYPES = [
        ("user_approved", "تأیید کاربر"),
        ("user_rejected", "رد کاربر"),
        ("wallet_adjusted", "تنظیم موجودی"),
        ("user_profile_updated", "ویرایش پروفایل کاربر"),
        ("ha_permission_updated", "تغییر دسترسی سلامتیار"),
        ("lookup_created", "ایجاد داده پایه"),
        ("lookup_updated", "ویرایش داده پایه"),
        ("lookup_deleted", "حذف داده پایه"),
        ("campaign_created", "ایجاد کمپین"),
        ("campaign_updated", "ویرایش کمپین"),
        ("campaign_deleted", "حذف کمپین"),
        ("org_application_received", "ثبت‌نام سازمان"),
        ("ha_patient_claimed", "پذیرش بیمار توسط سلامتیار"),
        ("ha_patient_removed", "حذف بیمار توسط سلامتیار"),
        ("ha_patient_updated", "ویرایش بیمار توسط سلامتیار"),
    ]

    event_type = models.CharField(max_length=50, choices=EVENT_TYPES, db_index=True)
    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="audit_events",
    )
    target_type = models.CharField(max_length=50, blank=True, default="")
    target_id = models.PositiveIntegerField(null=True, blank=True)
    summary = models.TextField()
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["event_type", "created_at"]),
            models.Index(fields=["target_type", "target_id"]),
        ]

    def __str__(self):
        return f"{self.event_type}: {self.summary[:60]}"
