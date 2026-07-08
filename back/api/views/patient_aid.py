from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from ..models import NetworkRequest, Patient
from ..permissions import IsPatient


class PatientAidSummaryView(APIView):
    """Patient's received support — read-only summary of financial needs and pledges."""

    permission_classes = [IsAuthenticated, IsPatient]

    def get(self, request):
        try:
            patient = request.user.patient_profile
        except Patient.DoesNotExist:
            return Response(
                {
                    "needs": [],
                    "total_needed": "0",
                    "total_collected": "0",
                }
            )

        needs = NetworkRequest.objects.filter(
            patient=patient, request_type="financial"
        ).order_by("-created_at")

        total_needed = sum(n.amount_needed or 0 for n in needs)
        total_collected = sum(n.collected_amount or 0 for n in needs)

        return Response(
            {
                "needs": [
                    {
                        "id": n.pk,
                        "subject": n.subject,
                        "amount_needed": str(n.amount_needed or 0),
                        "collected_amount": str(n.collected_amount or 0),
                        "status": n.get_status_display(),
                        "created_at": n.created_at.isoformat(),
                    }
                    for n in needs
                ],
                "total_needed": str(total_needed),
                "total_collected": str(total_collected),
            }
        )
