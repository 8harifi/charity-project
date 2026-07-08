from rest_framework import serializers

from .. import messages as msg
from ..models import (
    CoveredOrganization,
    CustomUser,
    Education,
    Gender,
    HealthAssistant,
    HousingStatus,
    Insurance,
    JobStatus,
    MaritalStatus,
    Patient,
)
from ..utils import generate_patient_code, normalize_phone
from .lookup_utils import resolve_lookup
from .user import UserSerializer


class PatientSignupSerializer(serializers.Serializer):
    """Login identity is phone_number (stored as CustomUser.username)."""

    national_code = serializers.CharField(max_length=10)

    phone_number = serializers.CharField(max_length=11)
    password = serializers.CharField(write_only=True)

    first_name = serializers.CharField()
    last_name = serializers.CharField()
    father_name = serializers.CharField()
    gender = serializers.IntegerField()
    age = serializers.IntegerField()
    marital_status = serializers.IntegerField()
    head_household = serializers.BooleanField()
    number_dependents = serializers.IntegerField(required=False, default=0)
    family_status = serializers.CharField(required=False, allow_blank=True)

    education = serializers.IntegerField()
    job_status = serializers.IntegerField()
    skill = serializers.CharField(required=False, allow_blank=True)

    housing_status = serializers.IntegerField()
    covered_organization = serializers.IntegerField()

    landline_number = serializers.CharField(required=False, allow_blank=True)

    province = serializers.CharField()
    city = serializers.CharField()
    address = serializers.CharField()

    contact1_full_name = serializers.CharField(required=False, allow_blank=True)
    contact1_phone_number = serializers.CharField(required=False, allow_blank=True)

    contact2_full_name = serializers.CharField(required=False, allow_blank=True)
    contact2_phone_number = serializers.CharField(required=False, allow_blank=True)

    insurance = serializers.IntegerField()
    sickness_description = serializers.CharField(required=False, allow_blank=True)

    national_card_image = serializers.ImageField(required=False, allow_null=True)
    birth_certificate_image = serializers.ImageField(required=False, allow_null=True)

    health_assistant_code = serializers.CharField(required=False, allow_blank=True)

    presenter_first_name = serializers.CharField(required=False, allow_blank=True)
    presenter_last_name = serializers.CharField(required=False, allow_blank=True)
    presenter_national_code = serializers.CharField(required=False, allow_blank=True)

    def validate_phone_number(self, value):
        phone = normalize_phone(value)
        if not phone:
            raise serializers.ValidationError(msg.PHONE_NUMBER_REQUIRED)
        if not phone.startswith("09") or len(phone) != 11 or not phone.isdigit():
            raise serializers.ValidationError(msg.INVALID_MOBILE_PHONE)
        if CustomUser.objects.filter(username=phone).exists():
            raise serializers.ValidationError(msg.PHONE_ALREADY_REGISTERED)
        if Patient.objects.filter(phone_number=phone).exists():
            raise serializers.ValidationError(msg.PHONE_ALREADY_REGISTERED)
        return phone

    def validate_national_code(self, value):
        nc = (value or "").strip()
        if not nc:
            raise serializers.ValidationError(msg.NATIONAL_CODE_REQUIRED)
        if not nc.isdigit() or len(nc) != 10:
            raise serializers.ValidationError("کد ملی باید ۱۰ رقم باشد.")
        return nc

    def validate_health_assistant_code(self, value):
        code = (value or "").strip()
        if not code:
            return ""
        if not HealthAssistant.objects.filter(health_assistance_code=code).exists():
            raise serializers.ValidationError("کد سلامتیار معرف نامعتبر است.")
        return code

    def validate(self, data):
        nc = data.get("national_code") or ""
        if Patient.objects.filter(national_code=nc).exists():
            raise serializers.ValidationError(
                {"national_code": msg.NATIONAL_CODE_EXISTS_PATIENT}
            )
        data["gender"] = resolve_lookup(Gender, data["gender"], field_name="gender")
        data["marital_status"] = resolve_lookup(
            MaritalStatus, data["marital_status"], field_name="marital_status"
        )
        data["education"] = resolve_lookup(Education, data["education"], field_name="education")
        data["job_status"] = resolve_lookup(JobStatus, data["job_status"], field_name="job_status")
        data["housing_status"] = resolve_lookup(
            HousingStatus, data["housing_status"], field_name="housing_status"
        )
        data["covered_organization"] = resolve_lookup(
            CoveredOrganization,
            data["covered_organization"],
            field_name="covered_organization",
        )
        data["insurance"] = resolve_lookup(Insurance, data["insurance"], field_name="insurance")
        return data

    def create(self, validated):
        phone = validated["phone_number"]
        user = CustomUser.objects.create_user(
            username=phone,
            password=validated["password"],
            role="patient",
        )

        ha_code = (validated.get("health_assistant_code") or "").strip()
        introducer = None
        if ha_code:
            introducer = HealthAssistant.objects.filter(
                health_assistance_code=ha_code
            ).first()
            # Self-registered patients with an introducer must stay pending
            # until BOTH admin and introducer HA approve them.
            if user.state:
                user.state = False
                user.save(update_fields=["state"])

        patient = Patient.objects.create(
            user=user,
            patient_code=generate_patient_code(),
            national_code=(validated.get("national_code") or "").strip(),
            introducer=introducer,
            first_name=validated["first_name"],
            last_name=validated["last_name"],
            father_name=validated["father_name"],
            gender=validated["gender"],
            age=validated["age"],
            marital_status=validated["marital_status"],
            head_household=validated["head_household"],
            number_dependents=validated.get("number_dependents") or 0,
            family_status=validated.get("family_status") or "",
            education=validated["education"],
            job_status=validated["job_status"],
            skill=validated.get("skill") or "",
            housing_status=validated["housing_status"],
            covered_organization=validated["covered_organization"],
            phone_number=phone,
            landline_number=validated.get("landline_number") or "",
            province=validated["province"],
            city=validated["city"],
            address=validated["address"],
            contact1_full_name=validated.get("contact1_full_name") or "",
            contact1_phone_number=validated.get("contact1_phone_number") or "",
            contact2_full_name=validated.get("contact2_full_name") or "",
            contact2_phone_number=validated.get("contact2_phone_number") or "",
            insurance=validated["insurance"],
            sickness_description=validated.get("sickness_description") or "",
            national_card_image=validated.get("national_card_image"),
            birth_certificate_image=validated.get("birth_certificate_image"),
        )

        return patient


class HealthAssistantPatientSignupSerializer(PatientSignupSerializer):
    """Patient registration by a logged-in health assistant; sets introducer and auto-approves."""

    def create(self, validated):
        patient = super().create(validated)
        patient.user.state = True
        patient.user.save(update_fields=["state"])
        introducer = self.context.get("introducer")
        patient.admin_approved = True
        patient.ha_approved = True
        update_fields = ["admin_approved", "ha_approved"]
        if introducer:
            patient.introducer = introducer
            update_fields.append("introducer")
        patient.save(update_fields=update_fields)
        return patient


class PatientSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Patient
        fields = "__all__"
