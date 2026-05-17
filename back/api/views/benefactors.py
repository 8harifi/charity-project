from rest_framework import viewsets
from rest_framework.filters import SearchFilter
from rest_framework.permissions import IsAuthenticated

from .pagination import StandardResultsSetPagination
from ..models import (
    Benefactor
)
from ..serializers import (
    BenefactorSerializer
)


class BenefactorViewSet(viewsets.ModelViewSet):
    queryset = Benefactor.objects.all()
    serializer_class = BenefactorSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    filter_backends = [SearchFilter]
    search_fields = [
        "first_name",
        "last_name",
        "national_code",
        "phone_number",
        "user__username",
    ]
