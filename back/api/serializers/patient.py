from rest_framework import serializers

from .. import messages as msg
from ..models import (
    CoveredOrganization,
    CustomUser,
    Education,
    Gender,
    HousingStatus,
    Insurance,
    JobStatus,
    MaritalStatus,
    Patient,
)
from ..utils import generate_patient_code
from .lookup_utils import resolve_lookup
from .user import UserSerializer


class PatientSignupSerializer(serializers.Serializer):
    """Login username is `phone_number` (must be unique)."""

    national_code = serializers.CharField(required=False, allow_blank=True, allow_null=True)

    phone_number = serializers.CharField(max_length=11)
    username = serializers.CharField()
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

    bank_card_number = serializers.CharField()

    contact1_full_name = serializers.CharField(required=False, allow_blank=True)
    contact1_phone_number = serializers.CharField(required=False, allow_blank=True)

    contact2_full_name = serializers.CharField(required=False, allow_blank=True)
    contact2_phone_number = serializers.CharField(required=False, allow_blank=True)

    insurance = serializers.IntegerField()
    sickness_description = serializers.CharField(required=False, allow_blank=True)

    national_card_image = serializers.ImageField(required=False, allow_null=True)
    birth_certificate_image = serializers.ImageField(required=False, allow_null=True)

    presenter_first_name = serializers.CharField(required=False, allow_blank=True)
    presenter_last_name = serializers.CharField(required=False, allow_blank=True)
    presenter_national_code = serializers.CharField(required=False, allow_blank=True)

    def validate_phone_number(self, value):
        if CustomUser.objects.filter(username=value).exists():
            raise serializers.ValidationError(msg.PHONE_ALREADY_REGISTERED)
        return value

    def validate(self, data):
        nc = (data.get("national_code") or "").strip()
        if nc and Patient.objects.filter(national_code=nc).exists():
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
        user = CustomUser.objects.create_user(
            username=validated["username"],
            password=validated["password"],
            role="patient",
        )

        patient = Patient.objects.create(
            user=user,
            patient_code=generate_patient_code(),
            national_code=(validated.get("national_code") or "").strip() or None,
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
            phone_number=validated["phone_number"],
            landline_number=validated.get("landline_number") or "",
            province=validated["province"],
            city=validated["city"],
            address=validated["address"],
            bank_card_number=validated.get("bank_card_number") or "",
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


class PatientSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Patient
        fields = "__all__"
