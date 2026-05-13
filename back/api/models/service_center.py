from django.db import models
from .user import CustomUser


class ServiceCenter(models.Model):
    user = models.OneToOneField(
        CustomUser,
        on_delete=models.CASCADE,
        related_name="service_center_profile",
    )

    organization_type = models.CharField(
        max_length=50,
        default="health_service_center",
        editable=False,
    )

    center_name = models.CharField(max_length=200)

    province = models.CharField(max_length=100)
    county = models.CharField(max_length=100)
    city = models.CharField(max_length=100)
    address = models.TextField()

    COOPERATION_SCOPE = [
        ("all", "All System Members"),
        ("limited", "Specific Organizations"),
    ]
    cooperation_scope = models.CharField(
        max_length=20,
        choices=COOPERATION_SCOPE,
    )

    target_organization_type = models.CharField(max_length=50, blank=True)
    target_subset_type = models.CharField(max_length=100, blank=True)
    target_subset_name = models.CharField(max_length=200, blank=True)

    SUBSET_CHOICES = [
        ("laboratory", "آزمایشگاهی"),
        ("imaging", "تصویربرداری"),
        ("para_tests", "تست‌های تخصصی پاراکلینیکی"),
        ("other_paraclinic", "سایر خدمات پاراکلینیکی"),
        ("rehabilitation", "خدمات توانبخشی"),
        ("nursing", "پرستاری"),
        ("homecare", "کار در منزل"),
        ("pharmacy", "داروخانه"),
        ("medical_equipment", "لوازم پزشکی"),
        ("transport", "خدمات حمل‌ونقل بیماران مناطق دورافتاده"),
        ("other", "سایر موارد"),
    ]
    subset_types = models.JSONField(default=list)

    other_subset_description = models.CharField(max_length=200, blank=True)

    cooperation_patient_count = models.PositiveIntegerField()

    COOPERATION_PERIOD = [
        ("daily", "روزانه"),
        ("weekly", "هفتگی"),
        ("monthly", "ماهانه"),
        ("other", "سایر"),
    ]
    cooperation_period = models.CharField(
        max_length=20,
        choices=COOPERATION_PERIOD,
    )

    cooperation_period_description = models.CharField(max_length=200, blank=True)

    FREE_DURATION_UNIT = [
        ("week", "هفته"),
        ("month", "ماه"),
        ("year", "سال"),
    ]
    free_duration_value = models.PositiveIntegerField()
    free_duration_unit = models.CharField(
        max_length=10,
        choices=FREE_DURATION_UNIT,
    )

    description = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.center_name
