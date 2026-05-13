from rest_framework import viewsets
from rest_framework.filters import SearchFilter
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView

from ..models import Patient
from ..serializers import PatientSerializer
from .pagination import StandardResultsSetPagination


class PatientViewSet(viewsets.ModelViewSet):
    queryset = Patient.objects.all()
    serializer_class = PatientSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    filter_backends = [SearchFilter]
    search_fields = [
        "first_name",
        "last_name",
        "national_code",
        "phone_number",
        "patient_code",
        "user__username",
    ]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {
                    "ok": False,
                    "errors": serializer.errors,
                    "message": "خطا در اعتبارسنجی داده‌ها",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            instance = serializer.save()
            headers = self.get_success_headers(serializer.data)
            return Response(
                {
                    "ok": True,
                    "data": self.get_serializer(instance).data,
                    "message": "بیمار با موفقیت ثبت شد",
                },
                status=status.HTTP_201_CREATED,
                headers=headers,
            )
        except Exception as e:
            return Response(
                {"ok": False, "message": f"خطا در ثبت بیمار: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)

        if page is not None:
            serializer = self.get_serializer(page, many=True)
            result = self.get_paginated_response(serializer.data)
            data = result.data
            return Response(
                {
                    "ok": True,
                    "data": data["results"],
                    "pagination": {
                        "total_count": data["count"],
                        "page_size": data["page_size"],
                        "current_page": data["current_page"],
                        "total_pages": data["total_pages"],
                    },
                }
            )


class PatientByNationalCodeAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, national_code):
        try:
            patient = Patient.objects.get(national_code=national_code)
            serializer = PatientSerializer(patient)
            return Response(
                {
                    "ok": True,
                    "data": serializer.data,
                    "message": "بیمار با موفقیت یافت شد",
                },
                status=status.HTTP_200_OK,
            )
        except Patient.DoesNotExist:
            return Response(
                {
                    "ok": False,
                    "message": "بیماری با این کد ملی یافت نشد",
                },
                status=status.HTTP_404_NOT_FOUND,
            )
