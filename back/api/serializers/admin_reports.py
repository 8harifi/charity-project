from datetime import datetime

from django.utils import timezone
from rest_framework import serializers

from ..models import (
    BenefactorDonation,
    CustomUser,
    DonationHold,
    GatewayPayment,
    NetworkRequest,
    OrganizationApplication,
    Patient,
    PlatformAuditLog,
    RequestStatusLog,
    StaffRequest,
    WalletTransaction,
)


STATUS_LABELS_FA = {
    "pending": "در انتظار",
    "accepted": "پذیرفته‌شده",
    "rejected": "رد‌شده",
    "in_progress": "در حال انجام",
    "completed": "تکمیل‌شده",
    "cancelled": "لغوشده",
    "held": "در تعهد",
    "released": "آزادشده",
    "refunded": "بازگشت‌داده‌شده",
    "verified": "تأییدشده",
    "failed": "ناموفق",
    "created": "ایجادشده",
}


def _actor_label(user):
    if not user:
        return "سیستم"
    if user.role == "patient":
        try:
            p = user.patient_profile
            return f"{p.first_name} {p.last_name}".strip() or user.username
        except Patient.DoesNotExist:
            pass
    return user.username or str(user.pk)


class AdminReportTransactionSerializer(serializers.ModelSerializer):
    wallet_owner = serializers.SerializerMethodField()
    wallet_type = serializers.CharField(source="wallet.wallet_type", read_only=True)
    created_by_username = serializers.SerializerMethodField()

    class Meta:
        model = WalletTransaction
        fields = [
            "id",
            "entry_type",
            "amount",
            "kind",
            "reference_type",
            "reference_id",
            "description",
            "wallet_owner",
            "wallet_type",
            "created_by_username",
            "created_at",
        ]

    def get_wallet_owner(self, obj):
        w = obj.wallet
        if w.owner_user_id:
            return w.owner_user.username
        if w.owner_patient_id:
            p = w.owner_patient
            return f"{p.first_name} {p.last_name} ({p.patient_code})"
        return f"wallet#{w.pk}"

    def get_created_by_username(self, obj):
        return obj.created_by.username if obj.created_by_id else ""


class AdminReportGatewayPaymentSerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source="user.username", read_only=True)
    user_role = serializers.CharField(source="user.role", read_only=True)

    class Meta:
        model = GatewayPayment
        fields = [
            "id",
            "user_username",
            "user_role",
            "amount",
            "status",
            "authority",
            "ref_id",
            "gateway",
            "verified_at",
            "created_at",
        ]


class AdminReportDonationSerializer(serializers.ModelSerializer):
    benefactor_username = serializers.CharField(source="benefactor.username", read_only=True)
    patient_label = serializers.SerializerMethodField()
    campaign_title = serializers.SerializerMethodField()

    class Meta:
        model = BenefactorDonation
        fields = [
            "id",
            "benefactor_username",
            "donation_type",
            "amount",
            "title",
            "description",
            "destination_type",
            "payment_source",
            "status",
            "patient_label",
            "campaign_title",
            "network_request",
            "created_at",
        ]

    def get_patient_label(self, obj):
        if obj.patient_id:
            return f"{obj.patient.first_name} {obj.patient.last_name}"
        return obj.patient_name or ""

    def get_campaign_title(self, obj):
        if obj.campaign_fk_id:
            return obj.campaign_fk.title
        return obj.campaign or ""


class AdminReportPledgeSerializer(serializers.ModelSerializer):
    benefactor_username = serializers.CharField(source="benefactor.username", read_only=True)
    request_subject = serializers.CharField(source="network_request.subject", read_only=True)
    patient_label = serializers.SerializerMethodField()
    closed_by_username = serializers.SerializerMethodField()

    class Meta:
        model = DonationHold
        fields = [
            "id",
            "benefactor_username",
            "request_subject",
            "patient_label",
            "amount",
            "status",
            "closed_by_username",
            "created_at",
            "closed_at",
        ]

    def get_patient_label(self, obj):
        p = obj.network_request.patient
        if p:
            return f"{p.first_name} {p.last_name}"
        return ""

    def get_closed_by_username(self, obj):
        return obj.closed_by.username if obj.closed_by_id else ""


