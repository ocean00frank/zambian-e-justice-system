from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    REQUIRED_FIELDS = ["email", "role"]

    class Role(models.TextChoices):
        LAWYER = "lawyer", "Lawyer"
        JUDGE = "judge", "Judge"
        REGISTRY = "registry", "Registry"
        LITIGANT = "litigant", "Litigant"

    role = models.CharField(max_length=32, choices=Role.choices)

    def __str__(self):
        return self.get_full_name() or self.username
