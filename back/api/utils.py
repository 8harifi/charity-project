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


def name_search_q(query, first_field="first_name", last_field="last_name", extra_fields=None):
    """Match a free-text name query against first + last name.

    A query like ``علی رضایی`` must hit first_name=علی AND last_name=رضایی,
    not require either column to contain the whole string.
    """
    from django.db.models import Q

    q = (query or "").strip()
    if not q:
        return Q()
    extras = extra_fields or []
    extra_q = Q()
    for field in extras:
        extra_q |= Q(**{f"{field}__icontains": q})
    parts = [p for p in q.split() if p]
    if len(parts) == 1:
        return (
            Q(**{f"{first_field}__icontains": parts[0]})
            | Q(**{f"{last_field}__icontains": parts[0]})
            | extra_q
        )
    combined = Q()
    for part in parts:
        combined &= (
            Q(**{f"{first_field}__icontains": part})
            | Q(**{f"{last_field}__icontains": part})
        )
    first_rest = Q(**{f"{first_field}__icontains": parts[0]}) & Q(
        **{f"{last_field}__icontains": " ".join(parts[1:])}
    )
    last_first = Q(**{f"{last_field}__icontains": parts[0]}) & Q(
        **{f"{first_field}__icontains": " ".join(parts[1:])}
    )
    return combined | first_rest | last_first | extra_q


def mask_patient_name(patient) -> str:
    if not patient:
        return ""
    last = (patient.last_name or "").strip()
    initial = f"{last[0]}." if last else ""
    return f"{patient.first_name} {initial}".strip()


def viewer_is_privacy_restricted(user) -> bool:
    if user is None or not getattr(user, "is_authenticated", False):
        return True
    return getattr(user, "role", "") == "benefactor"


def ha_display_name(ha) -> str:
    if not ha:
        return ""
    try:
        ind = ha.individual_profile
        return f"{ind.first_name} {ind.last_name}".strip()
    except Exception:
        pass
    try:
        return (ha.organization_profile.name or "").strip()
    except Exception:
        pass
    return (getattr(ha, "health_assistance_code", None) or "").strip()


def ha_organization_name(ha) -> str:
    if not ha:
        return ""
    try:
        name = (ha.organization_profile.name or "").strip()
        if name:
            return name
    except Exception:
        pass
    center = getattr(ha, "affiliated_medical_center", None)
    if center and getattr(center, "name", ""):
        return center.name
    org_app = getattr(ha, "affiliated_organization", None)
    if org_app:
        return (org_app.name or getattr(getattr(org_app, "user", None), "username", "") or "").strip()
    parent = getattr(ha, "parent_organization", None)
    if parent:
        try:
            name = (parent.organization_profile.name or "").strip()
            if name:
                return name
        except Exception:
            pass
        return ha_display_name(parent)
    return ""


_ORG_ROLE_LABELS = {
    "service_center": "مرکز خدمات سلامت",
    "charity_center": "مرکز نیکوکاری",
    "social_work_unit": "واحد مددکاری",
}
_CENTER_TYPE_LABELS = {
    "government": "مرکز درمانی دولتی",
    "private": "مرکز درمانی خصوصی",
}


def ha_affiliation_display(ha) -> dict:
    """Public trust badge: independent vs affiliated to a known center/org."""
    independent = {
        "kind": "independent",
        "name": "",
        "type_label": "سلامتیار مستقل",
        "verified": False,
        "label": "سلامتیار مستقل",
    }
    if not ha:
        return independent

    center = getattr(ha, "affiliated_medical_center", None)
    if center and getattr(center, "name", ""):
        name = center.name
        type_label = _CENTER_TYPE_LABELS.get(center.center_type, "مرکز درمانی")
        return {
            "kind": "affiliated",
            "name": name,
            "type_label": type_label,
            "verified": bool(getattr(center, "is_active", True)),
            "label": f"وابسته به {name}",
        }

    org_app = getattr(ha, "affiliated_organization", None)
    if org_app:
        name = (org_app.name or getattr(getattr(org_app, "user", None), "username", "") or "").strip()
        if name:
            type_label = _ORG_ROLE_LABELS.get(
                org_app.organization_role, org_app.org_type or "سازمان حامی"
            )
            verified = bool(getattr(getattr(org_app, "user", None), "state", False))
            return {
                "kind": "affiliated",
                "name": name,
                "type_label": type_label,
                "verified": verified,
                "label": f"وابسته به {name}",
            }

    try:
        org_name = (ha.organization_profile.name or "").strip()
    except Exception:
        org_name = ""
    if org_name:
        return {
            "kind": "affiliated",
            "name": org_name,
            "type_label": "سلامتیار سازمانی",
            "verified": bool(getattr(ha, "org_approved", False)),
            "label": f"وابسته به {org_name}",
        }

    parent = getattr(ha, "parent_organization", None)
    if parent:
        parent_name = ha_organization_name(parent) or ha_display_name(parent)
        if parent_name:
            return {
                "kind": "affiliated",
                "name": parent_name,
                "type_label": "سازمان سلامتیاری",
                "verified": bool(getattr(ha, "org_approved", False)),
                "label": f"وابسته به {parent_name}",
            }

    if getattr(ha, "affiliation_kind", "independent") == "affiliated":
        return {
            "kind": "affiliated",
            "name": "",
            "type_label": "وابسته",
            "verified": False,
            "label": "وابسته",
        }
    return independent


def creator_organization_name(user) -> str:
    if not user or getattr(user, "role", "") != "health_assistant":
        return ""
    try:
        return ha_organization_name(user.health_assistant_profile)
    except Exception:
        return ""


def ha_can_access_patient(ha, patient, action="view", domain=None) -> bool:
    """Whether a health assistant may act on a patient.

    Own caseload (introducer match) uses the base flags for registration
    approve/edit and the per-domain own-scope flags. The `*_all` permission
    flags widen a specific action (`approve` / `edit`) across every patient
    for a domain (`registration`, `visits`, `financial`, `services`).
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
        if domain in ("visits", "financial", "services"):
            return bool(getattr(ha, f"can_{action}_{domain}", True))
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
            name_search_q(
                search,
                extra_fields=[
                    "father_name",
                    "national_code",
                    "patient_code",
                    "phone_number",
                    "sickness_description",
                ],
            )
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
        "introducer_name": patient.introducer_full_name or introducer_name,
        "introducer_code": introducer.health_assistance_code if introducer else "",
        "introducer_national_code": patient.introducer_national_code
        or (
            getattr(getattr(introducer, "individual_profile", None), "national_code", "")
            if introducer
            else ""
        ),
        "introducer_organization_name": patient.introducer_organization_name
        or ha_organization_name(introducer),
        "family_status": patient.family_status or "",
        "financial_level": patient.financial_level or "",
        "financial_level_label": dict(patient.FINANCIAL_LEVELS).get(
            patient.financial_level, ""
        ),
        "age": patient.age,
        "marital_status_name": getattr(patient.marital_status, "name", "") or "",
        "insurance_name": getattr(patient.insurance, "name", "") or "",
        "covered_organization_name": getattr(patient.covered_organization, "name", "")
        or "",
    }
