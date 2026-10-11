from django.db import models
from rest_framework import serializers

from ..models import CustomUser, NetworkRequest, Patient, RequestAttachment, RequestStatusLog, Specialty
from ..models.wallet import DonationHold
from ..utils import (
    creator_organization_name,
    ha_can_access_patient,
    ha_orphan_patients,
    ha_search_patients,
    mask_patient_name,
    request_type_domain,
    viewer_is_privacy_restricted,
)
from .lookup_utils import resolve_lookup
from .staff_requests import RequestAttachmentSerializer


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


def is_fully_funded(obj) -> bool:
    """A financial request whose target is met but which nobody has closed yet.

    Money is only released once the creator confirms delivery, so the row keeps the
    `in_progress` status. Benefactors read that as "not done", hence the distinction.
    """
    if obj.status not in ("pending", "accepted", "in_progress"):
        return False
    needed = obj.amount_needed or 0
    if needed <= 0:
        return False
    return (obj.collected_amount or 0) >= needed


def request_status_label(obj) -> str:
    if is_fully_funded(obj):
        return "تأمین مالی شد — در انتظار تسویه"
    return obj.get_status_display()


def creator_display_name(user) -> str:
    if user.role == "health_assistant":
        try:
            ha = user.health_assistant_profile
            if getattr(ha, "individual_profile", None):
                ind = ha.individual_profile
                return f"{ind.first_name} {ind.last_name}".strip()
            if getattr(ha, "organization_profile", None):
                return ha.organization_profile.name
        except Exception:
            pass
    elif user.role == "doctor":
        try:
            d = user.doctor_profile
            return f"{d.first_name} {d.last_name}".strip()
        except Exception:
            pass
    elif user.role == "patient":
        try:
            p = user.patient_profile
            return f"{p.first_name} {p.last_name}".strip()
        except Exception:
            pass
    return user.username


def creator_national_code(user) -> str:
    try:
        if user.role == "health_assistant":
            return user.health_assistant_profile.individual_profile.national_code or ""
        if user.role == "doctor":
            return user.doctor_profile.national_code or ""
        if user.role == "patient":
            return user.patient_profile.national_code or ""
    except Exception:
        return ""
    return ""


