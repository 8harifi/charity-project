from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .. import messages as msg
from ..models import Benefactor, CustomUser, Doctor, HealthAssistant, Patient
from .benefactor import BenefactorSerializer
from .doctor import DoctorSerializer
from .health_assistant import HealthAssistantSerializer
from .patient import PatientSerializer


class ProfileSerializer(serializers.ModelSerializer):
    profile = serializers.SerializerMethodField()

    class Meta:
        model = CustomUser
        fields = [
            "id",
            "username",
            "email",
            "role",
            "first_name",
            "last_name",
            "profile",
        ]

    def get_profile(self, obj: CustomUser):
        role = obj.role

        if role == "admin":
            return None

        if role == "patient":
            try:
                return PatientSerializer(obj.patient_profile).data
            except Patient.DoesNotExist:
                return None

        if role == "doctor":
            try:
                return DoctorSerializer(obj.doctor_profile).data
            except Doctor.DoesNotExist:
                return None

        if role == "benefactor":
            try:
                return BenefactorSerializer(obj.benefactor_profile).data
            except Benefactor.DoesNotExist:
                return None

        if role == "health_assistant":
            try:
                return HealthAssistantSerializer(obj.health_assistant_profile).data
            except HealthAssistant.DoesNotExist:
                return None

        return None


class CustomTokenSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        token["role"] = user.role
        token["id"] = user.id
        token["username"] = user.username

        return token

    def validate(self, attrs):
        data = super().validate(attrs)

        user = self.user
        if user.is_superuser or getattr(user, "role", None) == "admin":
            return data

        if not user.state:
            raise serializers.ValidationError(msg.ACCOUNT_NOT_APPROVED)

        return data
