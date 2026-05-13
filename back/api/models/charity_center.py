from django.db import models
from .user import CustomUser


class CharityCenter(models.Model):
    user = models.OneToOneField(
        CustomUser,
        on_delete=models.CASCADE,
        related_name="charity_center_profile",
    )

    organization_type = models.CharField(
        max_length=50,
        default="charity_center",
        editable=False,
    )

    center_name = models.CharField(max_length=200)

    introduction = models.TextField(blank=True)

    HAS_LICENSE = [
        ("yes", "Has License"),
        ("no", "No License"),
    ]
    has_license = models.CharField(max_length=5, choices=HAS_LICENSE)

    registration_number = models.CharField(max_length=100, blank=True)

    start_year = models.PositiveIntegerField(null=True, blank=True)

    LICENSE_ISSUER = [
        ("interior_ministry", "وزارت کشور"),
        ("behzisti", "سازمان بهزیستی"),
        ("police", "نیروی انتظامی"),
        ("culture_ministry", "وزارت فرهنگ و ارشاد"),
        ("emdad", "کمیته امداد"),
    ]
    license_issuer = models.CharField(
        max_length=50,
        choices=LICENSE_ISSUER,
        blank=True,
    )

    specialization_fields = models.TextField(blank=True)

    target_community = models.TextField(blank=True)

    sharable_facilities = models.TextField(blank=True)

    ceo_name = models.CharField(max_length=200)

    ceo_phone = models.CharField(max_length=20)

    board_chairman_name = models.CharField(max_length=200)

    board_chairman_phone = models.CharField(max_length=20)

    board_members = models.TextField(blank=True)

    phone_city_code = models.CharField(max_length=10)

    phone_number = models.CharField(max_length=20)

    fax_number = models.CharField(max_length=20, blank=True)

    province = models.CharField(max_length=100)
    county = models.CharField(max_length=100)
    city = models.CharField(max_length=100)
    address = models.TextField()

    ACTIVITY_SCOPE = [
        ("village", "روستا"),
        ("city", "شهر"),
        ("county", "شهرستان"),
        ("province", "استان"),
        ("country", "کشور"),
        ("international", "بین الملل"),
    ]
    activity_scope = models.CharField(
        max_length=20,
        choices=ACTIVITY_SCOPE,
    )

    representative_name = models.CharField(max_length=200)

    representative_mobile = models.CharField(max_length=11)

    membership_request_letter = models.FileField(
        upload_to="charity_centers/letters/",
    )

    activity_license_file = models.FileField(
        upload_to="charity_centers/licenses/",
        blank=True,
        null=True,
    )

    logo = models.ImageField(
        upload_to="charity_centers/logos/",
        blank=True,
        null=True,
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.center_name
