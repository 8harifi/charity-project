from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .. import messages as msg
from ..models import BenefactorDonation
from ..permissions import IsBenefactor
from ..serializers.wallet import DonationListSerializer


class DoctorCounselingsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response([])


class DoctorAppointmentsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response([])


class BenefactorDonationsView(APIView):
    permission_classes = [IsAuthenticated, IsBenefactor]

    def get(self, request):
        donations = (
            BenefactorDonation.objects.filter(benefactor=request.user)
            .select_related("campaign_fk", "patient", "network_request")
            .order_by("-created_at")
        )
        return Response(DonationListSerializer(donations, many=True).data)

    def post(self, request):
        data = request.data
        donation_type = data.get("donation_type", "cash")

        if donation_type == "cash":
            return Response(
                {
                    "detail": msg.CASH_DONATIONS_USE_WALLET
                },
                status=status.HTTP_410_GONE,
            )

        donation = BenefactorDonation.objects.create(
            benefactor=request.user,
            donation_type="non_cash",
            amount=data.get("amount") or None,
            title=data.get("title", ""),
            description=data.get("description", ""),
            campaign=data.get("campaign", ""),
            patient_name=data.get("patient_name", ""),
            destination_type="general",
            status="completed",
        )
        return Response(
            {
                "id": donation.pk,
                "donation_type": donation.donation_type,
                "amount": str(donation.amount) if donation.amount else "",
                "title": donation.title,
                "status": donation.get_status_display(),
            },
            status=status.HTTP_201_CREATED,
        )


class BenefactorReportsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response([])


class BenefactorReceiptsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response([])


class BenefactorFavoritesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response([])

    def post(self, request, campaign_id=None):
        return Response({"detail": msg.NOT_IMPLEMENTED}, status=status.HTTP_501_NOT_IMPLEMENTED)


class SocialWorkUnitSignupView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        return Response(
            {"detail": msg.SOCIAL_WORK_UNIT_SIGNUP_DISABLED},
            status=status.HTTP_501_NOT_IMPLEMENTED,
        )
