from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0021_networkrequest_fund_recipient_patient_admin_approved_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="networkrequest",
            name="appointment_date",
            field=models.CharField(blank=True, default="", max_length=20),
        ),
        migrations.AddField(
            model_name="networkrequest",
            name="appointment_time",
            field=models.CharField(blank=True, default="", max_length=20),
        ),
        migrations.AddField(
            model_name="networkrequest",
            name="appointment_place",
            field=models.CharField(blank=True, default="", max_length=255),
        ),
        migrations.AddField(
            model_name="networkrequest",
            name="appointment_phone",
            field=models.CharField(blank=True, default="", max_length=20),
        ),
        migrations.AddField(
            model_name="networkrequest",
            name="confirmation_message",
            field=models.TextField(blank=True, default=""),
        ),
        migrations.AlterField(
            model_name="networkrequest",
            name="request_type",
            field=models.CharField(
                choices=[
                    ("consultation", "درخواست پزشکی"),
                    ("financial", "حمایت مالی"),
                    ("service", "دریافت خدمات"),
                ],
                max_length=20,
            ),
        ),
    ]
