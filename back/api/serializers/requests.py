from rest_framework import serializers

from ..models import NetworkRequest, Patient, RequestStatusLog, Specialty
from .lookup_utils import resolve_lookup


class RequestStatusLogSerializer(serializers.ModelSerializer):
    actor_role = serializers.SerializerMethodField()
    actor_name = serializers.SerializerMethodField()
    status_label = serializers.SerializerMethodField()

    class Meta:
        model = RequestStatusLog
        fields = [
            "id",
            "status",
            "status_label",
            "note",
            "actor_role",
            "actor_name",
            "created_at",
        ]

    def get_actor_role(self, obj):
        if not obj.actor:
            return ""
        return obj.actor.get_role_display() if hasattr(obj.actor, "get_role_display") else obj.actor.role

    def get_actor_name(self, obj):
        if not obj.actor:
            return "سیستم"
        return obj.actor.username

    def get_status_label(self, obj):
        labels = dict(NetworkRequest.STATUS_CHOICES)
        return labels.get(obj.status, obj.status)


class NetworkRequestSerializer(serializers.ModelSerializer):
    patient_name = serializers.SerializerMethodField()
    patient_code = serializers.CharField(source="patient.patient_code", read_only=True)
    specialty_name = serializers.SerializerMethodField()
    request_type_label = serializers.CharField(source="get_request_type_display", read_only=True)
    status_label = serializers.CharField(source="get_status_display", read_only=True)
    handled_by_name = serializers.SerializerMethodField()
    created_by_role = serializers.CharField(source="created_by.role", read_only=True)
    status_logs = RequestStatusLogSerializer(many=True, read_only=True)
    illness_summary = serializers.CharField(
        source="patient.sickness_description",
        read_only=True,
        default="",
    )

    class Meta:
        model = NetworkRequest
        fields = [
            "id",
            "request_type",
            "request_type_label",
            "patient",
            "patient_name",
            "patient_code",
            "created_by",
            "created_by_role",
            "specialty",
            "specialty_name",
            "subject",
            "description",
            "amount_needed",
            "consultation_mode",
            "preferred_date",
            "preferred_time",
            "needed_service",
            "status",
            "status_label",
            "handled_by",
            "handled_by_name",
            "illness_summary",
            "status_logs",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "patient",
            "created_by",
            "status",
            "handled_by",
            "created_at",
            "updated_at",
        ]

    def get_specialty_name(self, obj):
        return obj.specialty.name if obj.specialty else ""

    def get_patient_name(self, obj):
        p = obj.patient
        return f"{p.first_name} {p.last_name}".strip()

    def get_handled_by_name(self, obj):
        if not obj.handled_by:
            return ""
        return obj.handled_by.username


class NetworkRequestCreateSerializer(serializers.Serializer):
    request_type = serializers.ChoiceField(choices=["consultation", "financial", "service"])
    patient_id = serializers.IntegerField(required=False)
    specialty = serializers.IntegerField(required=False, allow_null=True)
    subject = serializers.CharField(max_length=255)
    description = serializers.CharField()
    amount_needed = serializers.DecimalField(
        max_digits=12,
        decimal_places=0,
        required=False,
        allow_null=True,
    )
    consultation_mode = serializers.ChoiceField(
        choices=["آنلاین", "حضوری", "تلفنی"],
        required=False,
        allow_blank=True,
    )
    preferred_date = serializers.CharField(required=False, allow_blank=True, default="")
    preferred_time = serializers.CharField(required=False, allow_blank=True, default="")
    needed_service = serializers.CharField(required=False, allow_blank=True, default="")

    def validate(self, attrs):
        request_type = attrs["request_type"]
        user = self.context["request"].user

        if request_type == "consultation":
            if not attrs.get("specialty"):
                raise serializers.ValidationError({"specialty": "تخصص پزشک الزامی است."})
            attrs["specialty"] = resolve_lookup(
                Specialty, attrs["specialty"], field_name="specialty"
            )
        elif request_type == "financial":
            if not attrs.get("amount_needed"):
                raise serializers.ValidationError({"amount_needed": "مبلغ مورد نیاز الزامی است."})
        elif request_type == "service":
            if not attrs.get("needed_service"):
                raise serializers.ValidationError({"needed_service": "نوع خدمت الزامی است."})

        patient_id = attrs.get("patient_id")
        if user.role == "patient":
            try:
                patient = user.patient_profile
            except Patient.DoesNotExist:
                raise serializers.ValidationError("پروفایل بیمار یافت نشد.")
            if patient_id and patient_id != patient.pk:
                raise serializers.ValidationError({"patient_id": "بیمار فقط می‌تواند برای خود درخواست ثبت کند."})
            attrs["patient"] = patient
        elif user.role == "health_assistant":
            if not patient_id:
                raise serializers.ValidationError({"patient_id": "انتخاب بیمار الزامی است."})
            try:
                patient = Patient.objects.get(pk=patient_id)
            except Patient.DoesNotExist:
                raise serializers.ValidationError({"patient_id": "بیمار یافت نشد."})
            ha = user.health_assistant_profile
            if patient.introducer_id != ha.pk:
                raise serializers.ValidationError({"patient_id": "این بیمار تحت پوشش شما نیست."})
            attrs["patient"] = patient
        else:
            raise serializers.ValidationError("نقش کاربر مجاز به ثبت درخواست نیست.")

        return attrs

    def create(self, validated):
        user = self.context["request"].user
        specialty = validated.pop("specialty", None)
        validated.pop("patient_id", None)
        patient = validated.pop("patient")

        network_request = NetworkRequest.objects.create(
            patient=patient,
            created_by=user,
            specialty=specialty,
            status="pending",
            **validated,
        )
        RequestStatusLog.objects.create(
            request=network_request,
            status="pending",
            note="درخواست ثبت شد",
            actor=user,
        )
        return network_request


class NetworkRequestStatusSerializer(serializers.Serializer):
    action = serializers.ChoiceField(choices=["accept", "reject", "start", "complete"])
    note = serializers.CharField(required=False, allow_blank=True, default="")
