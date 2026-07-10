from rest_framework import serializers

from .. import messages as msg
from ..models import Benefactor, CustomUser, Gender
from .lookup_utils import resolve_lookup
from .user import UserSerializer


from ..utils import normalize_phone


class BenefactorSignupSerializer(serializers.Serializer):
    password = serializers.CharField(write_only=True)

    first_name = serializers.CharField()
    last_name = serializers.CharField()
    gender = serializers.IntegerField()
    national_code = serializers.CharField(max_length=10)
    phone_number = serializers.CharField(max_length=11)

    def validate_phone_number(self, value):
        phone = normalize_phone(value)
        if not phone:
            raise serializers.ValidationError(msg.PHONE_NUMBER_REQUIRED)
        if not phone.startswith("09") or len(phone) != 11 or not phone.isdigit():
            raise serializers.ValidationError(msg.INVALID_MOBILE_PHONE)
        if CustomUser.objects.filter(username=phone).exists():
            raise serializers.ValidationError(msg.PHONE_ALREADY_REGISTERED)
        return phone

    def validate_national_code(self, value):
        if Benefactor.objects.filter(national_code=value).exists():
            raise serializers.ValidationError(msg.NATIONAL_CODE_EXISTS_BENEFACTOR)
        return value

    def validate(self, attrs):
        attrs["gender"] = resolve_lookup(Gender, attrs["gender"], field_name="gender")
        return attrs

    def create(self, validated):
        user = CustomUser.objects.create_user(
            username=validated["phone_number"],
            password=validated["password"],
            role="benefactor",
        )
        return Benefactor.objects.create(
            user=user,
            first_name=validated["first_name"],
            last_name=validated["last_name"],
            gender=validated["gender"],
            national_code=validated["national_code"],
            phone_number=validated["phone_number"],
        )


class BenefactorSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    gender_name = serializers.CharField(source="gender.name", read_only=True)

    class Meta:
        model = Benefactor
        fields = "__all__"
