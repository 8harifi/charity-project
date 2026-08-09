import re

from django.apps import apps

_PERSIAN_DIGITS = str.maketrans("۰۱۲۳۴۵۶۷۸۹", "0123456789")


def normalize_phone(phone):
    """Normalize mobile to 09xxxxxxxxx for login identity."""
    if phone is None:
        return ""
    value = str(phone).strip().translate(_PERSIAN_DIGITS).replace(" ", "")
    return value


def _parse_patient_code_number(patient_code):
    if not patient_code:
        return None
    match = re.search(r"(\d+)$", patient_code)
    if match:
        return int(match.group(1))
    return None


def generate_patient_code():
    Patient = apps.get_model("api", "Patient")

    max_num = 0
    for code in Patient.objects.values_list("patient_code", flat=True):
        num = _parse_patient_code_number(code)
        if num is not None and num > max_num:
            max_num = num

    return f"PAT{max_num + 1:06d}"


def generate_health_assistance_code():
    HealthAssistant = apps.get_model("api", "HealthAssistant")
    last = HealthAssistant.objects.order_by("id").last()

    if not last or not last.health_assistance_code:
        return "HA00001"

    code = last.health_assistance_code.replace("HA", "")
    try:
        last_num = int(code)
    except ValueError:
        last_num = last.id

    return f"HA{last_num + 1:05d}"


def ha_city(ha) -> str:
    if getattr(ha, "individual_profile", None):
        return (ha.individual_profile.city or "").strip()
    if getattr(ha, "organization_profile", None):
        return (ha.organization_profile.city or "").strip()
    return ""


def ha_can_access_patient(ha, patient, action="view", domain=None) -> bool:
    """Whether a health assistant may act on a patient.

    Own caseload (introducer match) uses the base flags for registration
    approve/edit. The `*_all` permission flags widen a specific action
    (`approve` / `edit`) across every patient for a domain
    (`registration`, `visits`, `financial`, `services`).
    """
    if patient is None:
        return False
    if action == "view":
        return True
    if patient.introducer_id == ha.pk:
        if domain == "registration" and action == "approve":
            return bool(ha.can_approve_patients)
        if domain == "registration" and action == "edit":
            return bool(ha.can_edit_patients)
        return True
    if not domain:
        return False
    return bool(getattr(ha, f"can_{action}_{domain}_all", False))


def request_type_domain(request_type: str) -> str:
    """Map a NetworkRequest.request_type onto an HA permission domain."""
    return {
        "consultation": "visits",
        "financial": "financial",
        "service": "services",
        "regional": "services",
    }.get(request_type or "", "services")


def ha_orphan_patients(ha):
    from django.db.models import Q
    from .models import Patient

    city = ha_city(ha)
    qs = Patient.objects.filter(introducer__isnull=True)
    if city:
        qs = qs.filter(city__iexact=city)
    return qs.order_by("-created_at")


def ha_search_patients(ha, query: str):
    from django.db.models import Q
    from .models import Patient

    q = query.strip()
    if not q:
        return Patient.objects.none()
    return ha_browse_patients(ha, {"search": q})[:50]


def ha_browse_patients(ha, params: dict):
    """List patients for HA with scope and filter params."""
    from django.db.models import Q
    from .models import Patient

    scope = (params.get("scope") or "all").strip().lower()
    qs = Patient.objects.select_related("user", "introducer").order_by("-created_at")

    if scope == "mine":
        qs = qs.filter(introducer=ha)
    elif scope == "orphan":
        qs = qs.filter(introducer__isnull=True)
        city = ha_city(ha)
        if city:
            qs = qs.filter(city__iexact=city)
    elif scope == "others":
        qs = qs.exclude(introducer=ha)

    search = (params.get("search") or "").strip()
    if search:
        qs = qs.filter(
            Q(first_name__icontains=search)
            | Q(last_name__icontains=search)
            | Q(father_name__icontains=search)
            | Q(national_code__icontains=search)
            | Q(patient_code__icontains=search)
            | Q(phone_number__icontains=search)
            | Q(sickness_description__icontains=search)
        )

    province = (params.get("province") or "").strip()
    if province:
        qs = qs.filter(province__icontains=province)

    city = (params.get("city") or "").strip()
    if city:
        qs = qs.filter(city__icontains=city)

    national_code = (params.get("national_code") or "").strip()
    if national_code:
        qs = qs.filter(national_code__icontains=national_code)

    approval = (params.get("approval") or "").strip().lower()
    if approval == "pending":
        qs = qs.filter(user__state=False)
    elif approval == "approved":
        qs = qs.filter(user__state=True)

    try:
        limit = min(int(params.get("limit", 100)), 200)
    except (TypeError, ValueError):
        limit = 100

    return qs.distinct()[:limit]


def ha_patient_list_item(ha, patient) -> dict:
    introducer = patient.introducer
    introducer_name = ""
    if introducer:
        if getattr(introducer, "individual_profile", None):
            ind = introducer.individual_profile
            introducer_name = f"{ind.first_name} {ind.last_name}".strip()
        elif getattr(introducer, "organization_profile", None):
            introducer_name = introducer.organization_profile.name or ""
    return {
        "id": patient.pk,
        "patient_code": patient.patient_code,
        "first_name": patient.first_name,
        "last_name": patient.last_name,
        "father_name": patient.father_name,
        "national_code": patient.national_code or "",
        "phone_number": patient.phone_number,
        "landline_number": patient.landline_number or "",
        "province": patient.province or "",
        "city": patient.city or "",
        "address": patient.address or "",
        "sickness_description": patient.sickness_description or "",
        "contact1_full_name": patient.contact1_full_name or "",
        "contact1_phone_number": patient.contact1_phone_number or "",
        "contact2_full_name": patient.contact2_full_name or "",
        "contact2_phone_number": patient.contact2_phone_number or "",
        "admin_approved": patient.admin_approved,
        "ha_approved": patient.ha_approved,
        "state": patient.user.state,
        "is_mine": patient.introducer_id == ha.pk,
        "is_orphan": patient.introducer_id is None,
        "introducer_name": introducer_name,
        "introducer_code": introducer.health_assistance_code if introducer else "",
    }
