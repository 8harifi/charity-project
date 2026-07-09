from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0023_remove_patient_bank_card_number"),
    ]

    operations = [
        migrations.AlterField(
            model_name="wallettransaction",
            name="kind",
            field=models.CharField(
                choices=[
                    ("topup", "Top-up"),
                    ("donation_out", "Donation Out"),
                    ("donation_in", "Donation In"),
                    ("disbursement", "Disbursement"),
                    ("refund", "Refund"),
                    ("adjustment", "Adjustment"),
                    ("pledge_hold", "Pledge Hold"),
                    ("pledge_release", "Pledge Release"),
                    ("pledge_refund", "Pledge Refund"),
                ],
                max_length=20,
            ),
        ),
        migrations.AlterField(
            model_name="wallettransaction",
            name="reference_type",
            field=models.CharField(
                blank=True,
                choices=[
                    ("gateway_payment", "Gateway Payment"),
                    ("donation", "Donation"),
                    ("network_request", "Network Request"),
                    ("disbursement", "Disbursement"),
                    ("admin_adjustment", "Admin Adjustment"),
                ],
                default="",
                max_length=30,
            ),
        ),
    ]
