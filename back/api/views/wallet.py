from decimal import Decimal, InvalidOperation

from django.conf import settings
from django.db import transaction
from django.http import HttpResponseRedirect
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .. import messages as msg
from ..models import BenefactorDonation, Campaign, CustomUser, GatewayPayment, WalletTransaction
from ..permissions import IsBenefactor
from ..serializers.wallet import (
    AdjustPledgeSerializer,
    DonateSerializer,
    TopUpSerializer,
    WalletTransactionSerializer,
)
from ..services.donation_service import (
    DonationError,
    adjust_request_pledge,
    donate_from_wallet,
)
from ..services.topup_service import mock_instant_topup
from ..services.wallet_service import (
    InsufficientBalanceError,
    get_or_create_benefactor_wallet,
    get_or_create_platform_wallet,
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


class WalletAdjustPledgeView(APIView):
    permission_classes = [IsAuthenticated, IsBenefactor]

    def post(self, request):
        if not getattr(settings, "WALLET_ENABLED", True):
            return Response({"detail": msg.WALLET_DISABLED}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

        serializer = AdjustPledgeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        try:
            donation = adjust_request_pledge(
                benefactor_user=request.user,
                network_request_id=data["network_request_id"],
                new_amount=data["amount"],
            )
        except InsufficientBalanceError:
            return Response(
                {"detail": msg.INSUFFICIENT_WALLET_BALANCE},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except DonationError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        if donation is None:
            return Response(
                {
                    "amount": "0",
                    "status": "cancelled",
                    "detail": "تعهد لغو شد.",
                }
            )
        return Response(
            {
                "id": donation.pk,
                "amount": str(donation.amount),
                "destination_type": donation.destination_type,
                "title": donation.title,
                "status": donation.status,
            }
        )


def _system_payment_user():
    user = CustomUser.objects.filter(role="admin", is_active=True).first()
    if not user:
        user = CustomUser.objects.filter(is_superuser=True).first()
    return user


@transaction.atomic
def _credit_guest_campaign(payment: GatewayPayment):
    campaign_id = (payment.callback_payload or {}).get("guest_campaign_id")
    if not campaign_id:
        return payment
    campaign = Campaign.objects.select_for_update().get(pk=campaign_id, is_published=True)
    campaign.raised_amount = (campaign.raised_amount or 0) + payment.amount
    campaign.save(update_fields=["raised_amount", "updated_at"])
    BenefactorDonation.objects.create(
        benefactor=payment.user,
        donation_type="cash",
        amount=payment.amount,
        title=campaign.title,
        campaign_fk=campaign,
        destination_type="campaign",
        payment_source="gateway_direct",
        status="completed",
    )
    return payment


class GuestCampaignDonateView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        campaign_id = request.data.get("campaign_id")
        amount = request.data.get("amount")
        if not campaign_id or not amount:
            return Response({"detail": "campaign_id و amount الزامی است."}, status=400)
        try:
            amount = Decimal(str(amount))
            campaign = Campaign.objects.get(pk=campaign_id, is_published=True)
        except (InvalidOperation, Campaign.DoesNotExist):
            return Response({"detail": "کمپین یا مبلغ نامعتبر است."}, status=400)

        user = _system_payment_user()
        if not user:
            return Response({"detail": "سیستم پرداخت پیکربندی نشده."}, status=503)

        platform_wallet = get_or_create_platform_wallet()
        payment = GatewayPayment.objects.create(
            user=user,
            wallet=platform_wallet,
            amount=amount,
            status="created",
            callback_payload={"guest_campaign_id": campaign.pk, "guest": True},
        )

        if getattr(settings, "ZARINPAL_DISABLED", False):
            mock_instant_topup(payment=payment)
            _credit_guest_campaign(payment)
            return Response(
                {
                    "payment_id": payment.pk,
                    "mock": True,
                    "verified": True,
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
                description=f"Campaign donation #{campaign.pk}",
                callback_url=callback_url,
                metadata={"payment_id": payment.pk, "guest_campaign_id": campaign.pk},
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
