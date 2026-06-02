from django.conf import settings
from django.db import models

from .lookups import Specialty
from .patient import Patient
from .user import CustomUser


class ConsultationRequest(models.Model):
    CONSULTATION_TYPES = [
        ("آنلاین", "آنلاین"),
        ("حضوری", "حضوری"),
        ("تلفنی", "تلفنی"),
    ]
    STATUS_CHOICES = [
        ("در انتظار بررسی", "در انتظار بررسی"),
        ("پذیرفته شده", "پذیرفته شده"),
        ("رد شده", "رد شده"),
        ("انجام شده", "انجام شده"),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="consultation_requests",
    )
    subject = models.CharField(max_length=255)
    description = models.TextField()
    consultationType = models.CharField(max_length=50, choices=CONSULTATION_TYPES)
    preferredDate = models.CharField(max_length=20, blank=True, null=True)
    preferredTime = models.CharField(max_length=20, blank=True, null=True)
    status = models.CharField(
        max_length=50,
        choices=STATUS_CHOICES,
        default="در انتظار بررسی",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"درخواست مشاوره برای {self.user.get_full_name()} - موضوع: {self.subject}"


class PatientServiceRequest(models.Model):
    user = models.OneToOneField(
        CustomUser,
        on_delete=models.CASCADE,
        related_name="patient_service_profile",
        null=True,
        blank=True,
    )
    usingResidence = models.BooleanField()
    numberOfWoman = models.IntegerField()
    numberOfMan = models.IntegerField()
    explain = models.CharField(max_length=512)
    neededService = models.CharField(max_length=512)
    created_at = models.DateTimeField(auto_now_add=True)


class NetworkRequest(models.Model):
    REQUEST_TYPES = [
        ("consultation", "مشاوره پزشکی"),
        ("financial", "حمایت مالی"),
        ("service", "دریافت خدمات"),
    ]
    CONSULTATION_MODES = [
        ("آنلاین", "آنلاین"),
        ("حضوری", "حضوری"),
        ("تلفنی", "تلفنی"),
    ]
    STATUS_CHOICES = [
        ("pending", "در انتظار بررسی"),
        ("accepted", "پذیرفته شده"),
        ("rejected", "رد شده"),
        ("in_progress", "در حال انجام"),
        ("completed", "تکمیل شده"),
    ]

    request_type = models.CharField(max_length=20, choices=REQUEST_TYPES)
    patient = models.ForeignKey(
        Patient,
        on_delete=models.CASCADE,
        related_name="network_requests",
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="created_network_requests",
    )
    specialty = models.ForeignKey(
        Specialty,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    subject = models.CharField(max_length=255)
    description = models.TextField()
    amount_needed = models.DecimalField(
        max_digits=12,
        decimal_places=0,
        null=True,
        blank=True,
    )
    consultation_mode = models.CharField(
        max_length=20,
        choices=CONSULTATION_MODES,
        blank=True,
        default="",
    )
    preferred_date = models.CharField(max_length=20, blank=True, default="")
    preferred_time = models.CharField(max_length=20, blank=True, default="")
    needed_service = models.CharField(max_length=512, blank=True, default="")
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="pending",
    )
    handled_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="handled_network_requests",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.get_request_type_display()} — {self.subject}"


class RequestStatusLog(models.Model):
    request = models.ForeignKey(
        NetworkRequest,
        on_delete=models.CASCADE,
        related_name="status_logs",
    )
    status = models.CharField(max_length=20)
    note = models.TextField(blank=True, default="")
    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]


class BenefactorDonation(models.Model):
    DONATION_TYPES = [
        ("cash", "نقدی"),
        ("non_cash", "غیرنقدی"),
    ]
    STATUS_CHOICES = [
        ("pending", "در انتظار"),
        ("completed", "تکمیل شده"),
    ]
    DESTINATION_TYPES = [
        ("campaign", "Campaign"),
        ("patient", "Patient"),
        ("general", "General"),
        ("request", "Request"),
    ]
    PAYMENT_SOURCES = [
        ("wallet", "Wallet"),
        ("gateway_direct", "Gateway Direct"),
    ]

    benefactor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="donations",
    )
    donation_type = models.CharField(max_length=20, choices=DONATION_TYPES, default="cash")
    amount = models.DecimalField(max_digits=12, decimal_places=0, null=True, blank=True)
    title = models.CharField(max_length=255, blank=True, default="")
    description = models.TextField(blank=True, default="")
    campaign = models.CharField(max_length=255, blank=True, default="")
    patient_name = models.CharField(max_length=255, blank=True, default="")
    campaign_fk = models.ForeignKey(
        "Campaign",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="donations",
    )
    patient = models.ForeignKey(
        Patient,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="donations_received",
    )
    network_request = models.ForeignKey(
        "NetworkRequest",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="donations",
    )
    wallet_transaction = models.ForeignKey(
        "WalletTransaction",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="donations",
    )
    destination_type = models.CharField(
        max_length=20,
        choices=DESTINATION_TYPES,
        blank=True,
        default="",
    )
    payment_source = models.CharField(
        max_length=20,
        choices=PAYMENT_SOURCES,
        blank=True,
        default="wallet",
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="completed")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]


class Campaign(models.Model):
    URGENCY_CHOICES = [
        ("فوری", "فوری"),
        ("متوسط", "متوسط"),
        ("عادی", "عادی"),
    ]
    CATEGORY_CHOICES = [
        ("درمانی", "درمانی"),
        ("دارویی", "دارویی"),
        ("جراحی", "جراحی"),
        ("تجهیزات", "تجهیزات"),
        ("عمومی", "عمومی"),
    ]

    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, default="")
    target_amount = models.DecimalField(max_digits=14, decimal_places=0, default=0)
    raised_amount = models.DecimalField(max_digits=14, decimal_places=0, default=0)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default="عمومی")
    urgency = models.CharField(max_length=50, choices=URGENCY_CHOICES, default="عادی")
    image_url = models.URLField(blank=True, default="")
    is_published = models.BooleanField(default=False)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="campaigns_created",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.title

    @property
    def progress(self):
        if not self.target_amount:
            return 0
        return min(100, int(self.raised_amount * 100 / self.target_amount))
