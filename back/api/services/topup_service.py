"""Top-up verification with idempotent wallet crediting."""

import uuid
from decimal import Decimal

from django.db import transaction
from django.utils import timezone

from .. import messages as msg
from ..models import GatewayPayment
from .wallet_service import credit_wallet
from .zarinpal import ZarinpalError, payment_verify


class TopUpError(Exception):
    pass


def _credit_verified_payment(payment: GatewayPayment) -> GatewayPayment:
    credit_wallet(
        payment.wallet,
        payment.amount,
        kind="topup",
        reference_type="gateway_payment",
        reference_id=payment.pk,
        description=f"Wallet top-up via {payment.gateway}",
        created_by=payment.user,
    )
    return payment


@transaction.atomic
def mock_instant_topup(*, payment: GatewayPayment) -> GatewayPayment:
    """Skip gateway; mark payment verified and credit wallet immediately."""
    payment = GatewayPayment.objects.select_for_update().get(pk=payment.pk)
    if payment.status == "verified":
        return payment

    payment.authority = payment.authority or f"MOCK-{payment.pk}-{uuid.uuid4().hex[:8]}"
    payment.ref_id = payment.ref_id or f"mock-{payment.pk}"
    payment.gateway = "mock"
    payment.status = "verified"
    payment.verified_at = timezone.now()
    payment.callback_payload = {"mock": True, "note": "ZARINPAL_DISABLED"}
    payment.save(
        update_fields=[
            "authority",
            "ref_id",
            "gateway",
            "status",
            "verified_at",
            "callback_payload",
            "updated_at",
        ]
    )
    return _credit_verified_payment(payment)


@transaction.atomic
def verify_and_credit_topup(*, authority: str, status_param: str) -> GatewayPayment:
    try:
        payment = GatewayPayment.objects.select_for_update().get(authority=authority)
    except GatewayPayment.DoesNotExist as exc:
        raise TopUpError(msg.PAYMENT_NOT_FOUND) from exc

    if payment.status == "verified":
        return payment

    if payment.gateway == "mock" or authority.startswith("MOCK-"):
        payment.status = "verified"
        payment.verified_at = timezone.now()
        payment.save(update_fields=["status", "verified_at", "updated_at"])
        return _credit_verified_payment(payment)

    if status_param != "OK":
        payment.status = "failed"
        payment.callback_payload = {"Status": status_param}
        payment.save(update_fields=["status", "callback_payload", "updated_at"])
        raise TopUpError(msg.PAYMENT_CANCELLED_OR_FAILED)

    try:
        verify_result = payment_verify(authority=authority, amount=payment.amount)
    except ZarinpalError as exc:
        payment.status = "failed"
        payment.callback_payload = {"error": str(exc)}
        payment.save(update_fields=["status", "callback_payload", "updated_at"])
        raise TopUpError(str(exc)) from exc

    payment.ref_id = verify_result.ref_id
    payment.status = "verified"
    payment.verified_at = timezone.now()
    payment.callback_payload = verify_result.raw
    payment.save(
        update_fields=["ref_id", "status", "verified_at", "callback_payload", "updated_at"]
    )

    return _credit_verified_payment(payment)
