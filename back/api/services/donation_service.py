"""Donation flows using wallet ledger — pledge/hold model."""

from decimal import Decimal

from django.db import transaction
from django.db.models import F
from django.utils import timezone

from .. import messages as msg
from ..models import (
    BenefactorDonation,
    Campaign,
    DonationHold,
    NetworkRequest,
    Patient,
    RequestStatusLog,
)
from .wallet_service import (
    DonationHoldError,
    InsufficientBalanceError,
    get_or_create_benefactor_wallet,
    get_or_create_platform_wallet,
    get_or_create_staff_payout_wallet,
    hold_amount,
    refund_hold,
    release_hold,
    transfer_between_wallets,
)


class DonationError(Exception):
    pass


def _validate_amount(amount) -> Decimal:
    try:
        value = Decimal(str(amount))
    except Exception as exc:
        raise DonationError(msg.INVALID_AMOUNT) from exc
    if value <= 0:
        raise DonationError(msg.AMOUNT_MUST_BE_POSITIVE)
    return value


@transaction.atomic
def donate_from_wallet(
    *,
    benefactor_user,
    amount,
    destination_type: str,
    campaign_id=None,
    network_request_id=None,
    title: str = "",
    description: str = "",
) -> BenefactorDonation:
    amt = _validate_amount(amount)
    benefactor_wallet = get_or_create_benefactor_wallet(benefactor_user)

    donation_kwargs = {
        "benefactor": benefactor_user,
        "donation_type": "cash",
        "amount": amt,
        "title": title,
        "description": description,
        "destination_type": destination_type,
        "payment_source": "wallet",
        "status": "completed",
    }

    if destination_type == "campaign":
        if not campaign_id:
            raise DonationError(msg.CAMPAIGN_ID_REQUIRED)
        try:
            campaign = Campaign.objects.select_for_update().get(
                pk=campaign_id, is_published=True
            )
        except Campaign.DoesNotExist as exc:
            raise DonationError(msg.CAMPAIGN_NOT_FOUND_OR_UNPUBLISHED) from exc

        debit_tx, _ = transfer_between_wallets(
            benefactor_wallet,
            get_or_create_platform_wallet(),
            amt,
            debit_kind="donation_out",
            credit_kind="donation_in",
            reference_type="donation",
            description=f"Donation to campaign: {campaign.title}",
            created_by=benefactor_user,
        )
        Campaign.objects.filter(pk=campaign.pk).update(
            raised_amount=F("raised_amount") + amt
        )
        donation_kwargs.update(
            {
                "campaign_fk": campaign,
                "campaign": campaign.title,
                "wallet_transaction": debit_tx,
                "title": title or campaign.title,
            }
        )

    elif destination_type == "request":
        if not network_request_id:
            raise DonationError(msg.NETWORK_REQUEST_ID_REQUIRED)
        try:
            req = NetworkRequest.objects.select_for_update().get(pk=network_request_id)
        except NetworkRequest.DoesNotExist as exc:
            raise DonationError(msg.FINANCIAL_REQUEST_NOT_FOUND) from exc

        if req.request_type not in ("financial", "consultation"):
            raise DonationError(msg.REQUEST_NOT_FINANCIAL)
        if not req.amount_needed or req.amount_needed <= 0:
            raise DonationError("این درخواست نیاز مالی ندارد.")
        if req.status not in ("pending", "accepted", "in_progress"):
            raise DonationError(msg.REQUEST_NOT_PAYABLE)

        # Reject over-payment
        already = req.collected_amount or Decimal("0")
        remaining = (req.amount_needed or Decimal("0")) - already
        if amt > remaining:
            raise DonationError(
                f"مبلغ پرداختی ({amt} تومان) بیش از مبلغ باقی‌مانده ({remaining} تومان) است."
            )

        # Hold the money in benefactor's wallet
        debit_tx = hold_amount(
            benefactor_wallet,
            amt,
            reference_type="network_request",
            reference_id=req.pk,
            description=f"Pledge for request: {req.subject}",
            created_by=benefactor_user,
        )

        # Create DonationHold
        DonationHold.objects.create(
            benefactor=benefactor_user,
            network_request=req,
            amount=amt,
            status="held",
            debit_transaction=debit_tx,
        )

        # Bump collected_amount
        NetworkRequest.objects.filter(pk=req.pk).update(
            collected_amount=F("collected_amount") + amt,
            updated_at=timezone.now(),
        )

        # If was pending/accepted, set to in_progress
        if req.status in ("pending", "accepted"):
            req.status = "in_progress"
            req.save(update_fields=["status", "updated_at"])

        patient_label = f"{req.patient.first_name} {req.patient.last_name}".strip()
        donation_kwargs.update(
            {
                "patient": req.patient,
                "patient_name": patient_label,
                "network_request": req,
                "wallet_transaction": debit_tx,
                "title": title or req.subject,
                "status": "held",
            }
        )

    elif destination_type == "general":
        debit_tx, _ = transfer_between_wallets(
            benefactor_wallet,
            get_or_create_platform_wallet(),
            amt,
            debit_kind="donation_out",
            credit_kind="donation_in",
            reference_type="donation",
            description="General donation",
            created_by=benefactor_user,
        )
        donation_kwargs.update(
            {
                "wallet_transaction": debit_tx,
                "title": title or "کمک عمومی",
            }
        )
    else:
        raise DonationError(msg.INVALID_DESTINATION_TYPE)

    donation = BenefactorDonation.objects.create(**donation_kwargs)
    if donation.wallet_transaction_id:
        from ..models import WalletTransaction

        WalletTransaction.objects.filter(pk=donation.wallet_transaction_id).update(
            reference_type="donation",
            reference_id=donation.pk,
        )
    return donation


