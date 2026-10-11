from io import BytesIO

from django.core.files.base import ContentFile
from django.db import migrations


def _schedule_png(title, lines):
    from PIL import Image, ImageDraw

    img = Image.new("RGB", (960, 540), "#f8fafc")
    draw = ImageDraw.Draw(img)
    draw.rectangle([0, 0, 960, 72], fill="#1e3a8a")
    draw.text((36, 24), title, fill="#ffffff")
    draw.text((36, 100), "برنامه حضور پزشکان", fill="#1e40af")
    y = 150
    for line in lines:
        draw.rectangle([36, y, 924, y + 48], outline="#93c5fd", width=2)
        draw.text((52, y + 14), line, fill="#1e293b")
        y += 60
    buf = BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()


def seed_schedule_images(apps, schema_editor):
    MedicalCenter = apps.get_model("api", "MedicalCenter")
    DoctorScheduleImage = apps.get_model("api", "DoctorScheduleImage")
    if DoctorScheduleImage.objects.exists():
        return
    schedules = [
        (
            "بیمارستان افضلی‌پور",
            [
                ("sat", "morning", "gp", "دکتر احمدی — داخلی (صبح شنبه)"),
                ("mon", "evening", "specialist", "دکتر رضایی — قلب (عصر دوشنبه)"),
            ],
        ),
        (
            "بیمارستان شفا",
            [
                ("sun", "morning", "specialist", "دکتر کریمی — اطفال (صبح یکشنبه)"),
                ("wed", "evening", "super", "دکتر نوری — فوق تخصص گوارش (عصر چهارشنبه)"),
            ],
        ),
        (
            "مرکز بهداشت شهرستان کرمان",
            [
                ("sat", "all", "gp", "پزشک عمومی — تمام‌وقت شنبه"),
                ("thu", "morning", "gp", "واکسیناسیون و ویزیت عمومی (صبح پنجشنبه)"),
            ],
        ),
    ]
    for center_name, rows in schedules:
        center = MedicalCenter.objects.filter(name=center_name).first()
        if not center:
            continue
        for idx, (weekday, shift, level, caption) in enumerate(rows):
            png = _schedule_png(center_name, [caption, f"شیفت: {shift}", f"روز: {weekday}"])
            image = DoctorScheduleImage(
                center=center,
                caption=caption,
                shift=shift,
                weekday=weekday,
                specialty_level=level,
                specialty_name=caption.split("—")[-1].strip() if "—" in caption else "",
                doctor_name=caption.split("—")[0].strip() if "—" in caption else "",
                sort_order=idx,
            )
            image.image.save(
                f"schedule_{center.pk}_{idx}.png",
                ContentFile(png),
                save=True,
            )


def seed_network_consultant(apps, schema_editor):
    HealthAssistant = apps.get_model("api", "HealthAssistant")
    if HealthAssistant.objects.filter(is_network_consultant=True).exists():
        return
    ha = HealthAssistant.objects.order_by("pk").first()
    if ha:
        ha.is_network_consultant = True
        ha.save(update_fields=["is_network_consultant"])


def unseed(apps, schema_editor):
    DoctorScheduleImage = apps.get_model("api", "DoctorScheduleImage")
    DoctorScheduleImage.objects.all().delete()


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0032_doc2_homepage_privacy_permissions"),
    ]

    operations = [
        migrations.RunPython(seed_schedule_images, unseed),
        migrations.RunPython(seed_network_consultant, migrations.RunPython.noop),
    ]
