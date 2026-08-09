from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0026_organization_application"),
    ]

    operations = [
        migrations.CreateModel(
            name="PlatformAuditLog",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                (
                    "event_type",
                    models.CharField(
                        choices=[
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
                        ],
                        db_index=True,
                        max_length=50,
                    ),
                ),
                ("target_type", models.CharField(blank=True, default="", max_length=50)),
                ("target_id", models.PositiveIntegerField(blank=True, null=True)),
                ("summary", models.TextField()),
                ("metadata", models.JSONField(blank=True, default=dict)),
                ("created_at", models.DateTimeField(auto_now_add=True, db_index=True)),
                (
                    "actor",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="audit_events",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                "ordering": ["-created_at"],
                "indexes": [
                    models.Index(fields=["event_type", "created_at"], name="api_platfor_event_t_8e0f0d_idx"),
                    models.Index(fields=["target_type", "target_id"], name="api_platfor_target__a1b2c3_idx"),
                ],
            },
        ),
    ]
