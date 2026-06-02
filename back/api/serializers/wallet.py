from rest_framework import serializers

from ..models import BenefactorDonation, GatewayPayment, PatientDisbursement, WalletTransaction


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
    currency = serializers.CharField()
    payment_mode = serializers.CharField(required=False)
    recent_transactions = WalletTransactionSerializer(many=True)


class TopUpSerializer(serializers.Serializer):
    amount = serializers.DecimalField(max_digits=14, decimal_places=0, min_value=1)


class DonateSerializer(serializers.Serializer):
    amount = serializers.DecimalField(max_digits=14, decimal_places=0, min_value=1)
    destination_type = serializers.ChoiceField(
        choices=["campaign", "patient", "request", "general"]
    )
    campaign_id = serializers.IntegerField(required=False, allow_null=True)
    patient_id = serializers.IntegerField(required=False, allow_null=True)
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


class PatientDisbursementSerializer(serializers.ModelSerializer):
    class Meta:
        model = PatientDisbursement
        fields = [
            "id",
            "amount",
            "payee_description",
            "status",
            "network_request",
            "created_at",
        ]


class CreateDisbursementSerializer(serializers.Serializer):
    patient_id = serializers.IntegerField()
    amount = serializers.DecimalField(max_digits=14, decimal_places=0, min_value=1)
    network_request_id = serializers.IntegerField(required=False, allow_null=True)
    payee_description = serializers.CharField(required=False, allow_blank=True, default="")
