from rest_framework.permissions import (
    AllowAny,
    IsAuthenticated
)
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from rest_framework_simplejwt.views import TokenObtainPairView

from ..serializers import (
    CustomTokenSerializer,
    DoctorSignupSerializer,
    PatientSignupSerializer,
    BenefactorSignupSerializer,
)


class HelloView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        content = {"message": "سلام! شما با موفقیت وارد شده‌اید!"}
        return Response(content)


class PatientSignupView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PatientSignupSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        patient = serializer.save()

        return Response(
            {
                "message": "Patient created successfully",
                "patient": {
                    "id": patient.id,
                    "patient_code": patient.patient_code,
                },
                "user": {
                    "id": patient.user.id,
                    "username": patient.user.username,
                },
            },
            status=status.HTTP_201_CREATED,
        )


class DoctorSignupView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = DoctorSignupSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        doctor = serializer.save()

        return Response(
            {
                "message": "Doctor created successfully",
                "doctor": {
                    "id": doctor.id,
                    "full_name": f"{doctor.first_name} {doctor.last_name}",
                    "national_code": doctor.national_code,
                    "medical_system_code": doctor.medical_system_code,
                },
                "user": {
                    "id": doctor.user.id,
                    "username": doctor.user.username,
                },
            },
            status=status.HTTP_201_CREATED,
        )


class BenefactorSignupView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = BenefactorSignupSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        benefactor = serializer.save()

        return Response(
            {
                "message": "Benefactor created successfully",
                "benefactor": {
                    "id": benefactor.id,
                    "full_name": f"{benefactor.first_name} {benefactor.last_name}",
                    "national_code": benefactor.national_code,
                },
                "user": {
                    "id": benefactor.user.id,
                    "username": benefactor.user.username,
                },
            },
            status=status.HTTP_201_CREATED,
        )


class LoginView(TokenObtainPairView):
    serializer_class = CustomTokenSerializer
    permission_classes = [AllowAny]
