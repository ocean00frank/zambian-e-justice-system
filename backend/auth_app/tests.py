from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient

User = get_user_model()


class AuthenticationApiTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="lawyer-one",
            email="lawyer@example.test",
            password="A-strong-test-password-92",
            role=User.Role.LEGAL_PRACTITIONER,
        )
        self.client = APIClient()

    def test_login_accepts_username_and_returns_role(self):
        response = self.client.post(
            "/api/auth/login/",
            {"username": self.user.username, "password": "A-strong-test-password-92"},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data["token"])
        self.assertEqual(response.data["user"]["role"], User.Role.LEGAL_PRACTITIONER)
        self.assertEqual(response.data["user"]["role_label"], "Lawyer")

    def test_login_accepts_email(self):
        response = self.client.post(
            "/api/auth/login/",
            {"username": self.user.email, "password": "A-strong-test-password-92"},
            format="json",
        )

        self.assertEqual(response.status_code, 200)

    def test_invalid_login_does_not_disclose_account_state(self):
        response = self.client.post(
            "/api/auth/login/",
            {"username": self.user.username, "password": "incorrect"},
            format="json",
        )

        self.assertEqual(response.status_code, 401)
        self.assertEqual(response.data["detail"], "Invalid username or password.")

    def test_public_registration_route_is_not_available(self):
        response = self.client.post("/api/auth/register/", {}, format="json")
        self.assertEqual(response.status_code, 404)

    def test_superuser_can_open_role_provisioning_form_in_django_admin(self):
        administrator = User.objects.create_superuser(
            username="system-admin",
            email="admin@example.test",
            password="A-strong-test-password-92",
            role=User.Role.COURT_REGISTRY,
        )
        self.client.force_login(administrator)

        add_url = reverse("admin:auth_app_user_add")
        response = self.client.get(add_url)

        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'name="role"')

        response = self.client.post(
            add_url,
            {
                "username": "provisioned-officer",
                "email": "officer@example.test",
                "first_name": "Provisioned",
                "last_name": "Officer",
                "role": User.Role.JUDICIAL_OFFICER,
                "password1": "A-strong-test-password-92",
                "password2": "A-strong-test-password-92",
            },
        )

        self.assertEqual(response.status_code, 302)
        provisioned = User.objects.get(username="provisioned-officer")
        self.assertEqual(provisioned.role, User.Role.JUDICIAL_OFFICER)