class NetworkRequestSerializer(serializers.ModelSerializer):
    patient_name = serializers.SerializerMethodField()
    patient_code = serializers.SerializerMethodField()
    specialty_name = serializers.SerializerMethodField()
    request_type_label = serializers.CharField(source="get_request_type_display", read_only=True)
    status_label = serializers.SerializerMethodField()
    is_fully_funded = serializers.SerializerMethodField()
    handled_by_name = serializers.SerializerMethodField()
    created_by_role = serializers.CharField(source="created_by.role", read_only=True)
    created_by_name = serializers.SerializerMethodField()
    created_by_national_code = serializers.SerializerMethodField()
    created_by_organization = serializers.SerializerMethodField()
    fund_recipient_name = serializers.SerializerMethodField()
    recipient_kind = serializers.CharField(read_only=True)
    recipient_role = serializers.CharField(read_only=True)
    recipient_role_label = serializers.SerializerMethodField()
    recipient_organization_name = serializers.SerializerMethodField()
    service_kind = serializers.CharField(read_only=True)
    service_kind_label = serializers.SerializerMethodField()
    referred_to_doctor_name = serializers.SerializerMethodField()
    is_read = serializers.SerializerMethodField()
    status_logs = RequestStatusLogSerializer(many=True, read_only=True)
    attachments = RequestAttachmentSerializer(many=True, read_only=True)
    request_subtype_label = serializers.SerializerMethodField()
    expense_category_label = serializers.SerializerMethodField()
    ha_approval_status_label = serializers.SerializerMethodField()
    illness_summary = serializers.SerializerMethodField()
    patient_public = serializers.SerializerMethodField()
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
            "created_by_name",
            "created_by_national_code",
            "created_by_organization",
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
            "request_subtype",
            "request_subtype_label",
            "expense_category",
            "expense_category_label",
            "doctor_name",
            "companion_male_count",
            "companion_female_count",
            "ha_approval_status",
            "ha_approval_status_label",
            "attachments",
            "status",
            "status_label",
            "is_fully_funded",
            "handled_by",
            "handled_by_name",
            "fund_recipient",
            "fund_recipient_name",
            "recipient_kind",
            "recipient_role",
            "recipient_role_label",
            "recipient_organization_name",
            "service_kind",
            "service_kind_label",
            "referred_to_doctor_name",
            "illness_summary",
            "patient_public",
            "is_read",
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

    def get_status_label(self, obj):
        return request_status_label(obj)

    def get_is_fully_funded(self, obj):
        return is_fully_funded(obj)

    def get_created_by_name(self, obj):
        return creator_display_name(obj.created_by)

    def get_created_by_national_code(self, obj):
        request = self.context.get("request")
        user = request.user if request else None
        if viewer_is_privacy_restricted(user):
            return ""
        return creator_national_code(obj.created_by)

    def get_created_by_organization(self, obj):
        return creator_organization_name(obj.created_by)

    def get_patient_name(self, obj):
        p = obj.patient
        if not p:
            return "نیازمندی منطقه"
        request = self.context.get("request")
        user = request.user if request else None
        if viewer_is_privacy_restricted(user):
            return mask_patient_name(p)
        return f"{p.first_name} {p.last_name}".strip()

    def get_patient_code(self, obj):
        request = self.context.get("request")
        user = request.user if request else None
        if viewer_is_privacy_restricted(user):
            return ""
        return obj.patient.patient_code if obj.patient_id else ""

    def get_illness_summary(self, obj):
        return obj.patient.sickness_description if obj.patient_id else ""

    def get_patient_public(self, obj):
        p = obj.patient
        if not p:
            return None
        request = self.context.get("request")
        user = request.user if request else None
        restricted = viewer_is_privacy_restricted(user)
        name = mask_patient_name(p) if restricted else f"{p.first_name} {p.last_name}".strip()
        return {
            "name": name,
            "disease": p.sickness_description or "",
            "age": p.age,
            "marital_status": getattr(p.marital_status, "name", "") or "",
            "residence": "، ".join([x for x in [p.province, p.city] if x]),
            "insurance": getattr(p.insurance, "name", "") or "",
            "covered_organization": getattr(p.covered_organization, "name", "") or "",
            "family_status": p.family_status or "",
            "financial_level": dict(p.FINANCIAL_LEVELS).get(p.financial_level, ""),
            "phone": "" if restricted else (p.phone_number or ""),
        }

    def get_recipient_role_label(self, obj):
        return dict(NetworkRequest.RECIPIENT_ROLES).get(obj.recipient_role, obj.recipient_role or "")

    def get_recipient_organization_name(self, obj):
        if not obj.recipient_organization_id:
            return ""
        return obj.recipient_organization.name or ""

    def get_service_kind_label(self, obj):
        return dict(NetworkRequest.SERVICE_KINDS).get(obj.service_kind, obj.service_kind or "")

    def get_referred_to_doctor_name(self, obj):
        if not obj.referred_to_doctor_id:
            return ""
        d = obj.referred_to_doctor
        return f"{d.first_name} {d.last_name}".strip()

    def get_is_read(self, obj):
        request = self.context.get("request")
        user = request.user if request else None
        if not user or not user.is_authenticated:
            return False
        receipts = getattr(obj, "_prefetched_read_receipts", None)
        if receipts is not None:
            return any(r.user_id == user.pk for r in receipts)
        from ..models import RequestReadReceipt

        return RequestReadReceipt.objects.filter(request=obj, user=user).exists()

    def get_request_subtype_label(self, obj):
        labels = dict(NetworkRequest.REQUEST_SUBTYPES)
        return labels.get(obj.request_subtype, obj.request_subtype)

    def get_expense_category_label(self, obj):
        labels = dict(NetworkRequest.EXPENSE_CATEGORIES)
        return labels.get(obj.expense_category, obj.expense_category)

    def get_ha_approval_status_label(self, obj):
        labels = dict(NetworkRequest.HA_APPROVAL_STATUSES)
        return labels.get(obj.ha_approval_status, obj.ha_approval_status)

    def get_specialty_name(self, obj):
        return obj.specialty.name if obj.specialty else ""

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
    request_type = serializers.ChoiceField(
        choices=["consultation", "financial", "service", "regional"]
    )
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
    recipient_kind = serializers.ChoiceField(
        choices=[c[0] for c in NetworkRequest.RECIPIENT_KINDS],
        required=False,
        allow_blank=True,
        default="",
    )
    recipient_role = serializers.ChoiceField(
        choices=[c[0] for c in NetworkRequest.RECIPIENT_ROLES],
        required=False,
        allow_blank=True,
        default="",
    )
    recipient_organization_id = serializers.IntegerField(required=False, allow_null=True)
    service_kind = serializers.ChoiceField(
        choices=[c[0] for c in NetworkRequest.SERVICE_KINDS],
        required=False,
        allow_blank=True,
        default="",
    )
    consultation_mode = serializers.ChoiceField(
        choices=["حضوری", "تلفنی"],
        required=False,
        allow_blank=True,
    )
    preferred_date = serializers.CharField(required=False, allow_blank=True, default="")
    preferred_time = serializers.CharField(required=False, allow_blank=True, default="")
    needed_service = serializers.CharField(required=False, allow_blank=True, default="")
    request_subtype = serializers.ChoiceField(
        choices=[c[0] for c in NetworkRequest.REQUEST_SUBTYPES],
        required=False,
        allow_blank=True,
        default="",
    )
    expense_category = serializers.ChoiceField(
        choices=[c[0] for c in NetworkRequest.EXPENSE_CATEGORIES],
        required=False,
        allow_blank=True,
        default="",
    )
    doctor_name = serializers.CharField(required=False, allow_blank=True, default="")
    companion_male_count = serializers.IntegerField(required=False, allow_null=True)
    companion_female_count = serializers.IntegerField(required=False, allow_null=True)

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
            kind = attrs.get("recipient_kind") or "user"
            attrs["recipient_kind"] = kind
            if kind == "organization":
                org_id = attrs.get("recipient_organization_id")
                if not org_id:
                    raise serializers.ValidationError(
                        {"recipient_organization_id": "انتخاب سازمان گیرنده الزامی است."}
                    )
                from ..models import OrganizationApplication

                try:
                    attrs["recipient_organization"] = OrganizationApplication.objects.get(pk=org_id)
                except OrganizationApplication.DoesNotExist:
                    raise serializers.ValidationError(
                        {"recipient_organization_id": "سازمان یافت نشد."}
                    )
            elif kind == "role" and not attrs.get("recipient_role"):
                raise serializers.ValidationError({"recipient_role": "نقش گیرنده را انتخاب کنید."})
        elif request_type == "service":
            if not attrs.get("needed_service") and not attrs.get("request_subtype") and not attrs.get("service_kind"):
                raise serializers.ValidationError({"needed_service": "نوع خدمت الزامی است."})
            if attrs.get("service_kind") == "network_consultation":
                attrs["recipient_kind"] = attrs.get("recipient_kind") or "role"
                attrs["recipient_role"] = "network_consultant"
        elif request_type == "regional":
            if not attrs.get("amount_needed"):
                raise serializers.ValidationError({"amount_needed": "مبلغ هدف کمپین الزامی است."})

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
            ha = user.health_assistant_profile
            if request_type == "regional":
                # Regional needs are about an area, not a specific patient.
                attrs["patient"] = None
                if patient_id:
                    try:
                        attrs["patient"] = Patient.objects.get(pk=patient_id)
                    except Patient.DoesNotExist:
                        raise serializers.ValidationError({"patient_id": "بیمار یافت نشد."})
            else:
                if not patient_id:
                    raise serializers.ValidationError({"patient_id": "انتخاب بیمار الزامی است."})
                try:
                    patient = Patient.objects.get(pk=patient_id)
                except Patient.DoesNotExist:
                    raise serializers.ValidationError({"patient_id": "بیمار یافت نشد."})
                domain = request_type_domain(request_type)
                if patient.introducer_id != ha.pk and not ha_can_access_patient(
                    ha, patient, action="edit", domain=domain
                ):
                    raise serializers.ValidationError(
                        {"patient_id": "این بیمار تحت پوشش شما نیست."}
                    )
                if request_type == "financial" and not ha.can_create_financial:
                    raise serializers.ValidationError("مجوز ثبت درخواست مالی ندارید.")
                if request_type == "consultation" and not ha.can_create_visits:
                    raise serializers.ValidationError("مجوز ثبت درخواست ویزیت ندارید.")
                if request_type == "service" and not ha.can_create_services:
                    raise serializers.ValidationError("مجوز ثبت درخواست خدمات ندارید.")
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
        from ..models import Campaign

        user = self.context["request"].user
        request_type = validated.get("request_type")
        specialty = validated.pop("specialty", None)
        validated.pop("patient_id", None)
        validated.pop("fund_recipient_user_id", None)
        validated.pop("recipient_organization_id", None)
        patient = validated.pop("patient", None)

        ha_approval_status = "not_required"
        initial_status = "pending"
        if user.role == "patient":
            ha_approval_status = "pending"
            initial_status = "pending"

        network_request = NetworkRequest.objects.create(
            patient=patient,
            created_by=user,
            specialty=specialty,
            status=initial_status,
            ha_approval_status=ha_approval_status,
            **validated,
        )
        RequestStatusLog.objects.create(
            request=network_request,
            status=initial_status,
            note="درخواست ثبت شد",
            actor=user,
        )

        if request_type == "regional":
            Campaign.objects.create(
                title=network_request.subject,
                description=network_request.description,
                target_amount=network_request.amount_needed or 0,
                category="تجهیزات",
                urgency="متوسط",
                is_published=True,
                created_by=user,
                source_request=network_request,
                audience="regional",
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
            "ha_approve",
            "ha_reject",
            "set_status",
            "refer_to_doctor",
        ]
    )
    note = serializers.CharField(required=False, allow_blank=True, default="")
    doctor_id = serializers.IntegerField(required=False, allow_null=True)
    doctor_name = serializers.CharField(required=False, allow_blank=True, default="")
    status = serializers.ChoiceField(
        choices=[c[0] for c in NetworkRequest.STATUS_CHOICES],
        required=False,
        allow_blank=True,
        default="",
    )
    amount_needed = serializers.DecimalField(
        max_digits=12, decimal_places=0, required=False, allow_null=True
    )
    appointment_date = serializers.CharField(required=False, allow_blank=True, default="")
    appointment_time = serializers.CharField(required=False, allow_blank=True, default="")
    appointment_place = serializers.CharField(required=False, allow_blank=True, default="")
    appointment_phone = serializers.CharField(required=False, allow_blank=True, default="")
    confirmation_message = serializers.CharField(required=False, allow_blank=True, default="")


