from django.conf import settings
from django.db import models

from .patient import Patient


class Wallet(models.Model):
    WALLET_TYPES = [
        ("benefactor", "Benefactor"),
        ("patient_escrow", "Patient Escrow"),
        ("platform", "Platform"),
    ]

    owner_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="wallets",
    )
    owner_patient = models.OneToOneField(
        Patient,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="escrow_wallet",
    )
    wallet_type = models.CharField(max_length=20, choices=WALLET_TYPES)
    cached_balance = models.DecimalField(max_digits=14, decimal_places=0, default=0)
    currency = models.CharField(max_length=3, default="IRR")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["owner_user"],
                condition=models.Q(wallet_type="benefactor"),
                name="unique_benefactor_wallet_per_user",
            ),
        ]

    def __str__(self):
        if self.wallet_type == "benefactor" and self.owner_user_id:
            return f"Wallet({self.wallet_type}, user={self.owner_user_id})"
        if self.wallet_type == "patient_escrow" and self.owner_patient_id:
            return f"Wallet({self.wallet_type}, patient={self.owner_patient_id})"
        return f"Wallet({self.wallet_type}, id={self.pk})"


class WalletTransaction(models.Model):
    ENTRY_TYPES = [
        ("credit", "Credit"),
        ("debit", "Debit"),
    ]
    KINDS = [
        ("topup", "Top-up"),
        ("donation_out", "Donation Out"),
        ("donation_in", "Donation In"),
        ("disbursement", "Disbursement"),
        ("refund", "Refund"),
        ("adjustment", "Adjustment"),
    ]
    REFERENCE_TYPES = [
        ("gateway_payment", "Gateway Payment"),
        ("donation", "Donation"),
        ("network_request", "Network Request"),
        ("disbursement", "Disbursement"),
    ]

    wallet = models.ForeignKey(
        Wallet,
        on_delete=models.CASCADE,
        related_name="transactions",
    )
    entry_type = models.CharField(max_length=10, choices=ENTRY_TYPES)
    amount = models.DecimalField(max_digits=14, decimal_places=0)
    kind = models.CharField(max_length=20, choices=KINDS)
    reference_type = models.CharField(
        max_length=30,
        choices=REFERENCE_TYPES,
        blank=True,
        default="",
    )
    reference_id = models.PositiveIntegerField(null=True, blank=True)
    counterparty_wallet = models.ForeignKey(
        Wallet,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="counterparty_transactions",
    )
    description = models.TextField(blank=True, default="")
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="wallet_transactions_created",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["wallet", "created_at"]),
            models.Index(fields=["reference_type", "reference_id"]),
        ]


class GatewayPayment(models.Model):
    STATUS_CHOICES = [
        ("created", "Created"),
        ("redirected", "Redirected"),
        ("verified", "Verified"),
        ("failed", "Failed"),
        ("expired", "Expired"),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="gateway_payments",
    )
    wallet = models.ForeignKey(
        Wallet,
        on_delete=models.CASCADE,
        related_name="gateway_payments",
    )
    amount = models.DecimalField(max_digits=14, decimal_places=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="created")
    authority = models.CharField(max_length=64, blank=True, null=True, unique=True)
    ref_id = models.CharField(max_length=64, blank=True, null=True, unique=True)
    gateway = models.CharField(max_length=32, default="zarinpal")
    callback_payload = models.JSONField(default=dict, blank=True)
    verified_at = models.DateTimeField(null=True, blank=True)
    idempotency_key = models.CharField(max_length=64, blank=True, default="", db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]


class PatientDisbursement(models.Model):
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("completed", "Completed"),
    ]

    patient_wallet = models.ForeignKey(
        Wallet,
        on_delete=models.CASCADE,
        related_name="disbursements",
    )
    amount = models.DecimalField(max_digits=14, decimal_places=0)
    network_request = models.ForeignKey(
        "NetworkRequest",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="disbursements",
    )
    payee_description = models.TextField(blank=True, default="")
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="disbursements_approved",
    )
    wallet_transaction = models.ForeignKey(
        WalletTransaction,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="disbursement_record",
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
