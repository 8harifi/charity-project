from rest_framework import serializers

from .. import messages as msg
from ..models import Benefactor, CustomUser, Gender
from .lookup_utils import resolve_lookup
from .user import UserSerializer


class BenefactorSignupSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    first_name = serializers.CharField()
    last_name = serializers.CharField()
    gender = serializers.IntegerField()
    national_code = serializers.CharField(max_length=10)
    phone_number = serializers.CharField(max_length=11)

    def validate_username(self, value):
        if CustomUser.objects.filter(username=value).exists():
            raise serializers.ValidationError(msg.USERNAME_TAKEN)
        return value

    def validate_national_code(self, value):
        if Benefactor.objects.filter(national_code=value).exists():
            raise serializers.ValidationError(msg.NATIONAL_CODE_EXISTS_BENEFACTOR)
        return value

    def validate_phone_number(self, value):
        value = (value or "").strip()
        if not value:
            raise serializers.ValidationError(msg.PHONE_NUMBER_REQUIRED)
        if not value.startswith("09") or len(value) != 11 or not value.isdigit():
            raise serializers.ValidationError(msg.INVALID_MOBILE_PHONE)
        return value

    def validate(self, attrs):
        attrs["gender"] = resolve_lookup(Gender, attrs["gender"], field_name="gender")
        return attrs

    def create(self, validated):
        user = CustomUser.objects.create_user(
            username=validated["username"],
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
