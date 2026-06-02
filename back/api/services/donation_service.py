"""Donation flows using wallet ledger."""

from decimal import Decimal

from django.db import transaction
from django.db.models import F

from .. import messages as msg
from ..models import BenefactorDonation, Campaign, NetworkRequest, Patient
from .wallet_service import (
    InsufficientBalanceError,
    get_or_create_benefactor_wallet,
    get_or_create_patient_escrow_wallet,
    get_or_create_platform_wallet,
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
    patient_id=None,
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

    elif destination_type == "patient":
        if not patient_id:
            raise DonationError(msg.PATIENT_ID_REQUIRED)
        try:
            patient = Patient.objects.get(pk=patient_id)
        except Patient.DoesNotExist as exc:
            raise DonationError(msg.PATIENT_NOT_FOUND) from exc

        patient_wallet = get_or_create_patient_escrow_wallet(patient)
        debit_tx, _ = transfer_between_wallets(
            benefactor_wallet,
            patient_wallet,
            amt,
            debit_kind="donation_out",
            credit_kind="donation_in",
            reference_type="donation",
            description=f"Donation to patient: {patient.first_name} {patient.last_name}",
            created_by=benefactor_user,
        )
        patient_label = f"{patient.first_name} {patient.last_name}".strip()
        donation_kwargs.update(
            {
                "patient": patient,
                "patient_name": patient_label,
                "wallet_transaction": debit_tx,
                "title": title or f"کمک به {patient_label}",
            }
        )

    elif destination_type == "request":
        if not network_request_id:
            raise DonationError(msg.NETWORK_REQUEST_ID_REQUIRED)
        try:
            req = NetworkRequest.objects.select_for_update().get(pk=network_request_id)
        except NetworkRequest.DoesNotExist as exc:
            raise DonationError(msg.FINANCIAL_REQUEST_NOT_FOUND) from exc

        if req.request_type != "financial":
            raise DonationError(msg.REQUEST_NOT_FINANCIAL)
        if req.handled_by_id != benefactor_user.id:
            raise DonationError(msg.NOT_HANDLING_REQUEST)
        if req.status not in ("accepted", "in_progress"):
            raise DonationError(msg.REQUEST_NOT_PAYABLE)

        patient_wallet = get_or_create_patient_escrow_wallet(req.patient)
        debit_tx, _ = transfer_between_wallets(
            benefactor_wallet,
            patient_wallet,
            amt,
            debit_kind="donation_out",
            credit_kind="donation_in",
            reference_type="network_request",
            reference_id=req.pk,
            description=f"Donation for request: {req.subject}",
            created_by=benefactor_user,
        )

        if req.status == "accepted":
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
