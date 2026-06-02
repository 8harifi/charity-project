from django.db.models import Q
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status

from .. import messages as msg
from ..models import Doctor, Patient
from ..serializers import DoctorSerializer, PatientSerializer


class GlobalSearchView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        query = request.query_params.get("q", "").strip()
        if not query:
            return Response({"error": msg.QUERY_REQUIRED}, status=status.HTTP_400_BAD_REQUEST)

        patient_results = Patient.objects.filter(
            Q(first_name__icontains=query)
            | Q(last_name__icontains=query)
            | Q(national_code__icontains=query)
            | Q(phone_number__icontains=query)
            | Q(patient_code__icontains=query)
        )
        patient_serializer = PatientSerializer(patient_results, many=True)

        doctor_results = Doctor.objects.filter(
            Q(first_name__icontains=query)
            | Q(last_name__icontains=query)
            | Q(national_code__icontains=query)
            | Q(medical_system_code__icontains=query)
            | Q(phone_number__icontains=query)
        )
        doctor_serializer = DoctorSerializer(doctor_results, many=True)

        return Response(
            {
                "patients": patient_serializer.data,
                "doctors": doctor_serializer.data,
            },
            status=status.HTTP_200_OK,
        )
