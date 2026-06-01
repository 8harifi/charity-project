from django.db import migrations


LOOKUP_SEEDS = {
    "Gender": ["مرد", "زن"],
    "MaritalStatus": ["مجرد", "متأهل", "مطلقه"],
    "Education": [
        "زیر دیپلم",
        "دیپلم",
        "فوق‌دیپلم",
        "کارشناسی",
        "کارشناسی ارشد",
        "دکتری",
    ],
    "JobStatus": ["شاغل", "بیکار"],
    "HousingStatus": [
        "شخصی",
        "مستاجر",
        "خانه پدری",
        "سازمانی",
        "سایر",
        "هیچکدام",
    ],
    "CoveredOrganization": [
        "کمیته",
        "بهزیستی",
        "موسسه خیریه",
        "سایر",
        "هیچکدام",
    ],
    "Insurance": [
        "تأمین اجتماعی",
        "سلامت",
        "نیروهای مسلح",
        "بانک‌ها",
        "بیمه تکمیلی",
        "آزاد",
        "بدون بیمه",
    ],
    "Specialty": ["مغز و اعصاب", "داخلی", "اطفال", "پوست و زیبایی"],
    "HealthAssistantCooperationType": [
        "معرفی بیمار",
        "انجام امور مربوط به بیمارن",
        "پروژه های ساخت و ساز",
        "سایر موارد",
    ],
}


def seed(apps, schema_editor):
    for model_name, names in LOOKUP_SEEDS.items():
        Model = apps.get_model("api", model_name)
        for name in names:
            Model.objects.get_or_create(name=name)


def unseed(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0010_doctor_cooperating_health_assistants"),
    ]

    operations = [
        migrations.RunPython(seed, unseed),
    ]
