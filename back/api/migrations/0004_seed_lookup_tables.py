# Generated manually for doctor/patient signup lookups

from django.db import migrations


def seed_lookups(apps, schema_editor):
    Gender = apps.get_model("api", "Gender")
    Specialty = apps.get_model("api", "Specialty")
    CooperationType = apps.get_model("api", "CooperationType")

    for name in ("Male", "Female"):
        Gender.objects.get_or_create(name=name)

    for name in ("General practice", "Internal medicine", "Pediatrics", "Other"):
        Specialty.objects.get_or_create(name=name)

    for name in ("Full cooperation", "Limited cooperation", "Other"):
        CooperationType.objects.get_or_create(name=name)


def unseed_lookups(apps, schema_editor):
    Gender = apps.get_model("api", "Gender")
    Specialty = apps.get_model("api", "Specialty")
    CooperationType = apps.get_model("api", "CooperationType")
    Gender.objects.filter(name__in=("Male", "Female")).delete()
    Specialty.objects.filter(
        name__in=("General practice", "Internal medicine", "Pediatrics", "Other")
    ).delete()
    CooperationType.objects.filter(
        name__in=("Full cooperation", "Limited cooperation", "Other")
    ).delete()


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0003_consolidate_models_package"),
    ]

    operations = [
        migrations.RunPython(seed_lookups, unseed_lookups),
    ]
