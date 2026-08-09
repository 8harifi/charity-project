from django.db.models import Q
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status

from .. import messages as msg
from ..models import (
    Benefactor,
    Doctor,
    HealthAssistant,
    OrganizationApplication,
    Patient,
)
from ..serializers import DoctorSerializer, PatientSerializer
from ..serializers.admin import health_assistant_permissions


class GlobalSearchView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        query = request.query_params.get("q", "").strip()
        if not query:
            return Response({"error": msg.QUERY_REQUIRED}, status=status.HTTP_400_BAD_REQUEST)

        role_filter = request.query_params.get("role", "").strip()
        province = request.query_params.get("province", "").strip()
        city = request.query_params.get("city", "").strip()
        org_type = request.query_params.get("org_type", "").strip()
        description = request.query_params.get("description", "").strip()

        user = request.user
        perms = {}
        if user.role == "health_assistant":
            try:
                perms = health_assistant_permissions(user.health_assistant_profile)
            except Exception:
                perms = {}
        elif user.role == "admin" or getattr(user, "is_staff", False):
            perms = {
                "can_search_patients": True,
                "can_search_doctors": True,
                "can_search_assistants": True,
                "can_search_benefactors": True,
                "can_search_organizations": True,
            }
        else:
            # Other authenticated roles get a read-only people search.
            perms = {
                "can_search_patients": True,
                "can_search_doctors": True,
                "can_search_assistants": True,
                "can_search_benefactors": False,
                "can_search_organizations": False,
            }

        patients = Patient.objects.all()
        doctors = Doctor.objects.all()
        health_assistants = HealthAssistant.objects.all()
        benefactors = Benefactor.objects.all()
        organizations = OrganizationApplication.objects.all()

        if province:
            patients = patients.filter(province__icontains=province)
            doctors = doctors.filter(province__icontains=province)
            health_assistants = health_assistants.filter(
                Q(individual_profile__province__icontains=province)
                | Q(organization_profile__province__icontains=province)
            )
            benefactors = benefactors.filter(province__icontains=province)
            organizations = organizations.filter(province__icontains=province)

        if city:
            patients = patients.filter(city__icontains=city)
            doctors = doctors.filter(city__icontains=city)
            health_assistants = health_assistants.filter(
                Q(individual_profile__city__icontains=city)
                | Q(organization_profile__city__icontains=city)
            )
            benefactors = benefactors.filter(city__icontains=city)
            organizations = organizations.filter(city__icontains=city)

        if description:
            patients = patients.filter(
                Q(sickness_description__icontains=description)
                | Q(skill__icontains=description)
            )
            health_assistants = health_assistants.filter(
                cooperation_description__icontains=description
            )
            organizations = organizations.filter(
                Q(payload__icontains=description)
                | Q(org_type__icontains=description)
                | Q(org_subtype__icontains=description)
                | Q(name__icontains=description)
            )

        if org_type:
            health_assistants = health_assistants.filter(
                organization_profile__organization_type__name__icontains=org_type
            )
            organizations = organizations.filter(
                Q(org_type__icontains=org_type) | Q(org_subtype__icontains=org_type)
            )

        response = {}

        want_patients = (not role_filter or role_filter == "patient") and perms.get(
            "can_search_patients", False
        )
        want_doctors = (not role_filter or role_filter == "doctor") and perms.get(
            "can_search_doctors", False
        )
        want_ha = (not role_filter or role_filter == "health_assistant") and perms.get(
            "can_search_assistants", False
        )
        want_benefactors = (not role_filter or role_filter == "benefactor") and perms.get(
            "can_search_benefactors", False
        )
        want_orgs = (not role_filter or role_filter == "organization") and perms.get(
            "can_search_organizations", False
        )

        if want_patients:
            patient_results = patients.filter(
                Q(first_name__icontains=query)
                | Q(last_name__icontains=query)
                | Q(national_code__icontains=query)
                | Q(phone_number__icontains=query)
                | Q(patient_code__icontains=query)
            )[:30]
            response["patients"] = PatientSerializer(patient_results, many=True).data

        if want_doctors:
            doctor_results = doctors.filter(
                Q(first_name__icontains=query)
                | Q(last_name__icontains=query)
                | Q(national_code__icontains=query)
                | Q(medical_system_code__icontains=query)
                | Q(phone_number__icontains=query)
            )[:30]
            response["doctors"] = DoctorSerializer(doctor_results, many=True).data

        if want_ha:
            ha_results = []
            for ha in health_assistants.filter(
                Q(individual_profile__first_name__icontains=query)
                | Q(individual_profile__last_name__icontains=query)
                | Q(organization_profile__name__icontains=query)
                | Q(health_assistance_code__icontains=query)
                | Q(cooperation_description__icontains=query)
            )[:30]:
                name = ""
                if getattr(ha, "individual_profile", None):
                    ind = ha.individual_profile
                    name = f"{ind.first_name} {ind.last_name}".strip()
                elif getattr(ha, "organization_profile", None):
                    name = ha.organization_profile.name
                ha_results.append(
                    {
                        "id": ha.pk,
                        "code": ha.health_assistance_code,
                        "name": name,
                        "type": "health_assistant",
                        "description": ha.cooperation_description or "",
                    }
                )
            response["health_assistants"] = ha_results

        if want_benefactors:
            benefactor_results = []
            for b in benefactors.filter(
                Q(first_name__icontains=query)
                | Q(last_name__icontains=query)
                | Q(national_code__icontains=query)
                | Q(phone_number__icontains=query)
            )[:30]:
                benefactor_results.append(
                    {
                        "id": b.pk,
                        "name": f"{b.first_name} {b.last_name}".strip(),
                        "type": "benefactor",
                        "province": b.province,
                        "city": b.city,
                    }
                )
            response["benefactors"] = benefactor_results

        if want_orgs:
            org_results = []
            for o in organizations.filter(
                Q(name__icontains=query)
                | Q(org_type__icontains=query)
                | Q(org_subtype__icontains=query)
                | Q(payload__icontains=query)
            )[:30]:
                org_results.append(
                    {
                        "id": o.pk,
                        "name": o.name or o.user.username,
                        "org_type": o.org_type,
                        "org_subtype": o.org_subtype,
                        "organization_role": o.organization_role,
                        "province": o.province,
                        "city": o.city,
                        "type": "organization",
                    }
                )
            response["organizations"] = org_results

        response["permissions"] = {
            "can_search_patients": bool(perms.get("can_search_patients")),
            "can_search_doctors": bool(perms.get("can_search_doctors")),
            "can_search_assistants": bool(perms.get("can_search_assistants")),
            "can_search_benefactors": bool(perms.get("can_search_benefactors")),
            "can_search_organizations": bool(perms.get("can_search_organizations")),
        }
        return Response(response, status=status.HTTP_200_OK)
