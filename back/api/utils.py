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
