from decimal import Decimal

from django.conf import settings
from django.http import HttpResponseRedirect
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .. import messages as msg
from ..models import GatewayPayment, WalletTransaction
from ..permissions import IsBenefactor
from ..serializers.wallet import (
    DonateSerializer,
    TopUpSerializer,
    WalletTransactionSerializer,
)
from ..services.donation_service import DonationError, donate_from_wallet
from ..services.topup_service import TopUpError, mock_instant_topup, verify_and_credit_topup
from ..services.wallet_service import (
    InsufficientBalanceError,
    get_or_create_benefactor_wallet,
)
from ..services.zarinpal import ZarinpalError, payment_request


def _min_topup() -> Decimal:
    return Decimal(str(getattr(settings, "WALLET_MIN_TOPUP", 10000)))


def _payment_mode() -> str:
    return "mock" if getattr(settings, "ZARINPAL_DISABLED", False) else "zarinpal"


class WalletDetailView(APIView):
    permission_classes = [IsAuthenticated, IsBenefactor]

    def get(self, request):
        wallet = get_or_create_benefactor_wallet(request.user)
        recent = WalletTransaction.objects.filter(wallet=wallet).order_by("-created_at")[:20]
        return Response(
            {
                "balance": wallet.cached_balance,
                "held_balance": wallet.held_balance,
                "currency": wallet.currency,
                "payment_mode": _payment_mode(),
                "recent_transactions": WalletTransactionSerializer(recent, many=True).data,
            }
        )


class WalletTransactionsView(APIView):
    permission_classes = [IsAuthenticated, IsBenefactor]

    def get(self, request):
        wallet = get_or_create_benefactor_wallet(request.user)
        qs = WalletTransaction.objects.filter(wallet=wallet)
        page = int(request.query_params.get("page", 1))
        page_size = min(int(request.query_params.get("page_size", 50)), 100)
        start = (page - 1) * page_size
        end = start + page_size
        items = qs[start:end]
        return Response(
            {
                "count": qs.count(),
                "page": page,
                "results": WalletTransactionSerializer(items, many=True).data,
            }
        )


class WalletTopUpView(APIView):
    permission_classes = [IsAuthenticated, IsBenefactor]

    def post(self, request):
        if not getattr(settings, "WALLET_ENABLED", True):
            return Response({"detail": msg.WALLET_DISABLED}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

        serializer = TopUpSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        amount = serializer.validated_data["amount"]
        if amount < _min_topup():
            return Response(
                {"detail": msg.min_topup_message(_min_topup())},
                status=status.HTTP_400_BAD_REQUEST,
            )

        wallet = get_or_create_benefactor_wallet(request.user)

        payment = GatewayPayment.objects.create(
            user=request.user,
            wallet=wallet,
            amount=amount,
            status="created",
        )

        if getattr(settings, "ZARINPAL_DISABLED", False):
            mock_instant_topup(payment=payment)
            wallet.refresh_from_db(fields=["cached_balance"])
            return Response(
                {
                    "payment_id": payment.pk,
                    "mock": True,
                    "verified": True,
                    "balance": str(wallet.cached_balance),
                    "message": msg.MOCK_PAYMENT_ACCEPTED,
                },
                status=status.HTTP_201_CREATED,
            )

        callback_url = getattr(
            settings,
            "ZARINPAL_CALLBACK_URL",
            "http://127.0.0.1:8000/api/wallet/topup/callback/",
        )

        try:
            result = payment_request(
                amount=amount,
                description=f"Wallet top-up #{payment.pk}",
                callback_url=callback_url,
                metadata={"payment_id": payment.pk, "user_id": request.user.pk},
            )
        except ZarinpalError as exc:
            payment.status = "failed"
            payment.save(update_fields=["status", "updated_at"])
            return Response({"detail": str(exc)}, status=status.HTTP_502_BAD_GATEWAY)

        payment.authority = result.authority
        payment.status = "redirected"
        payment.save(update_fields=["authority", "status", "updated_at"])

        return Response(
            {
                "payment_id": payment.pk,
                "authority": result.authority,
                "payment_url": result.payment_url,
                "mock": False,
            },
            status=status.HTTP_201_CREATED,
        )


@method_decorator(csrf_exempt, name="dispatch")
class WalletTopUpCallbackView(APIView):
    authentication_classes = []
    permission_classes = []

    def get(self, request):
        authority = request.query_params.get("Authority", "")
        status_param = request.query_params.get("Status", "")

        frontend_base = getattr(settings, "FRONTEND_URL", "http://localhost:5173")
        success_url = f"{frontend_base}/wallet/topup/result?status=success"
        fail_url = f"{frontend_base}/wallet/topup/result?status=failed"

        if not authority:
            return HttpResponseRedirect(fail_url)

        try:
            verify_and_credit_topup(authority=authority, status_param=status_param)
            return HttpResponseRedirect(f"{success_url}&authority={authority}")
        except (TopUpError, Exception):
            return HttpResponseRedirect(f"{fail_url}&authority={authority}")


class WalletDonateView(APIView):
    permission_classes = [IsAuthenticated, IsBenefactor]

    def post(self, request):
        if not getattr(settings, "WALLET_ENABLED", True):
            return Response({"detail": msg.WALLET_DISABLED}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

        serializer = DonateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        try:
            donation = donate_from_wallet(
                benefactor_user=request.user,
                amount=data["amount"],
                destination_type=data["destination_type"],
                campaign_id=data.get("campaign_id"),
                network_request_id=data.get("network_request_id"),
                title=data.get("title", ""),
                description=data.get("description", ""),
            )
        except InsufficientBalanceError:
            return Response(
                {"detail": msg.INSUFFICIENT_WALLET_BALANCE},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except DonationError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(
            {
                "id": donation.pk,
                "amount": str(donation.amount),
                "destination_type": donation.destination_type,
                "title": donation.title,
                "status": donation.status,
            },
            status=status.HTTP_201_CREATED,
        )
