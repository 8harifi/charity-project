from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from ..models import Patient, PatientDisbursement, WalletTransaction
from ..permissions import IsPatient
from ..serializers.wallet import PatientDisbursementSerializer
from ..services.wallet_service import get_or_create_patient_escrow_wallet


class PatientAidSummaryView(APIView):
    permission_classes = [IsAuthenticated, IsPatient]

    def get(self, request):
        try:
            patient = request.user.patient_profile
        except Patient.DoesNotExist:
            return Response(
                {
                    "balance": "0",
                    "total_received": "0",
                    "total_disbursed": "0",
                    "disbursements": [],
                    "recent_credits": [],
                }
            )

        wallet = get_or_create_patient_escrow_wallet(patient)
        credits = WalletTransaction.objects.filter(
            wallet=wallet, entry_type="credit"
        ).order_by("-created_at")[:20]

        disbursements = PatientDisbursement.objects.filter(
            patient_wallet=wallet, status="completed"
        ).order_by("-created_at")[:20]

        total_disbursed = sum(d.amount for d in disbursements)

        return Response(
            {
                "balance": str(wallet.cached_balance),
                "total_received": str(
                    sum(t.amount for t in credits if t.kind == "donation_in")
                ),
                "total_disbursed": str(total_disbursed),
                "disbursements": PatientDisbursementSerializer(
                    disbursements, many=True
                ).data,
                "recent_credits": [
                    {
                        "id": t.pk,
                        "amount": str(t.amount),
                        "description": t.description,
                        "created_at": t.created_at.isoformat(),
                    }
                    for t in credits
                ],
            }
        )
