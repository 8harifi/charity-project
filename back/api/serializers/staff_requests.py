from rest_framework import serializers

from ..models import RequestAttachment, StaffRequest


class RequestAttachmentSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()
    filename = serializers.SerializerMethodField()

    class Meta:
        model = RequestAttachment
        fields = ["id", "file", "file_url", "filename", "label", "created_at"]
        read_only_fields = ["id", "created_at"]

    def get_filename(self, obj):
        if not obj.file:
            return ""
        return obj.file.name.rsplit("/", 1)[-1]

    def get_file_url(self, obj):
        request = self.context.get("request")
        if obj.file and request:
            return request.build_absolute_uri(obj.file.url)
        if obj.file:
            return obj.file.url
        return ""


class StaffRequestSerializer(serializers.ModelSerializer):
    created_by_name = serializers.SerializerMethodField()
    health_assistant_name = serializers.SerializerMethodField()
    patient_name = serializers.SerializerMethodField()
    status_label = serializers.CharField(source="get_status_display", read_only=True)
    financial_status = serializers.SerializerMethodField()
    financial_status_label = serializers.SerializerMethodField()
    financial_collected = serializers.SerializerMethodField()
    financial_amount_needed = serializers.SerializerMethodField()

    class Meta:
        model = StaffRequest
        fields = [
            "id",
            "created_by",
            "created_by_name",
            "health_assistant",
            "health_assistant_name",
            "patient",
            "patient_name",
            "doctor_name",
            "subject",
            "description",
            "amount_needed",
            "network_request",
            "financial_status",
            "financial_status_label",
            "financial_collected",
            "financial_amount_needed",
            "status",
            "status_label",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "created_by",
            "health_assistant",
            "network_request",
            "status",
            "created_at",
            "updated_at",
        ]

    def get_created_by_name(self, obj):
        if obj.created_by.role == "doctor":
            try:
                d = obj.created_by.doctor_profile
                return f"{d.first_name} {d.last_name}".strip() or obj.created_by.username
            except Exception:
                pass
        return obj.created_by.username

    def get_health_assistant_name(self, obj):
        ha = obj.health_assistant
        if getattr(ha, "individual_profile", None):
            ind = ha.individual_profile
            return f"{ind.first_name} {ind.last_name}".strip()
        if getattr(ha, "organization_profile", None):
            return ha.organization_profile.name
        return str(ha.pk)

    def get_patient_name(self, obj):
        if not obj.patient:
            return ""
        p = obj.patient
        return f"{p.first_name} {p.last_name}".strip()

    def get_financial_status(self, obj):
        nr = obj.network_request
        return nr.status if nr else None

    def get_financial_status_label(self, obj):
        nr = obj.network_request
        return nr.get_status_display() if nr else ""

    def get_financial_collected(self, obj):
        nr = obj.network_request
        return nr.collected_amount if nr else None

    def get_financial_amount_needed(self, obj):
        nr = obj.network_request
        return nr.amount_needed if nr else None


class StaffRequestCreateSerializer(serializers.Serializer):
    health_assistant_id = serializers.IntegerField()
    patient_id = serializers.IntegerField(required=False, allow_null=True)
    doctor_name = serializers.CharField(required=False, allow_blank=True, default="")
    subject = serializers.CharField(max_length=255)
    description = serializers.CharField()
    amount_needed = serializers.DecimalField(
        max_digits=12, decimal_places=0, required=False, allow_null=True
    )

    def validate(self, attrs):
        from ..models import HealthAssistant, Patient

        user = self.context["request"].user
        if user.role != "doctor":
            raise serializers.ValidationError("فقط پزشک می‌تواند درخواست به سلامتیار ثبت کند.")
        try:
            ha = HealthAssistant.objects.get(pk=attrs["health_assistant_id"])
        except HealthAssistant.DoesNotExist:
            raise serializers.ValidationError({"health_assistant_id": "سلامتیار یافت نشد."})
        attrs["health_assistant"] = ha
        patient_id = attrs.get("patient_id")
        amount = attrs.get("amount_needed")
        if amount and not patient_id:
            raise serializers.ValidationError(
                {"patient_id": "برای درخواست مبلغ، شناسه بیمار الزامی است."}
            )
        if patient_id:
            try:
                attrs["patient"] = Patient.objects.get(pk=patient_id)
            except Patient.DoesNotExist:
                raise serializers.ValidationError({"patient_id": "بیمار یافت نشد."})
        else:
            attrs["patient"] = None
        return attrs

    def create(self, validated):
        user = self.context["request"].user
        validated.pop("health_assistant_id", None)
        validated.pop("patient_id", None)
        return StaffRequest.objects.create(created_by=user, **validated)


class StaffRequestStatusSerializer(serializers.Serializer):
    action = serializers.ChoiceField(choices=["accept", "reject", "complete", "cancel"])
    note = serializers.CharField(required=False, allow_blank=True, default="")
