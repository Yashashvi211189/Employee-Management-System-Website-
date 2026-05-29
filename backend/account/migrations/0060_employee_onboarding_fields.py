from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("account", "0059_private_project_models"),
    ]

    operations = [
        migrations.AddField(
            model_name="employeeprofile",
            name="email_verified",
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name="otpverification",
            name="purpose",
            field=models.CharField(
                choices=[("login", "Login"), ("onboarding", "Onboarding")],
                default="login",
                max_length=20,
            ),
        ),
        migrations.AlterField(
            model_name="otpverification",
            name="otp_code",
            field=models.CharField(max_length=128),
        ),
    ]
