from django.db import models
from rest_framework import serializers

from ..models import CustomUser, NetworkRequest, Patient, RequestStatusLog, Specialty
from ..models.wallet import DonationHold
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
    fund_recipient_name = serializers.SerializerMethodField()
    status_logs = RequestStatusLogSerializer(many=True, read_only=True)
    illness_summary = serializers.CharField(
        source="patient.sickness_description",
        read_only=True,
        default="",
    )
    collected_amount = serializers.DecimalField(max_digits=12, decimal_places=0, read_only=True)
    remaining = serializers.SerializerMethodField()
    my_pledge = serializers.SerializerMethodField()

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
            "collected_amount",
            "remaining",
            "my_pledge",
            "consultation_mode",
            "preferred_date",
            "preferred_time",
            "appointment_date",
            "appointment_time",
            "appointment_place",
            "appointment_phone",
            "confirmation_message",
            "needed_service",
            "status",
            "status_label",
            "handled_by",
            "handled_by_name",
            "fund_recipient",
            "fund_recipient_name",
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

    def get_fund_recipient_name(self, obj):
        if not obj.fund_recipient:
            return ""
        return obj.fund_recipient.username

    def get_remaining(self, obj):
        needed = obj.amount_needed or 0
        collected = obj.collected_amount or 0
        return max(0, needed - collected)

    def get_my_pledge(self, obj):
        request = self.context.get("request")
        user = request.user if request else None
        if not user or not user.is_authenticated:
            return 0
        total = DonationHold.objects.filter(
            benefactor=user,
            network_request=obj,
            status="held",
        ).aggregate(s=models.Sum("amount"))["s"]
        return total or 0


def fund_recipient_options(user):
    """Users a financial request's created_by (HA/doctor) may assign as fund_recipient:
    themselves, plus staff they cooperate with."""
    options = [user]
    if user.role == "health_assistant":
        ha = user.health_assistant_profile
        from ..models import Doctor

        doctors = Doctor.objects.filter(
            models.Q(cooperating_health_assistants=ha)
            | models.Q(cooperating_health_assistants__isnull=True)
        ).distinct()
        options += [d.user for d in doctors]
    elif user.role == "doctor":
        doctor = user.doctor_profile
        if doctor.cooperates_with_all_health_assistants():
            from ..models import HealthAssistant

            options += [ha.user for ha in HealthAssistant.objects.all()]
        else:
            options += [ha.user for ha in doctor.cooperating_health_assistants.all()]
    return options


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
    fund_recipient_user_id = serializers.IntegerField(required=False, allow_null=True)
    consultation_mode = serializers.ChoiceField(
        choices=["حضوری", "تلفنی"],
        required=False,
        allow_blank=True,
    )
    preferred_date = serializers.CharField(required=False, allow_blank=True, default="")
    preferred_time = serializers.CharField(required=False, allow_blank=True, default="")
    needed_service = serializers.CharField(required=False, allow_blank=True, default="")

    def validate(self, attrs):
        request_type = attrs["request_type"]
        user = self.context["request"].user

        # Financial request: only HA/doctor (not patient)
        if request_type == "financial" and user.role == "patient":
            raise serializers.ValidationError(
                "بیمار نمی‌تواند درخواست مالی ثبت کند. لطفاً از طریق سلامتیار یا پزشک اقدام کنید."
            )

        if request_type == "consultation":
            specialty_id = attrs.get("specialty")
            if specialty_id:
                attrs["specialty"] = resolve_lookup(
                    Specialty, specialty_id, field_name="specialty"
                )
            else:
                attrs["specialty"] = None
        elif request_type == "financial":
            if not attrs.get("amount_needed"):
                raise serializers.ValidationError({"amount_needed": "مبلغ مورد نیاز الزامی است."})
            if user.role == "patient":
                pass  # already rejected above
            else:
                recipient_id = attrs.get("fund_recipient_user_id")
                if recipient_id:
                    allowed_ids = {u.pk for u in fund_recipient_options(user)}
                    if recipient_id not in allowed_ids:
                        raise serializers.ValidationError(
                            {"fund_recipient_user_id": "گیرنده وجه انتخاب‌شده مجاز نیست."}
                        )
                    try:
                        attrs["fund_recipient"] = CustomUser.objects.get(pk=recipient_id)
                    except CustomUser.DoesNotExist:
                        raise serializers.ValidationError(
                            {"fund_recipient_user_id": "کاربر یافت نشد."}
                        )
                else:
                    attrs["fund_recipient"] = user
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
        elif user.role == "doctor":
            if not patient_id:
                raise serializers.ValidationError({"patient_id": "انتخاب بیمار الزامی است."})
            try:
                patient = Patient.objects.get(pk=patient_id)
            except Patient.DoesNotExist:
                raise serializers.ValidationError({"patient_id": "بیمار یافت نشد."})
            # Doctor can create requests for patients introduced by cooperating HAs
            doctor = user.doctor_profile
            if not patient.introducer:
                raise serializers.ValidationError({"patient_id": "این بیمار سلامتیار معرف ندارد."})
            if patient.introducer_id not in doctor.cooperating_health_assistants.values_list("pk", flat=True):
                # Allow if doctor has no cooperating HAs (cooperates with all)
                if not doctor.cooperates_with_all_health_assistants():
                    raise serializers.ValidationError({"patient_id": "این بیمار تحت پوشش شما نیست."})
            attrs["patient"] = patient
        else:
            raise serializers.ValidationError("نقش کاربر مجاز به ثبت درخواست نیست.")

        return attrs

    def create(self, validated):
        user = self.context["request"].user
        specialty = validated.pop("specialty", None)
        validated.pop("patient_id", None)
        validated.pop("fund_recipient_user_id", None)
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
    action = serializers.ChoiceField(
        choices=[
            "accept",
            "reject",
            "start",
            "complete",
            "cancel",
            "request_funding",
            "schedule",
            "confirm",
        ]
    )
    note = serializers.CharField(required=False, allow_blank=True, default="")
    amount_needed = serializers.DecimalField(
        max_digits=12, decimal_places=0, required=False, allow_null=True
    )
    appointment_date = serializers.CharField(required=False, allow_blank=True, default="")
    appointment_time = serializers.CharField(required=False, allow_blank=True, default="")
    appointment_place = serializers.CharField(required=False, allow_blank=True, default="")
    appointment_phone = serializers.CharField(required=False, allow_blank=True, default="")
    confirmation_message = serializers.CharField(required=False, allow_blank=True, default="")


class PatientWorkflowRequestSerializer(serializers.ModelSerializer):
    request_type_label = serializers.CharField(source="get_request_type_display", read_only=True)
    status_label = serializers.CharField(source="get_status_display", read_only=True)
    handled_by_name = serializers.SerializerMethodField()

    class Meta:
        model = NetworkRequest
        fields = [
            "id",
            "request_type",
            "request_type_label",
            "subject",
            "description",
            "status",
            "status_label",
            "amount_needed",
            "collected_amount",
            "appointment_date",
            "appointment_time",
            "appointment_place",
            "appointment_phone",
            "confirmation_message",
            "handled_by_name",
            "created_at",
            "updated_at",
        ]

    def get_handled_by_name(self, obj):
        if not obj.handled_by:
            return ""
        return obj.handled_by.username
