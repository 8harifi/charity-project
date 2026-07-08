from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0017_networkrequest_collected_amount_wallet_held_balance_and_more"),
    ]

    operations = [
        migrations.AlterField(
            model_name="patient",
            name="sickness_description",
            field=models.TextField(blank=True, default=""),
        ),
    ]
