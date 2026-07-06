"""Wallet ledger operations with atomic balance updates."""

from decimal import Decimal, InvalidOperation

from django.db import transaction
from django.db.models import F

from .. import messages as msg
from ..models import Wallet, WalletTransaction


class InsufficientBalanceError(Exception):
    pass


class WalletServiceError(Exception):
    pass


class DonationHoldError(Exception):
    pass


def _to_decimal(amount) -> Decimal:
    try:
        value = Decimal(str(amount))
    except (InvalidOperation, TypeError, ValueError) as exc:
        raise WalletServiceError(msg.INVALID_AMOUNT) from exc
    if value <= 0:
        raise WalletServiceError(msg.AMOUNT_MUST_BE_POSITIVE)
    return value


def get_or_create_benefactor_wallet(user) -> Wallet:
    wallet, _ = Wallet.objects.get_or_create(
        owner_user=user,
        wallet_type="benefactor",
        defaults={"cached_balance": Decimal("0")},
    )
    return wallet


def get_or_create_staff_payout_wallet(user) -> Wallet:
    """Wallet where HA/doctor fund recipients receive released donation holds."""
    wallet, _ = Wallet.objects.get_or_create(
        owner_user=user,
        wallet_type="staff_payout",
        defaults={"cached_balance": Decimal("0")},
    )
    return wallet


def get_or_create_patient_escrow_wallet(patient) -> Wallet:
    wallet, _ = Wallet.objects.get_or_create(
        owner_patient=patient,
        wallet_type="patient_escrow",
        defaults={"cached_balance": Decimal("0")},
    )
    return wallet


def get_or_create_platform_wallet() -> Wallet:
    wallet = Wallet.objects.filter(
        wallet_type="platform",
        owner_user__isnull=True,
        owner_patient__isnull=True,
    ).first()
    if wallet:
        return wallet
    return Wallet.objects.create(
        wallet_type="platform",
        cached_balance=Decimal("0"),
    )


def _lock_wallet(wallet_id: int) -> Wallet:
    return Wallet.objects.select_for_update().get(pk=wallet_id)


def credit_wallet(
    wallet: Wallet,
    amount,
    *,
    kind: str,
    reference_type: str = "",
    reference_id=None,
    counterparty_wallet=None,
    description: str = "",
    created_by=None,
) -> WalletTransaction:
    amt = _to_decimal(amount)
    with transaction.atomic():
        locked = _lock_wallet(wallet.pk)
        Wallet.objects.filter(pk=locked.pk).update(
            cached_balance=F("cached_balance") + amt
        )
        locked.refresh_from_db(fields=["cached_balance"])
        return WalletTransaction.objects.create(
            wallet=locked,
            entry_type="credit",
            amount=amt,
            kind=kind,
            reference_type=reference_type,
            reference_id=reference_id,
            counterparty_wallet=counterparty_wallet,
            description=description,
            created_by=created_by,
        )


def debit_wallet(
    wallet: Wallet,
    amount,
    *,
    kind: str,
    reference_type: str = "",
    reference_id=None,
    counterparty_wallet=None,
    description: str = "",
    created_by=None,
) -> WalletTransaction:
    amt = _to_decimal(amount)
    with transaction.atomic():
        locked = _lock_wallet(wallet.pk)
        if locked.cached_balance < amt:
            raise InsufficientBalanceError(msg.INSUFFICIENT_WALLET_BALANCE)
        Wallet.objects.filter(pk=locked.pk).update(
            cached_balance=F("cached_balance") - amt
        )
        locked.refresh_from_db(fields=["cached_balance"])
        return WalletTransaction.objects.create(
            wallet=locked,
            entry_type="debit",
            amount=amt,
            kind=kind,
            reference_type=reference_type,
            reference_id=reference_id,
            counterparty_wallet=counterparty_wallet,
            description=description,
            created_by=created_by,
        )


