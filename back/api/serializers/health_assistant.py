from rest_framework import serializers

from .. import messages as msg
from ..media_utils import split_full_name

from ..models import (
    CustomUser,
    Education,
    Gender,
    HealthAssistant,
    HealthAssistantCooperationType,
    IndividualHealthAssistant,
    OrganizationHealthAssistant,
    OrganizationType,
)

from ..utils import generate_health_assistance_code, normalize_phone
from .lookup_utils import resolve_lookup
from .user import UserSerializer


def flatten_signup_payload(data: dict) -> dict:
    if not isinstance(data, dict):
        return {}

    out = {}
    draft = data.get("draft")

    if isinstance(draft, dict):
        for value in draft.values():
            if isinstance(value, dict):
                out.update(value)

    for key, value in data.items():
        if key in ("password", "role", "draft", "profile_type"):
            continue
        if isinstance(value, dict) and key not in ("refLetterFile",):
            out.update(value)
        elif key not in ("draft",):
            out[key] = value

    return {**out, **{k: v for k, v in data.items() if k in ("password", "profile_type")}}


class IndividualHealthAssistantSerializer(serializers.ModelSerializer):
    class Meta:
        model = IndividualHealthAssistant
        exclude = ("health_assistant",)


class OrganizationHealthAssistantSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrganizationHealthAssistant
        exclude = ("health_assistant",)


class HealthAssistantSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    individual_profile = IndividualHealthAssistantSerializer(read_only=True)
    organization_profile = OrganizationHealthAssistantSerializer(read_only=True)

    class Meta:
        model = HealthAssistant
        fields = "__all__"
        read_only_fields = ("health_assistance_code", "created_at")


