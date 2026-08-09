from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .. import messages as msg
from ..models import (
    AdminProfile,
    Benefactor,
    Doctor,
    HealthAssistant,
    IndividualHealthAssistant,
    OrganizationHealthAssistant,
    Patient,
)
from ..serializers import ProfileSerializer
from ..serializers.profile_update import (
    AdminProfileUpdateSerializer,
    BenefactorProfileUpdateSerializer,
    DoctorProfileUpdateSerializer,
    IndividualHealthAssistantProfileUpdateSerializer,
    OrganizationHealthAssistantProfileUpdateSerializer,
    PatientProfileUpdateSerializer,
)


class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = ProfileSerializer(request.user, context={"request": request})
        data = serializer.data
        data["state"] = request.user.state
        return Response(data, status=200)

    def patch(self, request):
        user = request.user
        profile_data = request.data.get("profile", {})
        if isinstance(profile_data, str):
            import json

            try:
                profile_data = json.loads(profile_data) if profile_data else {}
            except json.JSONDecodeError:
                return Response({"detail": msg.PROFILE_DATA_REQUIRED}, status=400)

        image_file = request.FILES.get("profile_image")
        if image_file:
            user.profile_image = image_file
            user.save(update_fields=["profile_image"])

        if not profile_data and not image_file:
            return Response({"detail": msg.PROFILE_DATA_REQUIRED}, status=400)

        if profile_data:
            role = user.role
            try:
                if role == "patient":
                    profile = user.patient_profile
                    serializer = PatientProfileUpdateSerializer(
                        profile, data=profile_data, partial=True
                    )
                elif role == "doctor":
                    profile = user.doctor_profile
                    serializer = DoctorProfileUpdateSerializer(
                        profile, data=profile_data, partial=True
                    )
                elif role == "benefactor":
                    profile = user.benefactor_profile
                    serializer = BenefactorProfileUpdateSerializer(
                        profile, data=profile_data, partial=True
                    )
                elif role == "health_assistant":
                    ha = user.health_assistant_profile
                    try:
                        profile = ha.individual_profile
                        serializer = IndividualHealthAssistantProfileUpdateSerializer(
                            profile, data=profile_data, partial=True
                        )
                    except IndividualHealthAssistant.DoesNotExist:
                        profile = ha.organization_profile
                        serializer = OrganizationHealthAssistantProfileUpdateSerializer(
                            profile, data=profile_data, partial=True
                        )
                elif role == "admin":
                    profile = user.admin_profile
                    serializer = AdminProfileUpdateSerializer(
                        profile, data=profile_data, partial=True
                    )
                else:
                    return Response({"detail": msg.ROLE_NOT_SUPPORTED}, status=403)
            except (
                Patient.DoesNotExist,
                Doctor.DoesNotExist,
                Benefactor.DoesNotExist,
                HealthAssistant.DoesNotExist,
                AdminProfile.DoesNotExist,
            ):
                return Response({"detail": msg.PROFILE_NOT_FOUND}, status=404)

            serializer.is_valid(raise_exception=True)
            serializer.save()

        result = ProfileSerializer(user, context={"request": request}).data
        result["state"] = user.state
        return Response(result, status=200)
