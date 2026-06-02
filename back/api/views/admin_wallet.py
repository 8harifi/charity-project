from decimal import Decimal

from django.db import transaction
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from .. import messages as msg
from ..models import GatewayPayment, NetworkRequest, Patient, PatientDisbursement
from ..permissions import IsPlatformAdmin
from ..serializers.wallet import (
    CreateDisbursementSerializer,
    GatewayPaymentSerializer,
    PatientDisbursementSerializer,
)
from ..services.wallet_service import (
    InsufficientBalanceError,
    debit_wallet,
    get_or_create_patient_escrow_wallet,
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


class AdminDisbursementListCreateView(APIView):
    permission_classes = [IsPlatformAdmin]

    def get(self, request):
        qs = PatientDisbursement.objects.all().order_by("-created_at")[:100]
        return Response(PatientDisbursementSerializer(qs, many=True).data)

    @transaction.atomic
    def post(self, request):
        serializer = CreateDisbursementSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        try:
            patient = Patient.objects.get(pk=data["patient_id"])
        except Patient.DoesNotExist:
            return Response({"detail": msg.PATIENT_NOT_FOUND}, status=status.HTTP_404_NOT_FOUND)

        network_request = None
        if data.get("network_request_id"):
            try:
                network_request = NetworkRequest.objects.get(pk=data["network_request_id"])
            except NetworkRequest.DoesNotExist:
                return Response(
                    {"detail": msg.NETWORK_REQUEST_NOT_FOUND},
                    status=status.HTTP_404_NOT_FOUND,
                )

        patient_wallet = get_or_create_patient_escrow_wallet(patient)
        amount = Decimal(str(data["amount"]))

        disbursement = PatientDisbursement.objects.create(
            patient_wallet=patient_wallet,
            amount=amount,
            network_request=network_request,
            payee_description=data.get("payee_description", ""),
            approved_by=request.user,
            status="pending",
        )

        try:
            tx = debit_wallet(
                patient_wallet,
                amount,
                kind="disbursement",
                reference_type="disbursement",
                reference_id=disbursement.pk,
                description=data.get("payee_description", "") or "Patient disbursement",
                created_by=request.user,
            )
        except InsufficientBalanceError:
            disbursement.delete()
            return Response(
                {"detail": msg.INSUFFICIENT_PATIENT_ESCROW},
                status=status.HTTP_400_BAD_REQUEST,
            )

        disbursement.wallet_transaction = tx
        disbursement.status = "completed"
        disbursement.save(update_fields=["wallet_transaction", "status", "updated_at"])

        return Response(
            PatientDisbursementSerializer(disbursement).data,
            status=status.HTTP_201_CREATED,
        )


class AdminDisbursementDetailView(APIView):
    permission_classes = [IsPlatformAdmin]

    def patch(self, request, pk):
        try:
            disbursement = PatientDisbursement.objects.get(pk=pk)
        except PatientDisbursement.DoesNotExist:
            return Response({"detail": msg.NOT_FOUND}, status=status.HTTP_404_NOT_FOUND)

        new_status = request.data.get("status")
        if new_status not in ("pending", "completed"):
            return Response({"detail": msg.INVALID_STATUS}, status=status.HTTP_400_BAD_REQUEST)

        disbursement.status = new_status
        disbursement.save(update_fields=["status", "updated_at"])
        return Response(PatientDisbursementSerializer(disbursement).data)