@transaction.atomic
def close_financial_request(
    *,
    request_id: int,
    closed_by_user,
    action: str,
    note: str = "",
) -> NetworkRequest:
    """Close a financial request by the submitter (HA/doctor).
    action = "complete": release all held money to platform wallet, mark completed.
    action = "cancel": refund all held money back to benefactors, mark cancelled."""

    try:
        req = NetworkRequest.objects.select_for_update().get(pk=request_id)
    except NetworkRequest.DoesNotExist as exc:
        raise DonationError(msg.FINANCIAL_REQUEST_NOT_FOUND) from exc

    if req.request_type not in ("financial", "consultation"):
        raise DonationError(msg.REQUEST_NOT_FINANCIAL)
    if not req.amount_needed or req.amount_needed <= 0:
        raise DonationError("این درخواست نیاز مالی ندارد.")

    # HA/doctor who created financial requests, or doctor handling a medical request with funding
    if req.request_type == "consultation":
        if req.handled_by_id != closed_by_user.id:
            raise DonationError(msg.NOT_HANDLING_REQUEST)
    elif req.created_by_id != closed_by_user.id:
        raise DonationError(msg.NOT_HANDLING_REQUEST)

    if req.status in ("completed", "cancelled"):
        raise DonationError("این درخواست قبلاً بسته شده است.")

    holds = DonationHold.objects.filter(
        network_request=req, status="held"
    ).select_related("benefactor")

    if action == "complete":
        new_status = "completed"
        recipient_user = req.fund_recipient or req.created_by
        payout_wallet = get_or_create_staff_payout_wallet(recipient_user)
        for hold in holds:
            wallet = get_or_create_benefactor_wallet(hold.benefactor)
            _, release_tx = release_hold(
                wallet,
                hold.amount,
                to_wallet=payout_wallet,
                reference_type="network_request",
                reference_id=req.pk,
                description=f"Released for request: {req.subject}",
                created_by=closed_by_user,
            )
            hold.status = "released"
            hold.release_transaction = release_tx
            hold.closed_by = closed_by_user
            hold.closed_at = timezone.now()
            hold.save(
                update_fields=[
                    "status", "release_transaction", "closed_by", "closed_at",
                ]
            )

            # Update donation record
            BenefactorDonation.objects.filter(
                benefactor=hold.benefactor,
                network_request=req,
                status="held",
            ).update(status="completed")

    elif action == "cancel":
        new_status = "cancelled"
        for hold in holds:
            wallet = get_or_create_benefactor_wallet(hold.benefactor)
            refund_tx = refund_hold(
                wallet,
                hold.amount,
                reference_type="network_request",
                reference_id=req.pk,
                description=f"Refunded for cancelled request: {req.subject}",
                created_by=closed_by_user,
            )
            hold.status = "refunded"
            hold.refund_transaction = refund_tx
            hold.closed_by = closed_by_user
            hold.closed_at = timezone.now()
            hold.save(
                update_fields=[
                    "status", "refund_transaction", "closed_by", "closed_at",
                ]
            )

            # Update donation record
            BenefactorDonation.objects.filter(
                benefactor=hold.benefactor,
                network_request=req,
                status="held",
            ).update(status="cancelled")

    else:
        raise DonationError(f"Invalid close action: {action}")

    req.status = new_status
    req.save(update_fields=["status", "updated_at"])

    RequestStatusLog.objects.create(
        request=req,
        status=new_status,
        note=note or ("درخواست تکمیل شد" if action == "complete" else "درخواست لغو شد"),
        actor=closed_by_user,
    )

    return req
