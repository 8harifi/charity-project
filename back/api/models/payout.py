import re

from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models


SHEBA_RE = re.compile(r"^IR\d{24}$")


def validate_sheba(value: str):
    cleaned = (value or "").replace(" ", "").upper()
    if not SHEBA_RE.match(cleaned):
        raise ValidationError("شماره شبا باید با IR شروع شود و ۲۴ رقم داشته باشد.")
    return cleaned


class PayoutAccount(models.Model):
    """Bank account a staff member (HA/doctor) uses to withdraw released funds."""

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="payout_account",
    )
    sheba = models.CharField(max_length=26)
    account_holder_name = models.CharField(max_length=200)
    bank_name = models.CharField(max_length=100, blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def clean(self):
        self.sheba = validate_sheba(self.sheba)

    def save(self, *args, **kwargs):
        self.sheba = (self.sheba or "").replace(" ", "").upper()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.account_holder_name} — {self.sheba}"


class WithdrawalRequest(models.Model):
    STATUS_CHOICES = [
        ("pending", "در انتظار بررسی"),
        ("approved", "تأیید شده"),
        ("paid", "پرداخت شده"),
        ("rejected", "رد شده"),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="withdrawal_requests",
    )
    amount = models.DecimalField(max_digits=14, decimal_places=0)
    sheba = models.CharField(max_length=26)
    account_holder_name = models.CharField(max_length=200)
    bank_name = models.CharField(max_length=100, blank=True, default="")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    note = models.TextField(blank=True, default="")
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="withdrawals_reviewed",
    )
    reviewed_at = models.DateTimeField(null=True, blank=True)
    wallet_transaction = models.ForeignKey(
        "WalletTransaction",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="withdrawal_requests",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Withdrawal #{self.pk} — {self.amount} ({self.status})"
