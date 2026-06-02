from django.apps import apps


def generate_patient_code():
    Patient = apps.get_model("api", "Patient")
    last = Patient.objects.order_by("id").last()

    if not last:
        return "P00001"

    last_code = int(last.patient_code.replace("P", ""))
    new_code = last_code + 1

    return f"P{new_code:05d}"


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
