from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from ..models import (
    CoveredOrganization,
    Education,
    Gender,
    HealthAssistantCooperationType,
    HousingStatus,
    Insurance,
    JobStatus,
    MaritalStatus,
    OrganizationType,
    Specialty,
)


def _lookup_rows(model):
    rows = model.objects.all().order_by("id")
    return [{"id": row.id, "name": row.name} for row in rows]


class GenderLookupView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return Response(_lookup_rows(Gender))


class MaritalStatusLookupView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return Response(_lookup_rows(MaritalStatus))


class SpecialtyLookupView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return Response(_lookup_rows(Specialty))


class HealthAssistantCooperationTypeLookupView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return Response(_lookup_rows(HealthAssistantCooperationType))


class EducationLookupView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return Response(_lookup_rows(Education))


class JobStatusLookupView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return Response(_lookup_rows(JobStatus))


class HousingStatusLookupView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return Response(_lookup_rows(HousingStatus))


class CoveredOrganizationLookupView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return Response(_lookup_rows(CoveredOrganization))


class InsuranceLookupView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return Response(_lookup_rows(Insurance))


class OrganizationTypeLookupView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return Response(_lookup_rows(OrganizationType))
