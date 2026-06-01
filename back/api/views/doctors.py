from rest_framework import viewsets
from rest_framework.filters import SearchFilter
from rest_framework.permissions import IsAuthenticated

from ..models import Doctor
from ..serializers import DoctorSerializer
from .pagination import StandardResultsSetPagination


class DoctorViewSet(viewsets.ModelViewSet):
    queryset = Doctor.objects.prefetch_related("cooperating_health_assistants")
    serializer_class = DoctorSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    filter_backends = [SearchFilter]
    search_fields = [
        "first_name",
        "last_name",
        "national_code",
        "medical_system_code",
        "phone_number",
        "user__username",
    ]
