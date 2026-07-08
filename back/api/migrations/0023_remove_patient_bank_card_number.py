from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0022_networkrequest_appointment_fields"),
    ]

    operations = [
        migrations.RemoveField(
            model_name="patient",
            name="bank_card_number",
        ),
    ]
