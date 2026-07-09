from rest_framework import serializers

from ..models import BenefactorDonation, DonationHold, GatewayPayment, Wallet, WalletTransaction


class WalletTransactionSerializer(serializers.ModelSerializer):
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
            "created_at",
        ]


class WalletSummarySerializer(serializers.Serializer):
    balance = serializers.DecimalField(max_digits=14, decimal_places=0)
    held_balance = serializers.DecimalField(max_digits=14, decimal_places=0, required=False)
    currency = serializers.CharField()
    payment_mode = serializers.CharField(required=False)
    recent_transactions = WalletTransactionSerializer(many=True)


class TopUpSerializer(serializers.Serializer):
    amount = serializers.DecimalField(max_digits=14, decimal_places=0, min_value=1)


class DonateSerializer(serializers.Serializer):
    amount = serializers.DecimalField(max_digits=14, decimal_places=0, min_value=1)
    destination_type = serializers.ChoiceField(
        choices=["campaign", "request", "general"]
    )
    campaign_id = serializers.IntegerField(required=False, allow_null=True)
    network_request_id = serializers.IntegerField(required=False, allow_null=True)
    title = serializers.CharField(required=False, allow_blank=True, default="")
    description = serializers.CharField(required=False, allow_blank=True, default="")


class DonationListSerializer(serializers.ModelSerializer):
    campaign_title = serializers.SerializerMethodField()
    patient_label = serializers.SerializerMethodField()
    date = serializers.SerializerMethodField()
    status_label = serializers.SerializerMethodField()

    class Meta:
        model = BenefactorDonation
        fields = [
            "id",
            "donation_type",
            "amount",
            "title",
            "description",
            "campaign",
            "campaign_title",
            "patient",
            "patient_label",
            "destination_type",
            "payment_source",
            "network_request",
            "date",
            "status",
            "status_label",
        ]

    def get_campaign_title(self, obj):
        if obj.campaign_fk_id:
            return obj.campaign_fk.title
        return obj.campaign

    def get_patient_label(self, obj):
        if obj.patient_id:
            return f"{obj.patient.first_name} {obj.patient.last_name}".strip()
        return obj.patient_name

    def get_date(self, obj):
        return obj.created_at.strftime("%Y/%m/%d")

    def get_status_label(self, obj):
        return obj.get_status_display()


class GatewayPaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = GatewayPayment
        fields = [
            "id",
            "amount",
            "status",
            "authority",
            "ref_id",
            "gateway",
            "verified_at",
            "created_at",
        ]


class AdminWalletSerializer(serializers.ModelSerializer):
    owner_username = serializers.CharField(source="owner_user.username", read_only=True)
    owner_role = serializers.CharField(source="owner_user.role", read_only=True)

    class Meta:
        model = Wallet
        fields = [
            "id",
            "owner_username",
            "owner_role",
            "wallet_type",
            "cached_balance",
            "held_balance",
            "currency",
            "is_active",
        ]


class AdminWalletAdjustSerializer(serializers.Serializer):
    phone_number = serializers.CharField()
    direction = serializers.ChoiceField(choices=["credit", "debit"])
    amount = serializers.DecimalField(max_digits=14, decimal_places=0, min_value=1)
    reason = serializers.CharField(required=False, allow_blank=True, default="")

    def validate_phone_number(self, value):
        from ..utils import normalize_phone

        phone = normalize_phone(value)
        if not phone:
            raise serializers.ValidationError("شماره موبایل الزامی است.")
        if not phone.startswith("09") or len(phone) != 11:
            raise serializers.ValidationError("شماره موبایل معتبر نیست.")
        return phone


class DonationHoldSerializer(serializers.ModelSerializer):
    benefactor_name = serializers.SerializerMethodField()
    request_subject = serializers.SerializerMethodField()
    patient_name = serializers.SerializerMethodField()
    request_id = serializers.IntegerField(source="network_request_id", read_only=True)

    class Meta:
        model = DonationHold
        fields = [
            "id",
            "benefactor",
            "benefactor_name",
            "request_id",
            "request_subject",
            "patient_name",
            "amount",
            "status",
            "created_at",
            "closed_at",
        ]

    def get_benefactor_name(self, obj):
        return obj.benefactor.username if obj.benefactor else ""

    def get_request_subject(self, obj):
        return obj.network_request.subject if obj.network_request else ""

    def get_patient_name(self, obj):
        if not obj.network_request:
            return ""
        p = obj.network_request.patient
        return f"{p.first_name} {p.last_name}".strip()
