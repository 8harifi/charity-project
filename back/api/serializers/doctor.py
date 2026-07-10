from rest_framework import serializers

from .. import messages as msg
from ..models import CustomUser, Doctor, Gender, HealthAssistant, Specialty
from .lookup_utils import resolve_lookup
from .user import UserSerializer


from ..utils import normalize_phone


class DoctorSignupSerializer(serializers.Serializer):
    password = serializers.CharField(write_only=True)

    first_name = serializers.CharField()
    last_name = serializers.CharField()
    father_name = serializers.CharField()

    gender = serializers.IntegerField()
    national_code = serializers.CharField(max_length=10)
    medical_system_code = serializers.CharField(max_length=20)
    phone_number = serializers.CharField(max_length=11)

    specialty = serializers.IntegerField()
    province = serializers.CharField()
    city = serializers.CharField()
    address = serializers.CharField()

    cooperating_health_assistants = serializers.ListField(
        child=serializers.IntegerField(),
        required=False,
        allow_empty=True,
        default=list,
    )

    def validate_phone_number(self, value):
        phone = normalize_phone(value)
        if not phone:
            raise serializers.ValidationError(msg.PHONE_NUMBER_REQUIRED)
        if not phone.startswith("09") or len(phone) != 11 or not phone.isdigit():
            raise serializers.ValidationError(msg.INVALID_MOBILE_PHONE)
        if CustomUser.objects.filter(username=phone).exists():
            raise serializers.ValidationError(msg.PHONE_ALREADY_REGISTERED)
        return phone

    def validate_cooperating_health_assistants(self, value):
        if not value:
            return []
        unique_ids = list(dict.fromkeys(value))
        found = set(
            HealthAssistant.objects.filter(pk__in=unique_ids).values_list("pk", flat=True)
        )
        missing = [pk for pk in unique_ids if pk not in found]
        if missing:
            raise serializers.ValidationError(msg.invalid_health_assistant_ids(missing))
        return unique_ids

    def validate(self, attrs):
        attrs["gender"] = resolve_lookup(Gender, attrs["gender"], field_name="gender")
        attrs["specialty"] = resolve_lookup(Specialty, attrs["specialty"], field_name="specialty")
        return attrs

    def create(self, validated):
        assistant_ids = validated.pop("cooperating_health_assistants", [])

        user = CustomUser.objects.create_user(
            username=validated["phone_number"],
            password=validated["password"],
            role="doctor",
        )

        doctor = Doctor.objects.create(
            user=user,
            first_name=validated["first_name"],
            last_name=validated["last_name"],
            father_name=validated["father_name"],
            gender=validated["gender"],
            national_code=validated["national_code"],
            medical_system_code=validated["medical_system_code"],
            phone_number=validated["phone_number"],
            specialty=validated["specialty"],
            province=validated["province"],
            city=validated["city"],
            address=validated["address"],
        )
        if assistant_ids:
            doctor.cooperating_health_assistants.set(assistant_ids)
        return doctor


class DoctorSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    cooperates_with_all = serializers.SerializerMethodField()

    class Meta:
        model = Doctor
        fields = "__all__"

    def get_cooperates_with_all(self, obj):
        return obj.cooperates_with_all_health_assistants()
