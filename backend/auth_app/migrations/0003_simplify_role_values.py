from django.db import migrations, models


ROLE_VALUE_MAP = {
    "legal_practitioner": "lawyer",
    "judicial_officer": "judge",
    "court_registry": "registry",
}


def simplify_role_values(apps, schema_editor):
    User = apps.get_model("auth_app", "User")
    for old_value, new_value in ROLE_VALUE_MAP.items():
        User.objects.filter(role=old_value).update(role=new_value)


def restore_role_values(apps, schema_editor):
    User = apps.get_model("auth_app", "User")
    for old_value, new_value in ROLE_VALUE_MAP.items():
        User.objects.filter(role=new_value).update(role=old_value)


class Migration(migrations.Migration):
    dependencies = [("auth_app", "0002_alter_user_role")]

    operations = [
        migrations.RunPython(simplify_role_values, restore_role_values),
        migrations.AlterField(
            model_name="user",
            name="role",
            field=models.CharField(
                choices=[
                    ("lawyer", "Lawyer"),
                    ("judge", "Judge"),
                    ("registry", "Registry"),
                    ("litigant", "Litigant"),
                ],
                max_length=32,
            ),
        ),
    ]