class AdminReportWorkflowSerializer(serializers.ModelSerializer):
    request_id = serializers.IntegerField(source="request_id", read_only=True)
    request_subject = serializers.CharField(source="request.subject", read_only=True)
    request_type = serializers.CharField(source="request.request_type", read_only=True)
    patient_label = serializers.SerializerMethodField()
    actor_label = serializers.SerializerMethodField()
    actor_role = serializers.SerializerMethodField()
    status_label = serializers.SerializerMethodField()

    class Meta:
        model = RequestStatusLog
        fields = [
            "id",
            "request_id",
            "request_subject",
            "request_type",
            "patient_label",
            "status",
            "status_label",
            "note",
            "actor_label",
            "actor_role",
            "created_at",
        ]

    def get_patient_label(self, obj):
        p = obj.request.patient
        if p:
            return f"{p.first_name} {p.last_name} ({p.patient_code})"
        return ""

    def get_actor_label(self, obj):
        return _actor_label(obj.actor)

    def get_actor_role(self, obj):
        return obj.actor.role if obj.actor_id else ""

    def get_status_label(self, obj):
        return STATUS_LABELS_FA.get(obj.status, obj.status)


class AdminReportRequestSerializer(serializers.ModelSerializer):
    patient_label = serializers.SerializerMethodField()
    created_by_username = serializers.CharField(source="created_by.username", read_only=True)
    created_by_role = serializers.CharField(source="created_by.role", read_only=True)
    status_label = serializers.SerializerMethodField()

    class Meta:
        model = NetworkRequest
        fields = [
            "id",
            "request_type",
            "subject",
            "description",
            "status",
            "status_label",
            "patient_label",
            "created_by_username",
            "created_by_role",
            "amount_needed",
            "collected_amount",
            "province",
            "created_at",
            "updated_at",
        ]

    def get_patient_label(self, obj):
        if obj.patient_id:
            return f"{obj.patient.first_name} {obj.patient.last_name}"
        return ""

    def get_status_label(self, obj):
        return STATUS_LABELS_FA.get(obj.status, obj.status)


class AdminReportRegistrationSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    username = serializers.CharField()
    role = serializers.CharField()
    state = serializers.BooleanField()
    is_active = serializers.BooleanField()
    date_joined = serializers.DateTimeField()
    display_name = serializers.CharField()
    province = serializers.CharField()
    city = serializers.CharField()
    admin_approved = serializers.BooleanField(allow_null=True)
    ha_approved = serializers.BooleanField(allow_null=True)
    introducer_label = serializers.CharField()


class AdminReportStaffRequestSerializer(serializers.ModelSerializer):
    doctor_username = serializers.CharField(source="created_by.username", read_only=True)
    health_assistant_label = serializers.SerializerMethodField()
    patient_label = serializers.SerializerMethodField()
    status_label = serializers.SerializerMethodField()

    class Meta:
        model = StaffRequest
        fields = [
            "id",
            "doctor_username",
            "health_assistant_label",
            "patient_label",
            "doctor_name",
            "subject",
            "description",
            "amount_needed",
            "status",
            "status_label",
            "created_at",
            "updated_at",
        ]

    def get_health_assistant_label(self, obj):
        ha = obj.health_assistant
        if getattr(ha, "individual_profile", None):
            ind = ha.individual_profile
            return f"{ind.first_name} {ind.last_name}".strip()
        if getattr(ha, "organization_profile", None):
            return ha.organization_profile.name
        return ha.health_assistance_code

    def get_patient_label(self, obj):
        if obj.patient_id:
            return f"{obj.patient.first_name} {obj.patient.last_name}"
        return ""

    def get_status_label(self, obj):
        return dict(StaffRequest.STATUS_CHOICES).get(obj.status, obj.status)


class AdminReportOrgApplicationSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)
    organization_role_label = serializers.SerializerMethodField()

    class Meta:
        model = OrganizationApplication
        fields = [
            "id",
            "username",
            "organization_role",
            "organization_role_label",
            "org_type",
            "org_subtype",
            "name",
            "province",
            "city",
            "created_at",
        ]

    def get_organization_role_label(self, obj):
        return dict(OrganizationApplication.ORGANIZATION_ROLES).get(
            obj.organization_role, obj.organization_role
        )


class AdminReportAuditSerializer(serializers.ModelSerializer):
    actor_label = serializers.SerializerMethodField()
    event_type_label = serializers.SerializerMethodField()

    class Meta:
        model = PlatformAuditLog
        fields = [
            "id",
            "event_type",
            "event_type_label",
            "actor_label",
            "target_type",
            "target_id",
            "summary",
            "metadata",
            "created_at",
        ]

    def get_actor_label(self, obj):
        return _actor_label(obj.actor)

    def get_event_type_label(self, obj):
        return dict(PlatformAuditLog.EVENT_TYPES).get(obj.event_type, obj.event_type)