class HealthAssistantSignupSerializer(serializers.Serializer):
    password = serializers.CharField(write_only=True)
    profile_type = serializers.ChoiceField(
        choices=("individual", "organization"),
        default="individual",
        required=False,
    )

    name = serializers.CharField(required=False, allow_blank=True)
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)
    gender = serializers.IntegerField(required=False, allow_null=True)
    national_code = serializers.CharField(max_length=10, required=False, allow_blank=True)
    nationalCode = serializers.CharField(max_length=10, required=False, allow_blank=True)
    phone_number = serializers.CharField(max_length=11, required=False, allow_blank=True)
    phoneNumber = serializers.CharField(max_length=11, required=False, allow_blank=True)
    education = serializers.IntegerField(required=False, allow_null=True)
    job = serializers.CharField(required=False, allow_blank=True, max_length=100)
    province = serializers.CharField(required=False, allow_blank=True, max_length=100)
    town = serializers.CharField(required=False, allow_blank=True, max_length=100)
    city = serializers.CharField(required=False, allow_blank=True, max_length=100)
    address = serializers.CharField(required=False, allow_blank=True)
    job_address = serializers.CharField(required=False, allow_blank=True)
    jobAddress = serializers.CharField(required=False, allow_blank=True)
    cooperation_type = serializers.IntegerField(required=False, allow_null=True)
    collaborationType = serializers.IntegerField(required=False, allow_null=True)
    cooperation_description = serializers.CharField(required=False, allow_blank=True, default="")
    explanation = serializers.CharField(required=False, allow_blank=True, default="")
    organization_type = serializers.IntegerField(required=False, allow_null=True)
    legalType = serializers.IntegerField(required=False, allow_null=True)
    org_name = serializers.CharField(required=False, allow_blank=True)
    legalName = serializers.CharField(required=False, allow_blank=True)
    director_first_name = serializers.CharField(required=False, allow_blank=True)
    director_last_name = serializers.CharField(required=False, allow_blank=True)
    director_phone_number = serializers.CharField(required=False, allow_blank=True)
    director_landline_number = serializers.CharField(required=False, allow_blank=True)
    social_unit_head_first_name = serializers.CharField(required=False, allow_blank=True)
    social_unit_head_last_name = serializers.CharField(required=False, allow_blank=True)
    social_unit_head_phone_number = serializers.CharField(required=False, allow_blank=True)
    social_unit_head_landline_number = serializers.CharField(required=False, allow_blank=True)

    def to_internal_value(self, data):
        return super().to_internal_value(flatten_signup_payload(data))

    def _ensure_login_phone_available(self, phone):
        phone = normalize_phone(phone)
        if not phone:
            raise serializers.ValidationError({"phone_number": msg.PHONE_NUMBER_REQUIRED})
        if not phone.startswith("09") or len(phone) != 11 or not phone.isdigit():
            raise serializers.ValidationError({"phone_number": msg.INVALID_MOBILE_PHONE})
        if CustomUser.objects.filter(username=phone).exists():
            raise serializers.ValidationError({"phone_number": msg.PHONE_ALREADY_REGISTERED})
        return phone

    def validate(self, attrs):
        profile_type = attrs.get("profile_type") or "individual"
        attrs["profile_type"] = profile_type

        if profile_type == "individual":
            first = (attrs.get("first_name") or "").strip()
            last = (attrs.get("last_name") or "").strip()
            if not first:
                raise serializers.ValidationError({"name": msg.NAME_REQUIRED})

            attrs["first_name"] = first
            attrs["last_name"] = last or "-"

            nc = (attrs.get("national_code") or attrs.get("nationalCode") or "").strip()

            if not nc:
                raise serializers.ValidationError({"national_code": msg.NATIONAL_CODE_REQUIRED})

            if IndividualHealthAssistant.objects.filter(national_code=nc).exists():
                raise serializers.ValidationError(
                    {"national_code": msg.NATIONAL_CODE_EXISTS_HEALTH_ASSISTANT}
                )

            attrs["national_code"] = nc
            phone = (attrs.get("phone_number") or attrs.get("phoneNumber") or "").strip()

            if not phone:
                raise serializers.ValidationError({"phone_number": msg.PHONE_NUMBER_REQUIRED})

            attrs["phone_number"] = self._ensure_login_phone_available(phone)
            attrs["login_phone"] = attrs["phone_number"]
            gender_raw = attrs.get("gender")

            if gender_raw is None:
                raise serializers.ValidationError({"gender": msg.GENDER_REQUIRED})

            attrs["gender"] = resolve_lookup(Gender, gender_raw, field_name="gender")
            attrs["education"] = resolve_lookup(
                Education,
                attrs.get("education"),
                field_name="education",
                required=True,
            )

            for field in ("job", "province", "city"):
                if not (attrs.get(field) or "").strip():
                    raise serializers.ValidationError({field: msg.FIELD_REQUIRED})

            town = (attrs.get("town") or "").strip()
            address = (attrs.get("address") or "").strip()
            if not address and not town:
                raise serializers.ValidationError({"address": msg.FIELD_REQUIRED})

        else:
            org_name = (attrs.get("org_name") or attrs.get("legalName") or "").strip()
            if not org_name:
                raise serializers.ValidationError({"org_name": msg.ORG_NAME_REQUIRED})

            attrs["org_name"] = org_name
            director_phone = (
                attrs.get("director_phone_number") or ""
            ).strip()
            if not director_phone:
                raise serializers.ValidationError(
                    {"director_phone_number": msg.PHONE_NUMBER_REQUIRED}
                )
            attrs["director_phone_number"] = self._ensure_login_phone_available(director_phone)
            attrs["login_phone"] = attrs["director_phone_number"]
            org_type_raw = attrs.get("organization_type") or attrs.get("legalType")
            attrs["organization_type"] = resolve_lookup(
                OrganizationType,
                org_type_raw,
                field_name="organization_type",
                required=False,
            )

            for field in ("province", "city", "address"):
                if not (attrs.get(field) or "").strip():
                    raise serializers.ValidationError({field: msg.FIELD_REQUIRED})

            for field in (
                "social_unit_head_first_name",
                "social_unit_head_last_name",
                "social_unit_head_phone_number",
            ):
                if not (attrs.get(field) or "").strip():
                    raise serializers.ValidationError({field: msg.FIELD_REQUIRED})

            head_phone = (attrs.get("social_unit_head_phone_number") or "").strip()
            if head_phone and (
                not head_phone.startswith("09")
                or len(head_phone) != 11
                or not head_phone.isdigit()
            ):
                raise serializers.ValidationError(
                    {"social_unit_head_phone_number": msg.INVALID_MOBILE_PHONE}
                )

        coop_raw = attrs.get("cooperation_type") or attrs.get("collaborationType")

        attrs["cooperation_type"] = resolve_lookup(
            HealthAssistantCooperationType,
            coop_raw,
            field_name="cooperation_type",
            required=True,
        )

        if not attrs.get("cooperation_type"):
            raise serializers.ValidationError({"cooperation_type": msg.FIELD_REQUIRED})

        attrs["cooperation_description"] = (attrs.get("cooperation_description") or attrs.get("explanation") or "")[
                                           :2000]
        return attrs

    def create(self, validated):
        login_phone = validated["login_phone"]
        user = CustomUser.objects.create_user(
            username=login_phone,
            password=validated["password"],
            role="health_assistant",
        )

        health_assistant = HealthAssistant.objects.create(
            user=user,
            health_assistance_code=generate_health_assistance_code(),
            cooperation_type=validated.get("cooperation_type"),
            cooperation_description=validated["cooperation_description"],
        )

        if validated["profile_type"] == "organization":
            OrganizationHealthAssistant.objects.create(
                health_assistant=health_assistant,
                organization_type=validated.get("organization_type"),
                name=validated["org_name"],
                director_first_name=(validated.get("director_first_name") or "")[:100],
                director_last_name=(validated.get("director_last_name") or "")[:100],
                director_phone_number=(validated.get("director_phone_number") or "")[:11],
                director_landline_number=(validated.get("director_landline_number") or "")[:11],
                province=(validated.get("province") or "")[:100],
                city=(validated.get("city") or "")[:100],
                address=(validated.get("address") or ""),
                social_unit_head_first_name=(validated.get("social_unit_head_first_name") or "")[:100],
                social_unit_head_last_name=(validated.get("social_unit_head_last_name") or "")[:100],
                social_unit_head_phone_number=(validated.get("social_unit_head_phone_number") or "")[:100],
                social_unit_head_landline_number=(validated.get("social_unit_head_landline_number") or "")[:100],
            )

        else:
            town = (validated.get("town") or "").strip()
            address = (validated.get("address") or "").strip()
            home_address = f"{town}، {address}".strip("، ") if town and address else (address or town)
            IndividualHealthAssistant.objects.create(
                health_assistant=health_assistant,
                first_name=validated["first_name"],
                last_name=validated["last_name"],
                gender=validated["gender"],
                national_code=validated["national_code"],
                phone_number=validated["phone_number"],
                education=validated.get("education"),
                job=(validated.get("job") or "")[:100],
                province=(validated.get("province") or "")[:100],
                city=(validated.get("city") or "")[:100],
                home_address=home_address,
                work_address=(validated.get("job_address") or validated.get("jobAddress") or "")[:500],
            )

        return health_assistant
