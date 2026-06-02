import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


def seed_campaigns(apps, schema_editor):
    Campaign = apps.get_model("api", "Campaign")
    defaults = [
        {
            "title": "جراحی کودکان",
            "description": "حمایت از هزینه جراحی کودکان نیازمند",
            "target_amount": 500_000_000,
            "category": "جراحی",
            "urgency": "فوری",
            "is_published": True,
        },
        {
            "title": "بیماران سرطانی",
            "description": "کمک به درمان بیماران مبتلا به سرطان",
            "target_amount": 750_000_000,
            "category": "درمانی",
            "urgency": "متوسط",
            "is_published": True,
        },
        {
            "title": "صندوق عمومی",
            "description": "صندوق عمومی حمایت از بیماران نیازمند",
            "target_amount": 1_000_000_000,
            "category": "عمومی",
            "urgency": "عادی",
            "is_published": True,
        },
    ]
    for item in defaults:
        Campaign.objects.get_or_create(title=item["title"], defaults=item)


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0013_alter_customuser_state"),
    ]

    operations = [
        migrations.CreateModel(
            name="Campaign",
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
                ("title", models.CharField(max_length=255)),
                ("description", models.TextField(blank=True, default="")),
                (
                    "target_amount",
                    models.DecimalField(decimal_places=0, default=0, max_digits=14),
                ),
                (
                    "raised_amount",
                    models.DecimalField(decimal_places=0, default=0, max_digits=14),
                ),
                (
                    "category",
                    models.CharField(
                        choices=[
                            ("درمانی", "درمانی"),
                            ("دارویی", "دارویی"),
                            ("جراحی", "جراحی"),
                            ("تجهیزات", "تجهیزات"),
                            ("عمومی", "عمومی"),
                        ],
                        default="عمومی",
                        max_length=50,
                    ),
                ),
                (
                    "urgency",
                    models.CharField(
                        choices=[
                            ("فوری", "فوری"),
                            ("متوسط", "متوسط"),
                            ("عادی", "عادی"),
                        ],
                        default="عادی",
                        max_length=50,
                    ),
                ),
                ("image_url", models.URLField(blank=True, default="")),
                ("is_published", models.BooleanField(default=False)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "created_by",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="campaigns_created",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                "ordering": ["-created_at"],
            },
        ),
        migrations.RunPython(seed_campaigns, migrations.RunPython.noop),
    ]