class NetworkRequestEditSerializer(serializers.ModelSerializer):
    """Fields an admin or the original submitter may correct after the fact.

    Status, patient and creator stay out of it: status has its own audited endpoint
    and reassigning a request to a different patient would orphan its donations.
    """

    class Meta:
        model = NetworkRequest
        fields = [
            "subject",
            "description",
            "amount_needed",
            "specialty",
            "doctor_name",
            "needed_service",
            "request_subtype",
            "expense_category",
            "companion_male_count",
            "companion_female_count",
            "consultation_mode",
            "preferred_date",
            "preferred_time",
            "appointment_date",
            "appointment_time",
            "appointment_place",
            "appointment_phone",
            "confirmation_message",
        ]
        extra_kwargs = {field: {"required": False} for field in fields}

    def validate_amount_needed(self, value):
        if value is None:
            return value
        collected = self.instance.collected_amount or 0
        if value < collected:
            raise serializers.ValidationError(
                f"مبلغ مورد نیاز نمی‌تواند کمتر از مبلغ جمع‌آوری‌شده ({int(collected):,} تومان) باشد."
            )
        return value


class PatientWorkflowRequestSerializer(serializers.ModelSerializer):
    request_type_label = serializers.CharField(source="get_request_type_display", read_only=True)
    status_label = serializers.SerializerMethodField()
    is_fully_funded = serializers.SerializerMethodField()
    handled_by_name = serializers.SerializerMethodField()
    created_by_role = serializers.CharField(source="created_by.role", read_only=True)
    created_by_name = serializers.SerializerMethodField()
    created_by_national_code = serializers.SerializerMethodField()

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
            "is_fully_funded",
            "amount_needed",
            "collected_amount",
            "appointment_date",
            "appointment_time",
            "appointment_place",
            "appointment_phone",
            "confirmation_message",
            "handled_by_name",
            "created_by_role",
            "created_by_name",
            "created_by_national_code",
            "created_at",
            "updated_at",
        ]

    def get_status_label(self, obj):
        return request_status_label(obj)

    def get_is_fully_funded(self, obj):
        return is_fully_funded(obj)

    def get_handled_by_name(self, obj):
        if not obj.handled_by:
            return ""
        return obj.handled_by.username

    def get_created_by_name(self, obj):
        return creator_display_name(obj.created_by)

    def get_created_by_national_code(self, obj):
        return creator_national_code(obj.created_by)
