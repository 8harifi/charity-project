from rest_framework import serializers

from ..models import (
    AdminProfile,
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
            "sickness_description",
            "skill",
            "family_status",
            "financial_level",
            "contact1_full_name",
            "contact1_phone_number",
            "contact2_full_name",
            "contact2_phone_number",
        ]


class HealthAssistantPatientUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Patient
        fields = [
            "first_name",
            "last_name",
            "phone_number",
            "landline_number",
            "province",
            "city",
            "address",
            "sickness_description",
            "family_status",
            "financial_level",
            "contact1_full_name",
            "contact1_phone_number",
            "contact2_full_name",
            "contact2_phone_number",
        ]


class DoctorProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Doctor
        fields = [
            "first_name",
            "last_name",
            "father_name",
            "phone_number",
            "province",
            "city",
            "address",
        ]


class BenefactorProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Benefactor
        fields = [
            "first_name",
            "last_name",
            "gender",
            "national_code",
            "phone_number",
            "province",
            "city",
        ]


class IndividualHealthAssistantProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = IndividualHealthAssistant
        fields = [
            "first_name",
            "last_name",
            "phone_number",
            "job",
            "province",
            "city",
            "home_address",
            "work_address",
        ]


class OrganizationHealthAssistantProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrganizationHealthAssistant
        fields = [
            "name",
            "director_first_name",
            "director_last_name",
            "director_phone_number",
            "director_landline_number",
            "province",
            "city",
            "address",
            "social_unit_head_first_name",
            "social_unit_head_last_name",
            "social_unit_head_phone_number",
            "social_unit_head_landline_number",
        ]


class AdminProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdminProfile
        fields = ["first_name", "last_name", "phone_number"]
