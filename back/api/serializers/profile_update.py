from rest_framework import serializers

from ..models import (
    Benefactor,
    Doctor,
    HealthAssistant,
    IndividualHealthAssistant,
    OrganizationHealthAssistant,
    Patient,
)


class PatientProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Patient
        fields = [
            "phone_number",
            "landline_number",
            "province",
            "city",
            "address",
            "bank_card_number",
            "sickness_description",
            "contact1_full_name",
            "contact1_phone_number",
            "contact2_full_name",
            "contact2_phone_number",
        ]


class DoctorProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Doctor
        fields = ["phone_number", "province", "city", "address"]


class BenefactorProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Benefactor
        fields = ["phone_number"]


class IndividualHealthAssistantProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = IndividualHealthAssistant
        fields = ["phone_number", "job", "province", "city", "home_address", "work_address"]


class OrganizationHealthAssistantProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrganizationHealthAssistant
        fields = [
            "director_phone_number",
            "director_landline_number",
            "province",
            "city",
            "address",
            "social_unit_head_phone_number",
            "social_unit_head_landline_number",
        ]
