from rest_framework import serializers

from ..models import (
    ContactDisclosureRequest,
    ContactMessage,
    DoctorScheduleImage,
    MedicalCenter,
)


class DoctorScheduleImageSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    shift_label = serializers.CharField(source="get_shift_display", read_only=True)
    weekday_label = serializers.CharField(source="get_weekday_display", read_only=True)
    specialty_level_label = serializers.CharField(
        source="get_specialty_level_display", read_only=True
    )

    class Meta:
        model = DoctorScheduleImage
        fields = [
            "id",
            "image",
            "image_url",
            "caption",
            "shift",
            "shift_label",
            "weekday",
            "weekday_label",
            "specialty_name",
            "doctor_name",
            "specialty_level",
            "specialty_level_label",
            "sort_order",
        ]
        extra_kwargs = {"image": {"write_only": True, "required": False}}

    def get_image_url(self, obj):
        request = self.context.get("request")
        if not obj.image:
            return ""
        url = obj.image.url
        if request:
            return request.build_absolute_uri(url)
        return url


class MedicalCenterSerializer(serializers.ModelSerializer):
    center_type_label = serializers.CharField(source="get_center_type_display", read_only=True)
    schedule_images = DoctorScheduleImageSerializer(many=True, read_only=True)

    class Meta:
        model = MedicalCenter
        fields = [
            "id",
            "name",
            "province",
            "city",
            "center_type",
            "center_type_label",
            "address",
            "landline",
            "is_active",
            "schedule_images",
            "created_at",
        ]
        read_only_fields = ["created_at"]


class ContactMessageSerializer(serializers.ModelSerializer):
    intent_label = serializers.CharField(source="get_intent_display", read_only=True)
    status_label = serializers.CharField(source="get_status_display", read_only=True)

    class Meta:
        model = ContactMessage
        fields = [
            "id",
            "name",
            "phone",
            "email",
            "region",
            "subject",
            "message",
            "intent",
            "intent_label",
            "patient",
            "network_request",
            "status",
            "status_label",
            "reply",
            "sms_sent",
            "created_at",
        ]
        read_only_fields = ["id", "status", "reply", "sms_sent", "created_at"]


class ContactMessageReplySerializer(serializers.Serializer):
    reply = serializers.CharField()
    send_sms = serializers.BooleanField(required=False, default=True)


class ContactDisclosureSerializer(serializers.ModelSerializer):
    patient_name = serializers.SerializerMethodField()
    benefactor_username = serializers.CharField(source="benefactor.username", read_only=True)
    status_label = serializers.CharField(source="get_status_display", read_only=True)

    class Meta:
        model = ContactDisclosureRequest
        fields = [
            "id",
            "patient",
            "patient_name",
            "network_request",
            "benefactor_username",
            "status",
            "status_label",
            "note",
            "created_at",
        ]

    def get_patient_name(self, obj):
        from ..utils import mask_patient_name

        return mask_patient_name(obj.patient)
