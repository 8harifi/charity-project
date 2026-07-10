from decimal import Decimal

from django.db.models import Sum

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from .. import messages as msg
from ..models import GatewayPayment, DonationHold, Wallet, WalletTransaction
from ..models.user import CustomUser
from ..permissions import IsPlatformAdmin
from ..serializers.wallet import (
    AdminWalletAdjustSerializer,
    AdminWalletSerializer,
    DonationHoldSerializer,
    GatewayPaymentSerializer,
)
from ..utils import normalize_phone
from ..services.wallet_service import (
    WalletServiceError,
    credit_wallet,
    debit_wallet,
    get_or_create_benefactor_wallet,
)


class AdminGatewayPaymentsView(APIView):
    permission_classes = [IsPlatformAdmin]

    def get(self, request):
        status_filter = request.query_params.get("status")
        qs = GatewayPayment.objects.all().order_by("-created_at")
        if status_filter:
            qs = qs.filter(status=status_filter)
        page = int(request.query_params.get("page", 1))
        page_size = min(int(request.query_params.get("page_size", 50)), 100)
        start = (page - 1) * page_size
        items = qs[start : start + page_size]
        return Response(
            {
                "count": qs.count(),
                "page": page,
                "results": GatewayPaymentSerializer(items, many=True).data,
            }
        )


class AdminWalletsView(APIView):
    """List all benefactor wallets so admin can pick who to adjust."""

    permission_classes = [IsPlatformAdmin]

    def get(self, request):
        search = request.query_params.get("search", "")
        qs = Wallet.objects.filter(wallet_type="benefactor").select_related("owner_user")
        if search:
            phone = normalize_phone(search)
            if phone:
                qs = qs.filter(owner_user__username__icontains=phone)
            else:
                qs = qs.filter(owner_user__username__icontains=search)
        qs = qs.order_by("-cached_balance")[:200]
        return Response(AdminWalletSerializer(qs, many=True).data)


class AdminWalletAdjustView(APIView):
    """Credit or debit any wallet — e.g. in-person cash top-up, manual correction."""

    permission_classes = [IsPlatformAdmin]

    def post(self, request):
        serializer = AdminWalletAdjustSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        try:
            user = CustomUser.objects.get(username=data["phone_number"])
        except CustomUser.DoesNotExist:
            return Response(
                {"detail": "کاربری با این شماره موبایل یافت نشد."},
                status=404,
            )

        if user.role != "benefactor":
            return Response(
                {"detail": "تنظیم موجودی فقط برای حساب نیکوکار مجاز است."},
                status=400,
            )

        wallet = get_or_create_benefactor_wallet(user)
        amount = Decimal(str(data["amount"]))
        reason = data.get("reason", "")

        try:
            if data["direction"] == "credit":
                tx = credit_wallet(
                    wallet,
                    amount,
                    kind="adjustment",
                    reference_type="admin_adjustment",
                    description=reason or "Admin manual credit",
                    created_by=request.user,
                )
            else:
                tx = debit_wallet(
                    wallet,
                    amount,
                    kind="adjustment",
                    reference_type="admin_adjustment",
                    description=reason or "Admin manual debit",
                    created_by=request.user,
                )
        except WalletServiceError as exc:
            return Response({"detail": str(exc)}, status=400)

        wallet.refresh_from_db(fields=["cached_balance", "held_balance"])
        return Response(
            {
                "message": "تنظیم موجودی با موفقیت انجام شد.",
                "transaction_id": tx.pk,
                "wallet": AdminWalletSerializer(wallet).data,
            },
            status=201,
        )


class AdminPledgesView(APIView):
    """List all DonationHold rows for administrative oversight."""

    permission_classes = [IsPlatformAdmin]

    def get(self, request):
        status_filter = request.query_params.get("status")
        qs = DonationHold.objects.select_related(
            "benefactor", "network_request", "network_request__patient"
        ).order_by("-created_at")
        if status_filter:
            qs = qs.filter(status=status_filter)
        page = int(request.query_params.get("page", 1))
        page_size = min(int(request.query_params.get("page_size", 50)), 100)
        start = (page - 1) * page_size
        items = qs[start : start + page_size]
        return Response(
            {
                "count": qs.count(),
                "page": page,
                "results": DonationHoldSerializer(items, many=True).data,
            }
        )
