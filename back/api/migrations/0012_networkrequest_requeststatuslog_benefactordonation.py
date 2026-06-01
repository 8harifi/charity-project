import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0011_seed_patient_lookups"),
    ]

    operations = [
        migrations.CreateModel(
            name="NetworkRequest",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                (
                    "request_type",
                    models.CharField(
                        choices=[
                            ("consultation", "مشاوره پزشکی"),
                            ("financial", "حمایت مالی"),
                            ("service", "دریافت خدمات"),
                        ],
                        max_length=20,
                    ),
                ),
                ("subject", models.CharField(max_length=255)),
                ("description", models.TextField()),
                (
                    "amount_needed",
                    models.DecimalField(
                        blank=True, decimal_places=0, max_digits=12, null=True
                    ),
                ),
                (
                    "consultation_mode",
                    models.CharField(
                        blank=True,
                        choices=[
                            ("آنلاین", "آنلاین"),
                            ("حضوری", "حضوری"),
                            ("تلفنی", "تلفنی"),
                        ],
                        default="",
                        max_length=20,
                    ),
                ),
                (
                    "preferred_date",
                    models.CharField(blank=True, default="", max_length=20),
                ),
                (
                    "preferred_time",
                    models.CharField(blank=True, default="", max_length=20),
                ),
                (
                    "needed_service",
                    models.CharField(blank=True, default="", max_length=512),
                ),
                (
                    "status",
                    models.CharField(
                        choices=[
                            ("pending", "در انتظار بررسی"),
                            ("accepted", "پذیرفته شده"),
                            ("rejected", "رد شده"),
                            ("in_progress", "در حال انجام"),
                            ("completed", "تکمیل شده"),
                        ],
                        default="pending",
                        max_length=20,
                    ),
                ),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "created_by",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="created_network_requests",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
                (
                    "handled_by",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="handled_network_requests",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
                (
                    "patient",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="network_requests",
                        to="api.patient",
                    ),
                ),
                (
                    "specialty",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        to="api.specialty",
                    ),
                ),
            ],
            options={
                "ordering": ["-created_at"],
            },
        ),
        migrations.CreateModel(
            name="RequestStatusLog",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("status", models.CharField(max_length=20)),
                ("note", models.TextField(blank=True, default="")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                (
                    "actor",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
                (
                    "request",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="status_logs",
                        to="api.networkrequest",
                    ),
                ),
            ],
            options={
                "ordering": ["created_at"],
            },
        ),
        migrations.CreateModel(
            name="BenefactorDonation",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                (
                    "donation_type",
                    models.CharField(
                        choices=[("cash", "نقدی"), ("non_cash", "غیرنقدی")],
                        default="cash",
                        max_length=20,
                    ),
                ),
                (
                    "amount",
                    models.DecimalField(
                        blank=True, decimal_places=0, max_digits=12, null=True
                    ),
                ),
                ("title", models.CharField(blank=True, default="", max_length=255)),
                ("description", models.TextField(blank=True, default="")),
                ("campaign", models.CharField(blank=True, default="", max_length=255)),
                (
                    "patient_name",
                    models.CharField(blank=True, default="", max_length=255),
                ),
                (
                    "status",
                    models.CharField(
                        choices=[("pending", "در انتظار"), ("completed", "تکمیل شده")],
                        default="completed",
                        max_length=20,
                    ),
                ),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                (
                    "benefactor",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="donations",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                "ordering": ["-created_at"],
            },
        ),
    ]
