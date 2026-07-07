from django.db.models import Count, Q, Sum
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from ..models import BenefactorDonation, CustomUser, DonationHold, NetworkRequest, Patient
from ..services.wallet_service import get_or_create_patient_escrow_wallet


ACTIVE_STATUSES = ("pending", "accepted", "in_progress")

STATUS_LABELS = {
    "pending": "در انتظار",
    "accepted": "پذیرفته‌شده",
    "in_progress": "در حال انجام",
    "completed": "تکمیل‌شده",
    "cancelled": "لغوشده",
}


def _status_breakdown(queryset):
    counts = {
        row["status"]: row["count"]
        for row in queryset.values("status").annotate(count=Count("id"))
    }
    return [
        {"label": STATUS_LABELS.get(status, status), "value": count}
        for status, count in counts.items()
        if count
    ]


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
                    "status_breakdown": _status_breakdown(qs),
                }
            )

        if role == "doctor":
            doctor = user.doctor_profile
            if doctor.cooperates_with_all_health_assistants():
                patient_ids = Patient.objects.filter(
                    introducer__isnull=False
                ).values_list("pk", flat=True)
            else:
                patient_ids = Patient.objects.filter(
                    introducer__in=doctor.cooperating_health_assistants.all()
                ).values_list("pk", flat=True)
            incoming = NetworkRequest.objects.filter(
                request_type="consultation",
                status="pending",
                handled_by__isnull=True,
                patient_id__in=patient_ids,
                created_by__role__in=("patient", "health_assistant"),
            )
            my_cases = NetworkRequest.objects.filter(
                request_type="consultation",
                handled_by=user,
            )
            return Response(
                {
                    "new_requests": incoming.count(),
                    "new_in_specialty": incoming.count(),
                    "active_cases": my_cases.filter(
                        status__in=("accepted", "in_progress")
                    ).count(),
                    "completed": my_cases.filter(status="completed").count(),
                    "status_breakdown": _status_breakdown(my_cases),
                }
            )

        if role == "benefactor":
            incoming = NetworkRequest.objects.filter(
                Q(request_type="financial")
                | Q(request_type="consultation", amount_needed__gt=0),
                amount_needed__isnull=False,
                status__in=("pending", "accepted", "in_progress"),
            )
            my_holds = DonationHold.objects.filter(benefactor=user)
            my_cases = NetworkRequest.objects.filter(
                request_type="financial",
                donation_holds__benefactor=user,
            ).distinct()
            donations = BenefactorDonation.objects.filter(benefactor=user, status="completed")
            wallet_balance = 0
            try:
                from ..services.wallet_service import get_or_create_benefactor_wallet

                wallet_balance = int(get_or_create_benefactor_wallet(user).cached_balance)
            except Exception:
                pass
            total_donated_amount = int(
                (my_holds.filter(status="released").aggregate(total=Sum("amount"))["total"] or 0)
            )
            return Response(
                {
                    "pending_requests": incoming.count(),
                    "active_cases": my_cases.filter(status__in=("accepted", "in_progress")).count(),
                    "completed_cases": my_cases.filter(status="completed").count(),
                    "total_donations": donations.count(),
                    "total_donated_amount": total_donated_amount,
                    "active_pledges": my_holds.filter(status="held").count(),
                    "requests_funded": my_holds.filter(status="released").values("network_request_id").distinct().count(),
                    "wallet_balance": wallet_balance,
                    "patients_helped": donations.exclude(patient_name="").values("patient_name").distinct().count(),
                    "status_breakdown": _status_breakdown(my_cases),
                }
            )

        if role == "health_assistant":
            ha = user.health_assistant_profile
            patients_qs = Patient.objects.filter(introducer=ha)
            requests_qs = NetworkRequest.objects.filter(created_by=user)
            return Response(
                {
                    "patients_introduced": patients_qs.count(),
                    "patients_approved": patients_qs.filter(
                        admin_approved=True, ha_approved=True
                    ).count(),
                    "patients_pending_approval": patients_qs.filter(
                        Q(admin_approved=False) | Q(ha_approved=False)
                    ).count(),
                    "open_requests": requests_qs.filter(status__in=ACTIVE_STATUSES).count(),
                    "completed": requests_qs.filter(status="completed").count(),
                    "status_breakdown": _status_breakdown(requests_qs),
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
