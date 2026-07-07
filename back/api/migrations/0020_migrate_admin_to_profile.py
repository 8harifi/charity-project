from django.db import migrations

ADMIN_PHONE = "09100000000"


def migrate_admin_users(apps, schema_editor):
    CustomUser = apps.get_model("api", "CustomUser")
    AdminProfile = apps.get_model("api", "AdminProfile")

    for user in CustomUser.objects.filter(role="admin"):
        phone = ADMIN_PHONE if user.username == "admin" else user.username
        AdminProfile.objects.get_or_create(
            user=user,
            defaults={
                "first_name": user.first_name or "مدیر",
                "last_name": user.last_name or "سیستم",
                "phone_number": phone,
            },
        )
        if user.username != phone:
            user.username = phone
            user.save(update_fields=["username"])


def noop(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0019_admin_profile"),
    ]

    operations = [
        migrations.RunPython(migrate_admin_users, noop),
    ]
