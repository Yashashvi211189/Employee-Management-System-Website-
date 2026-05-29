from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('account', '0062_employeeticketnotification'),
    ]

    operations = [
        migrations.AddField(
            model_name='employeeticketcomment',
            name='links',
            field=models.JSONField(blank=True, default=list),
        ),
        migrations.AddField(
            model_name='employeeticketattachment',
            name='comment',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name='attachments',
                to='account.employeeticketcomment',
            ),
        ),
    ]
