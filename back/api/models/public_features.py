from django.conf import settings
from django.db import models

from .patient import Patient


class MedicalCenter(models.Model):
    CENTER_TYPES = [
        ("government", "دولتی"),
        ("private", "خصوصی"),
    ]

    name = models.CharField(max_length=255)
    province = models.CharField(max_length=100, default="کرمان")
    city = models.CharField(max_length=100, default="کرمان")
    center_type = models.CharField(max_length=20, choices=CENTER_TYPES, default="government")
    address = models.TextField(blank=True, default="")
    landline = models.CharField(max_length=30, blank=True, default="")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class DoctorScheduleImage(models.Model):
    SHIFTS = [
        ("morning", "صبح"),
        ("evening", "عصر"),
        ("all", "تمام‌وقت"),
    ]
    SPECIALTY_LEVELS = [
        ("gp", "عمومی"),
        ("specialist", "متخصص"),
        ("super", "فوق تخصص"),
    ]
    WEEKDAYS = [
        ("sat", "شنبه"),
        ("sun", "یکشنبه"),
        ("mon", "دوشنبه"),
        ("tue", "سه‌شنبه"),
        ("wed", "چهارشنبه"),
        ("thu", "پنجشنبه"),
        ("fri", "جمعه"),
    ]

    center = models.ForeignKey(
        MedicalCenter,
        on_delete=models.CASCADE,
        related_name="schedule_images",
    )
    image = models.ImageField(upload_to="medical_centers/schedules/")
    caption = models.CharField(max_length=255, blank=True, default="")
    shift = models.CharField(max_length=20, choices=SHIFTS, default="all")
    weekday = models.CharField(max_length=10, choices=WEEKDAYS, blank=True, default="")
    specialty_name = models.CharField(max_length=100, blank=True, default="")
    doctor_name = models.CharField(max_length=150, blank=True, default="")
    specialty_level = models.CharField(max_length=20, choices=SPECIALTY_LEVELS, blank=True, default="")
    sort_order = models.PositiveSmallIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["sort_order", "id"]


class ContactMessage(models.Model):
    INTENT_CHOICES = [
        ("general", "عمومی"),
        ("join_helper", "پیوستن از طریق همیار شبکه"),
        ("patient_guide", "راهنمای بیمار / سوال سیر درمان"),
        ("contact_disclosure", "درخواست مشخصات تماس بیمار"),
        ("network_consultant", "مشاوره شبکه"),
    ]
    STATUS_CHOICES = [
        ("pending", "در انتظار پاسخ"),
        ("answered", "پاسخ داده شده"),
        ("closed", "بسته شده"),
    ]

    name = models.CharField(max_length=150)
    phone = models.CharField(max_length=20)
    email = models.EmailField(blank=True, default="")
    region = models.CharField(max_length=150, blank=True, default="")
    subject = models.CharField(max_length=255, blank=True, default="")
    message = models.TextField()
    intent = models.CharField(max_length=40, choices=INTENT_CHOICES, default="general")
    patient = models.ForeignKey(
        Patient,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="contact_messages",
    )
    network_request = models.ForeignKey(
        "NetworkRequest",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="contact_messages",
    )
    submitted_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="contact_messages_submitted",
    )
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="contact_messages_assigned",
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    reply = models.TextField(blank=True, default="")
    sms_sent = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]


class SmsLog(models.Model):
    phone = models.CharField(max_length=20)
    body = models.TextField()
    purpose = models.CharField(max_length=80, blank=True, default="")
    sent = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]


class PasswordResetCode(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="password_reset_codes",
    )
    code_hash = models.CharField(max_length=128)
    expires_at = models.DateTimeField()
    used_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]


class RequestReadReceipt(models.Model):
    request = models.ForeignKey(
        "NetworkRequest",
        on_delete=models.CASCADE,
        related_name="read_receipts",
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="request_read_receipts",
    )
    read_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("request", "user")
        ordering = ["-read_at"]


class ContactDisclosureRequest(models.Model):
    STATUS_CHOICES = [
        ("pending", "در انتظار هماهنگی"),
        ("approved", "موافقت شد"),
        ("rejected", "رد شد"),
        ("notified", "اطلاع‌رسانی شد"),
    ]

    benefactor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="contact_disclosure_requests",
    )
    patient = models.ForeignKey(
        Patient,
        on_delete=models.CASCADE,
        related_name="contact_disclosure_requests",
    )
    network_request = models.ForeignKey(
        "NetworkRequest",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="contact_disclosure_requests",
    )
    contact_message = models.ForeignKey(
        ContactMessage,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="disclosure_requests",
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    note = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