def transfer_between_wallets(
    from_wallet: Wallet,
    to_wallet: Wallet,
    amount,
    *,
    debit_kind: str,
    credit_kind: str,
    reference_type: str = "",
    reference_id=None,
    description: str = "",
    created_by=None,
) -> tuple[WalletTransaction, WalletTransaction]:
    amt = _to_decimal(amount)
    with transaction.atomic():
        first_id, second_id = sorted([from_wallet.pk, to_wallet.pk])
        wallets = {
            w.pk: w
            for w in Wallet.objects.select_for_update().filter(
                pk__in=[first_id, second_id]
            )
        }
        from_locked = wallets[from_wallet.pk]
        to_locked = wallets[to_wallet.pk]

        if from_locked.cached_balance < amt:
            raise InsufficientBalanceError(msg.INSUFFICIENT_WALLET_BALANCE)

        Wallet.objects.filter(pk=from_locked.pk).update(
            cached_balance=F("cached_balance") - amt
        )
        Wallet.objects.filter(pk=to_locked.pk).update(
            cached_balance=F("cached_balance") + amt
        )

        debit_tx = WalletTransaction.objects.create(
            wallet=from_locked,
            entry_type="debit",
            amount=amt,
            kind=debit_kind,
            reference_type=reference_type,
            reference_id=reference_id,
            counterparty_wallet=to_locked,
            description=description,
            created_by=created_by,
        )
        credit_tx = WalletTransaction.objects.create(
            wallet=to_locked,
            entry_type="credit",
            amount=amt,
            kind=credit_kind,
            reference_type=reference_type,
            reference_id=reference_id,
            counterparty_wallet=from_locked,
            description=description,
            created_by=created_by,
        )
        return debit_tx, credit_tx


def hold_amount(
    wallet: Wallet,
    amount,
    *,
    reference_type: str = "",
    reference_id=None,
    description: str = "",
    created_by=None,
) -> WalletTransaction:
    """Move money from free balance to held_balance (frozen pledge).
    The money stays in the benefactor wallet but is no longer spendable."""
    amt = _to_decimal(amount)
    with transaction.atomic():
        locked = _lock_wallet(wallet.pk)
        if locked.cached_balance < amt:
            raise InsufficientBalanceError(msg.INSUFFICIENT_WALLET_BALANCE)
        Wallet.objects.filter(pk=locked.pk).update(
            cached_balance=F("cached_balance") - amt,
            held_balance=F("held_balance") + amt,
        )
        locked.refresh_from_db(fields=["cached_balance", "held_balance"])
        return WalletTransaction.objects.create(
            wallet=locked,
            entry_type="debit",
            amount=amt,
            kind="pledge_hold",
            reference_type=reference_type,
            reference_id=reference_id,
            description=description,
            created_by=created_by,
        )


def release_hold(
    wallet: Wallet,
    amount,
    *,
    to_wallet: Wallet = None,
    reference_type: str = "",
    reference_id=None,
    description: str = "",
    created_by=None,
) -> tuple[WalletTransaction, WalletTransaction]:
    """Finalize held money: decrement held_balance, transfer to destination wallet
    (defaults to the platform wallet if no destination is given)."""
    amt = _to_decimal(amount)
    with transaction.atomic():
        locked = _lock_wallet(wallet.pk)
        if locked.held_balance < amt:
            raise DonationHoldError("Held balance insufficient for release")
        destination = to_wallet or get_or_create_platform_wallet()
        first_id, second_id = sorted([locked.pk, destination.pk])
        wallets = {
            w.pk: w
            for w in Wallet.objects.select_for_update().filter(
                pk__in=[first_id, second_id]
            )
        }
        benefactor = wallets[locked.pk]
        dest = wallets[destination.pk]

        Wallet.objects.filter(pk=benefactor.pk).update(
            held_balance=F("held_balance") - amt,
        )
        Wallet.objects.filter(pk=dest.pk).update(
            cached_balance=F("cached_balance") + amt,
        )

        debit_tx = WalletTransaction.objects.create(
            wallet=benefactor,
            entry_type="debit",
            amount=amt,
            kind="pledge_release",
            reference_type=reference_type,
            reference_id=reference_id,
            counterparty_wallet=dest,
            description=description,
            created_by=created_by,
        )
        credit_tx = WalletTransaction.objects.create(
            wallet=dest,
            entry_type="credit",
            amount=amt,
            kind="pledge_release",
            reference_type=reference_type,
            reference_id=reference_id,
            counterparty_wallet=benefactor,
            description=description,
            created_by=created_by,
        )
        return debit_tx, credit_tx


def refund_hold(
    wallet: Wallet,
    amount,
    *,
    reference_type: str = "",
    reference_id=None,
    description: str = "",
    created_by=None,
) -> WalletTransaction:
    """Cancel held money: decrement held_balance, credit back to free balance."""
    amt = _to_decimal(amount)
    with transaction.atomic():
        locked = _lock_wallet(wallet.pk)
        if locked.held_balance < amt:
            raise DonationHoldError("Held balance insufficient for refund")
        Wallet.objects.filter(pk=locked.pk).update(
            held_balance=F("held_balance") - amt,
            cached_balance=F("cached_balance") + amt,
        )
        locked.refresh_from_db(fields=["cached_balance", "held_balance"])
        return WalletTransaction.objects.create(
            wallet=locked,
            entry_type="credit",
            amount=amt,
            kind="pledge_refund",
            reference_type=reference_type,
            reference_id=reference_id,
            description=description,
            created_by=created_by,
        )
