from django.db.models import Q

from .models import (
    AdminProfile,
    Benefactor,
    CustomUser,
    Doctor,
    HealthAssistant,
    IndividualHealthAssistant,
    OrganizationApplication,
    OrganizationHealthAssistant,
    Patient,
)


def filter_admin_users(request):
    qs = CustomUser.objects.all().order_by("-date_joined")

    role = request.query_params.get("role")
    state = request.query_params.get("state")
    is_active = request.query_params.get("is_active")
    search = request.query_params.get("search", "").strip()
    phone = request.query_params.get("phone", "").strip()
    national_code = request.query_params.get("national_code", "").strip()
    patient_code = request.query_params.get("patient_code", "").strip()
    date_from = request.query_params.get("date_from", "").strip()
    date_to = request.query_params.get("date_to", "").strip()
    province = request.query_params.get("province", "").strip()
    city = request.query_params.get("city", "").strip()
    org_type = request.query_params.get("org_type", "").strip()
    org_subtype = request.query_params.get("org_subtype", "").strip()
    org_role = request.query_params.get("org_role", "").strip()
    description = request.query_params.get("description", "").strip()

    if role:
        qs = qs.filter(role=role)
    if state == "pending":
        qs = qs.filter(state=False)
    elif state == "approved":
        qs = qs.filter(state=True)
    if is_active == "true":
        qs = qs.filter(is_active=True)
    elif is_active == "false":
        qs = qs.filter(is_active=False)
    if date_from:
        qs = qs.filter(date_joined__date__gte=date_from)
    if date_to:
        qs = qs.filter(date_joined__date__lte=date_to)

    if search:
        qs = qs.filter(
            Q(username__icontains=search)
            | Q(email__icontains=search)
            | Q(first_name__icontains=search)
            | Q(last_name__icontains=search)
            | Q(patient_profile__first_name__icontains=search)
            | Q(patient_profile__last_name__icontains=search)
            | Q(patient_profile__phone_number__icontains=search)
            | Q(patient_profile__patient_code__icontains=search)
            | Q(patient_profile__national_code__icontains=search)
            | Q(doctor_profile__first_name__icontains=search)
            | Q(doctor_profile__last_name__icontains=search)
            | Q(doctor_profile__phone_number__icontains=search)
            | Q(doctor_profile__national_code__icontains=search)
            | Q(benefactor_profile__first_name__icontains=search)
            | Q(benefactor_profile__last_name__icontains=search)
            | Q(benefactor_profile__phone_number__icontains=search)
            | Q(benefactor_profile__national_code__icontains=search)
            | Q(health_assistant_profile__individual_profile__first_name__icontains=search)
            | Q(health_assistant_profile__individual_profile__last_name__icontains=search)
            | Q(health_assistant_profile__individual_profile__phone_number__icontains=search)
            | Q(health_assistant_profile__organization_profile__name__icontains=search)
            | Q(
                health_assistant_profile__organization_profile__director_phone_number__icontains=search
            )
            | Q(admin_profile__first_name__icontains=search)
            | Q(admin_profile__last_name__icontains=search)
            | Q(admin_profile__phone_number__icontains=search)
        ).distinct()

    if phone:
        qs = qs.filter(
            Q(username__icontains=phone)
            | Q(patient_profile__phone_number__icontains=phone)
            | Q(doctor_profile__phone_number__icontains=phone)
            | Q(benefactor_profile__phone_number__icontains=phone)
            | Q(health_assistant_profile__individual_profile__phone_number__icontains=phone)
            | Q(
                health_assistant_profile__organization_profile__director_phone_number__icontains=phone
            )
            | Q(admin_profile__phone_number__icontains=phone)
        ).distinct()

    if national_code:
        qs = qs.filter(
            Q(patient_profile__national_code__icontains=national_code)
            | Q(doctor_profile__national_code__icontains=national_code)
            | Q(benefactor_profile__national_code__icontains=national_code)
            | Q(health_assistant_profile__individual_profile__national_code__icontains=national_code)
        ).distinct()

    if patient_code:
        qs = qs.filter(patient_profile__patient_code__icontains=patient_code)

    if province:
        qs = qs.filter(
            Q(patient_profile__province__icontains=province)
            | Q(doctor_profile__province__icontains=province)
            | Q(benefactor_profile__province__icontains=province)
            | Q(health_assistant_profile__individual_profile__province__icontains=province)
            | Q(health_assistant_profile__organization_profile__province__icontains=province)
            | Q(organization_application__province__icontains=province)
        ).distinct()

    if city:
        qs = qs.filter(
            Q(patient_profile__city__icontains=city)
            | Q(doctor_profile__city__icontains=city)
            | Q(benefactor_profile__city__icontains=city)
            | Q(health_assistant_profile__individual_profile__city__icontains=city)
            | Q(health_assistant_profile__organization_profile__city__icontains=city)
            | Q(organization_application__city__icontains=city)
        ).distinct()

    if org_type:
        qs = qs.filter(
            Q(health_assistant_profile__organization_profile__organization_type__name__icontains=org_type)
            | Q(organization_application__org_type__icontains=org_type)
        ).distinct()

    if org_subtype:
        qs = qs.filter(
            organization_application__org_subtype__icontains=org_subtype
        ).distinct()

    if org_role:
        qs = qs.filter(organization_application__organization_role=org_role)

    if description:
        qs = qs.filter(network_description_q(description)).distinct()

    return qs


def network_description_q(term: str) -> Q:
    """Match the «توضیحات عضو شبکه» concept across every profile type.

    There is no single such column: a health assistant describes their cooperation,
    a patient lists skills and illness, and organizations keep everything (sharable
    facilities, specialisation, target community) inside the signup JSON payload.
    """
    return (
        Q(health_assistant_profile__cooperation_description__icontains=term)
        | Q(health_assistant_profile__cooperation_type__name__icontains=term)
        | Q(patient_profile__sickness_description__icontains=term)
        | Q(patient_profile__skill__icontains=term)
        | Q(doctor_profile__specialty__name__icontains=term)
        | Q(organization_application__payload__icontains=term)
        | Q(organization_application__org_type__icontains=term)
        | Q(organization_application__org_subtype__icontains=term)
        | Q(organization_application__name__icontains=term)
    )


def user_profile_phone(user):
    role = user.role
    try:
        if role == "admin":
            return user.admin_profile.phone_number
        if role == "patient":
            return user.patient_profile.phone_number
        if role == "doctor":
            return user.doctor_profile.phone_number
        if role == "benefactor":
            return user.benefactor_profile.phone_number
        if role == "health_assistant":
            ha = user.health_assistant_profile
            try:
                return ha.individual_profile.phone_number
            except IndividualHealthAssistant.DoesNotExist:
                return ha.organization_profile.director_phone_number
    except (
        AdminProfile.DoesNotExist,
        Patient.DoesNotExist,
        Doctor.DoesNotExist,
        Benefactor.DoesNotExist,
        HealthAssistant.DoesNotExist,
        OrganizationHealthAssistant.DoesNotExist,
    ):
        pass
    return user.username
