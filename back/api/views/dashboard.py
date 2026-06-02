from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from ..models import BenefactorDonation, CustomUser, NetworkRequest, Patient
from ..services.wallet_service import get_or_create_patient_escrow_wallet


ACTIVE_STATUSES = ("pending", "accepted", "in_progress")


class DashboardStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        role = user.role

        if role == "patient":
            try:
                patient = user.patient_profile
            except Patient.DoesNotExist:
                return Response(
                    {
                        "open_requests": 0,
                        "pending": 0,
                        "completed": 0,
                        "aid_received": 0,
                    }
                )
            qs = NetworkRequest.objects.filter(patient=patient)
            escrow = get_or_create_patient_escrow_wallet(patient)
            return Response(
                {
                    "open_requests": qs.filter(status__in=ACTIVE_STATUSES).count(),
                    "pending": qs.filter(status="pending").count(),
                    "completed": qs.filter(status="completed").count(),
                    "aid_received": int(escrow.cached_balance),
                }
            )

        if role == "doctor":
            doctor = user.doctor_profile
            incoming = NetworkRequest.objects.filter(
                request_type="consultation",
                status="pending",
                handled_by__isnull=True,
                specialty=doctor.specialty,
            )
            my_cases = NetworkRequest.objects.filter(
                request_type="consultation",
                handled_by=user,
            )
            return Response(
                {
                    "new_in_specialty": incoming.count(),
                    "active_cases": my_cases.filter(status__in=("accepted", "in_progress")).count(),
                    "completed": my_cases.filter(status="completed").count(),
                }
            )

        if role == "benefactor":
            incoming = NetworkRequest.objects.filter(
                request_type="financial",
                status="pending",
                handled_by__isnull=True,
            )
            my_cases = NetworkRequest.objects.filter(
                request_type="financial",
                handled_by=user,
            )
            donations = BenefactorDonation.objects.filter(benefactor=user, status="completed")
            wallet_balance = 0
            try:
                from ..services.wallet_service import get_or_create_benefactor_wallet

                wallet_balance = int(get_or_create_benefactor_wallet(user).cached_balance)
            except Exception:
                pass
            return Response(
                {
                    "pending_requests": incoming.count(),
                    "active_cases": my_cases.filter(status__in=("accepted", "in_progress")).count(),
                    "completed_cases": my_cases.filter(status="completed").count(),
                    "total_donations": donations.count(),
                    "wallet_balance": wallet_balance,
                    "patients_helped": donations.exclude(patient_name="").values("patient_name").distinct().count(),
                }
            )

        if role == "health_assistant":
            ha = user.health_assistant_profile
            patients_count = Patient.objects.filter(introducer=ha).count()
            requests_qs = NetworkRequest.objects.filter(created_by=user)
            return Response(
                {
                    "patients_introduced": patients_count,
                    "open_requests": requests_qs.filter(status__in=ACTIVE_STATUSES).count(),
                    "completed": requests_qs.filter(status="completed").count(),
                }
            )

        if role == "admin":
            return Response(
                {
                    "total_users": CustomUser.objects.exclude(role="admin").count(),
                    "pending_users": CustomUser.objects.filter(state=False)
                    .exclude(role="admin")
                    .count(),
                    "total_requests": NetworkRequest.objects.count(),
                    "pending_requests": NetworkRequest.objects.filter(status="pending").count(),
                }
            )

        return Response({})
