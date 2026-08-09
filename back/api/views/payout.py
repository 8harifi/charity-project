from decimal import Decimal, InvalidOperation

from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .. import messages as msg
from ..models import PayoutAccount, WithdrawalRequest
from ..permissions import IsPlatformAdmin, is_platform_admin
from ..services.audit_service import log_audit_event
from ..services.wallet_service import (
    InsufficientBalanceError,
    debit_wallet,
    get_or_create_staff_payout_wallet,
)
from ..models.payout import validate_sheba


def _staff_roles():
    return ("health_assistant", "doctor")


def _serialize_account(account):
    if not account:
        return None
    return {
        "sheba": account.sheba,
        "account_holder_name": account.account_holder_name,
        "bank_name": account.bank_name,
        "updated_at": account.updated_at,
    }


def _serialize_withdrawal(w):
    return {
        "id": w.pk,
        "amount": int(w.amount),
        "sheba": w.sheba,
        "account_holder_name": w.account_holder_name,
        "bank_name": w.bank_name,
        "status": w.status,
        "status_label": w.get_status_display(),
        "note": w.note,
        "created_at": w.created_at,
        "reviewed_at": w.reviewed_at,
        "user_id": w.user_id,
        "user_username": w.user.username if w.user_id else "",
    }


class StaffPayoutView(APIView):
    """Staff payout wallet balance, account, and withdrawal history."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role not in _staff_roles():
            return Response({"detail": msg.FORBIDDEN}, status=403)
        wallet = get_or_create_staff_payout_wallet(request.user)
        account = PayoutAccount.objects.filter(user=request.user).first()
        withdrawals = WithdrawalRequest.objects.filter(user=request.user)[:50]
        txs = wallet.transactions.all()[:50]
        return Response(
            {
                "balance": int(wallet.cached_balance),
                "account": _serialize_account(account),
                "withdrawals": [_serialize_withdrawal(w) for w in withdrawals],
                "transactions": [
                    {
                        "id": t.pk,
                        "entry_type": t.entry_type,
                        "amount": int(t.amount),
                        "kind": t.kind,
                        "description": t.description,
                        "created_at": t.created_at,
                    }
                    for t in txs
                ],
            }
        )

    def put(self, request):
        """Create or update the staff member's payout bank account."""
        if request.user.role not in _staff_roles():
            return Response({"detail": msg.FORBIDDEN}, status=403)
        sheba = (request.data.get("sheba") or "").replace(" ", "").upper()
        holder = (request.data.get("account_holder_name") or "").strip()
        bank = (request.data.get("bank_name") or "").strip()
        if not holder:
            return Response({"account_holder_name": "نام صاحب حساب الزامی است."}, status=400)
        try:
            sheba = validate_sheba(sheba)
        except Exception as exc:
            detail = getattr(exc, "messages", None) or [str(exc)]
            return Response({"sheba": detail[0]}, status=400)

        account, _ = PayoutAccount.objects.update_or_create(
            user=request.user,
            defaults={
                "sheba": sheba,
                "account_holder_name": holder,
                "bank_name": bank,
            },
        )
        return Response(_serialize_account(account))


class StaffWithdrawalCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if request.user.role not in _staff_roles():
            return Response({"detail": msg.FORBIDDEN}, status=403)
        account = PayoutAccount.objects.filter(user=request.user).first()
        if not account:
            return Response(
                {"detail": "ابتدا شماره شبا را در بخش تسویه ثبت کنید."},
                status=400,
            )
        try:
            amount = Decimal(str(request.data.get("amount")))
        except (InvalidOperation, TypeError, ValueError):
            return Response({"amount": "مبلغ نامعتبر است."}, status=400)
        if amount <= 0:
            return Response({"amount": "مبلغ باید مثبت باشد."}, status=400)

        wallet = get_or_create_staff_payout_wallet(request.user)
        pending = WithdrawalRequest.objects.filter(
            user=request.user, status="pending"
        ).exists()
        if pending:
            return Response(
                {"detail": "یک درخواست تسویه در انتظار بررسی دارید."},
                status=400,
            )
        if wallet.cached_balance < amount:
            return Response({"detail": msg.INSUFFICIENT_WALLET_BALANCE}, status=400)

        w = WithdrawalRequest.objects.create(
            user=request.user,
            amount=amount,
            sheba=account.sheba,
            account_holder_name=account.account_holder_name,
            bank_name=account.bank_name,
            status="pending",
            note=(request.data.get("note") or "").strip(),
        )
        log_audit_event(
            actor=request.user,
            event_type="withdrawal_requested",
            summary=f"درخواست تسویه {int(amount):,} تومان",
            target_type="withdrawal",
            target_id=w.pk,
        )
        return Response(_serialize_withdrawal(w), status=status.HTTP_201_CREATED)


class AdminWithdrawalsView(APIView):
    permission_classes = [IsAuthenticated, IsPlatformAdmin]

    def get(self, request):
        status_filter = request.query_params.get("status", "").strip()
        qs = WithdrawalRequest.objects.select_related("user").all()
        if status_filter:
            qs = qs.filter(status=status_filter)
        return Response([_serialize_withdrawal(w) for w in qs[:200]])


class AdminWithdrawalActionView(APIView):
    permission_classes = [IsAuthenticated, IsPlatformAdmin]

    def patch(self, request, pk):
        try:
            w = WithdrawalRequest.objects.select_related("user").get(pk=pk)
        except WithdrawalRequest.DoesNotExist:
            return Response({"detail": msg.NOT_FOUND}, status=404)

        action = (request.data.get("action") or "").strip()
        note = (request.data.get("note") or "").strip()

        if action == "approve":
            if w.status != "pending":
                return Response({"detail": "فقط درخواست‌های در انتظار قابل تأییدند."}, status=400)
            w.status = "approved"
            w.note = note or w.note
            w.reviewed_by = request.user
            w.reviewed_at = timezone.now()
            w.save()
        elif action == "reject":
            if w.status not in ("pending", "approved"):
                return Response({"detail": "این درخواست قابل رد نیست."}, status=400)
            w.status = "rejected"
            w.note = note or w.note
            w.reviewed_by = request.user
            w.reviewed_at = timezone.now()
            w.save()
        elif action == "pay":
            if w.status not in ("pending", "approved"):
                return Response({"detail": "این درخواست قابل پرداخت نیست."}, status=400)
            wallet = get_or_create_staff_payout_wallet(w.user)
            try:
                tx = debit_wallet(
                    wallet,
                    w.amount,
                    kind="disbursement",
                    reference_type="disbursement",
                    reference_id=w.pk,
                    description=f"تسویه شبا {w.sheba}",
                    created_by=request.user,
                )
            except InsufficientBalanceError:
                return Response({"detail": msg.INSUFFICIENT_WALLET_BALANCE}, status=400)
            w.status = "paid"
            w.note = note or w.note
            w.reviewed_by = request.user
            w.reviewed_at = timezone.now()
            w.wallet_transaction = tx
            w.save()
        else:
            return Response({"detail": "عملیات نامعتبر است."}, status=400)

        log_audit_event(
            actor=request.user,
            event_type=f"withdrawal_{action}",
            summary=f"تسویه #{w.pk} — {action}",
            target_type="withdrawal",
            target_id=w.pk,
            metadata={"note": note},
        )
        return Response(_serialize_withdrawal(w))
