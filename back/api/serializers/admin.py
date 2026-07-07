from rest_framework import serializers

from ..models import (
    AdminProfile,
    Benefactor,
    CoveredOrganization,
    CustomUser,
    Doctor,
    Education,
    Gender,
    HealthAssistant,
    HousingStatus,
    IndividualHealthAssistant,
    Insurance,
    JobStatus,
    MaritalStatus,
    OrganizationHealthAssistant,
    Patient,
    Specialty,
)
from ..admin_user_filters import user_profile_phone
from .auth import ProfileSerializer
from .lookup_utils import resolve_lookup


class AdminUserListSerializer(serializers.ModelSerializer):
    display_name = serializers.SerializerMethodField()
    phone = serializers.SerializerMethodField()

    class Meta:
        model = CustomUser
        fields = [
            "id",
            "username",
            "phone",
            "email",
            "role",
            "state",
            "is_active",
            "date_joined",
            "display_name",
        ]

    def get_phone(self, obj):
        return user_profile_phone(obj)

    def get_display_name(self, obj):
        role = obj.role
        try:
            if role == "patient":
                p = obj.patient_profile
                return f"{p.first_name} {p.last_name}".strip()
            if role == "doctor":
                d = obj.doctor_profile
                return f"{d.first_name} {d.last_name}".strip()
            if role == "benefactor":
                b = obj.benefactor_profile
                return f"{b.first_name} {b.last_name}".strip()
            if role == "health_assistant":
                ha = obj.health_assistant_profile
                try:
                    ind = ha.individual_profile
                    return f"{ind.first_name} {ind.last_name}".strip()
                except IndividualHealthAssistant.DoesNotExist:
                    org = ha.organization_profile
                    return org.name.strip()
            if role == "admin":
                a = obj.admin_profile
                return f"{a.first_name} {a.last_name}".strip()
        except Exception:
            pass
        name = f"{obj.first_name} {obj.last_name}".strip()
        return name or obj.username


class AdminUserAccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ["state", "is_active", "email", "first_name", "last_name"]


class AdminPatientProfileSerializer(serializers.ModelSerializer):
    gender = serializers.IntegerField(required=False, allow_null=True)
    marital_status = serializers.IntegerField(required=False, allow_null=True)
    education = serializers.IntegerField(required=False, allow_null=True)
    job_status = serializers.IntegerField(required=False, allow_null=True)
    housing_status = serializers.IntegerField(required=False, allow_null=True)
    covered_organization = serializers.IntegerField(required=False, allow_null=True)
    insurance = serializers.IntegerField(required=False, allow_null=True)

    class Meta:
        model = Patient
        fields = [
            "first_name",
            "last_name",
            "father_name",
            "national_code",
            "phone_number",
            "landline_number",
            "age",
            "head_household",
            "number_dependents",
            "family_status",
            "skill",
            "province",
            "city",
            "address",
            "sickness_description",
            "contact1_full_name",
            "contact1_phone_number",
            "contact2_full_name",
            "contact2_phone_number",
            "gender",
            "marital_status",
            "education",
            "job_status",
            "housing_status",
            "covered_organization",
            "insurance",
        ]

    def validate(self, attrs):
        fk_map = {
            "gender": Gender,
            "marital_status": MaritalStatus,
            "education": Education,
            "job_status": JobStatus,
            "housing_status": HousingStatus,
            "covered_organization": CoveredOrganization,
            "insurance": Insurance,
        }
        for field, model in fk_map.items():
            if field in attrs and attrs[field] is not None:
                attrs[field] = resolve_lookup(
                    model, attrs[field], field_name=field, required=False
                )
        return attrs


class AdminDoctorProfileSerializer(serializers.ModelSerializer):
    gender = serializers.IntegerField(required=False, allow_null=True)
    specialty = serializers.IntegerField(required=False, allow_null=True)

    class Meta:
        model = Doctor
        fields = [
            "first_name",
            "last_name",
            "father_name",
            "national_code",
            "medical_system_code",
            "phone_number",
            "province",
            "city",
            "address",
            "gender",
            "specialty",
        ]

    def validate(self, attrs):
        if "gender" in attrs and attrs["gender"] is not None:
            attrs["gender"] = resolve_lookup(
                Gender, attrs["gender"], field_name="gender", required=False
            )
        if "specialty" in attrs and attrs["specialty"] is not None:
            attrs["specialty"] = resolve_lookup(
                Specialty, attrs["specialty"], field_name="specialty", required=False
            )
        return attrs


class AdminBenefactorProfileSerializer(serializers.ModelSerializer):
    gender = serializers.IntegerField(required=False, allow_null=True)

    class Meta:
        model = Benefactor
        fields = [
            "first_name",
            "last_name",
            "national_code",
            "phone_number",
            "gender",
        ]

    def validate(self, attrs):
        if "gender" in attrs and attrs["gender"] is not None:
            attrs["gender"] = resolve_lookup(
                Gender, attrs["gender"], field_name="gender", required=False
            )
        return attrs


class AdminIndividualHASerializer(serializers.ModelSerializer):
    gender = serializers.IntegerField(required=False, allow_null=True)

    class Meta:
        model = IndividualHealthAssistant
        fields = [
            "last_name",
            "national_code",
            "phone_number",
            "job",
            "province",
            "city",
            "home_address",
            "work_address",
            "gender",
        ]

    def validate(self, attrs):
        if "gender" in attrs and attrs["gender"] is not None:
            attrs["gender"] = resolve_lookup(
                Gender, attrs["gender"], field_name="gender", required=False
            )
        return attrs


class AdminOrganizationHASerializer(serializers.ModelSerializer):
    class Meta:
        model = OrganizationHealthAssistant
        fields = [
            "name",
            "director_first_name",
            "director_last_name",
            "director_phone_number",
            "director_landline_number",
            "province",
            "city",
            "address",
            "social_unit_head_first_name",
            "social_unit_head_last_name",
            "social_unit_head_phone_number",
            "social_unit_head_landline_number",
        ]


def admin_profile_payload(user):
    data = ProfileSerializer(user).data
    data["state"] = user.state
    data["is_active"] = user.is_active
    return data
