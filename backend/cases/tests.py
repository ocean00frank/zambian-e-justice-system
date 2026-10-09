from datetime import date, time, timedelta
from hashlib import sha256
import tempfile

from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase, override_settings
from rest_framework.authtoken.models import Token
from rest_framework.test import APIClient

from .crypto import decrypt_document
from .models import CaseDocument, CaseEvent, CaseParty, CourtCase, Filing, Hearing, Notification
from .services import create_notification

User = get_user_model()


class CaseApiTests(TestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls._media_directory = tempfile.TemporaryDirectory(prefix="ejustice-test-media-")
        cls._media_settings = override_settings(MEDIA_ROOT=cls._media_directory.name)
        cls._media_settings.enable()

    @classmethod
    def tearDownClass(cls):
        cls._media_settings.disable()
        cls._media_directory.cleanup()
        super().tearDownClass()

    def setUp(self):
        self.lawyer = User.objects.create_user(
            username="filing-lawyer",
            email="filing-lawyer@example.test",
            password="A-strong-test-password-92",
            role=User.Role.LAWYER,
        )
        self.other_lawyer = User.objects.create_user(
            username="other-lawyer",
            password="A-strong-test-password-92",
            role=User.Role.LAWYER,
        )
        self.registry = User.objects.create_user(
            username="registry-user",
            password="A-strong-test-password-92",
            role=User.Role.REGISTRY,
        )
        self.officer = User.objects.create_user(
            username="judicial-officer",
            password="A-strong-test-password-92",
            role=User.Role.JUDGE,
        )
        self.case = CourtCase.objects.create(
            case_number="HC/123/2026",
            title="Private sample dispute",
            case_type="Civil Matter",
            court=CourtCase.Court.HIGH_COURT,
            practitioner=self.lawyer,
            is_publicly_trackable=True,
        )
        CaseEvent.objects.create(
            case=self.case,
            action="Filing submitted",
            actor=self.lawyer,
            is_public=True,
        )

    def authenticated_client(self, user):
        client = APIClient()
        client.credentials(HTTP_AUTHORIZATION=f"Token {Token.objects.create(user=user).key}")
        return client

    def test_dashboard_summary_includes_the_practitioners_pending_filings(self):
        response = self.authenticated_client(self.lawyer).get("/api/dashboard/summary/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["pending_filings"], 1)
        self.assertEqual(response.data["active_cases"], 1)

    def test_dashboard_summary_only_counts_cases_accessible_to_the_user(self):
        response = self.authenticated_client(self.officer).get("/api/dashboard/summary/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["active_cases"], 0)
        self.assertEqual(response.data["pending_filings"], 0)

    def test_registry_can_retrieve_assignable_judicial_officers(self):
        response = self.authenticated_client(self.registry).get("/api/judicial-officers/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.data,
            [{
                "id": self.officer.pk,
                "full_name": "judicial-officer",
                "username": "judicial-officer",
            }],
        )

    def test_non_registry_user_cannot_retrieve_assignable_judicial_officers(self):
        response = self.authenticated_client(self.lawyer).get("/api/judicial-officers/")

        self.assertEqual(response.status_code, 403)

    def test_case_status_filter_returns_only_matching_cases(self):
        registered_case = CourtCase.objects.create(
            case_number="HC/125/2026",
            title="Registered matter",
            case_type="Civil Matter",
            court=CourtCase.Court.HIGH_COURT,
            practitioner=self.lawyer,
            status=CourtCase.Status.REGISTERED,
        )

        response = self.authenticated_client(self.registry).get(
            "/api/cases/",
            {"status": CourtCase.Status.FILED},
        )
        visible_numbers = {item["case_number"] for item in response.data["results"]}

        self.assertEqual(response.status_code, 200)
        self.assertIn(self.case.case_number, visible_numbers)
        self.assertNotIn(registered_case.case_number, visible_numbers)

    def test_case_detail_shows_assigned_judge_username_when_full_name_is_blank(self):
        self.case.assigned_officer = self.officer
        self.case.save(update_fields=("assigned_officer",))

        response = self.authenticated_client(self.lawyer).get(f"/api/cases/{self.case.pk}/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["assigned_officer"], self.officer.pk)
        self.assertEqual(response.data["assigned_officer_name"], self.officer.username)
        self.assertEqual(response.data["assigned_officer_username"], self.officer.username)

    def test_upcoming_hearings_filter_only_returns_scheduled_future_hearings(self):
        upcoming = Hearing.objects.create(
            case=self.case,
            hearing_date=date.today() + timedelta(days=1),
            hearing_time=time(10, 0),
            purpose="Hearing",
            scheduled_by=self.registry,
        )
        past = Hearing.objects.create(
            case=self.case,
            hearing_date=date.today() - timedelta(days=1),
            hearing_time=time(10, 0),
            purpose="Past hearing",
            scheduled_by=self.registry,
        )
        cancelled = Hearing.objects.create(
            case=self.case,
            hearing_date=date.today() + timedelta(days=2),
            hearing_time=time(10, 0),
            purpose="Cancelled hearing",
            status=Hearing.Status.CANCELLED,
            scheduled_by=self.registry,
        )

        response = self.authenticated_client(self.lawyer).get(
            "/api/hearings/",
            {"upcoming": "true"},
        )
        visible_ids = {item["id"] for item in response.data["results"]}

        self.assertEqual(response.status_code, 200)
        self.assertEqual(visible_ids, {upcoming.pk})
        self.assertNotIn(past.pk, visible_ids)
        self.assertNotIn(cancelled.pk, visible_ids)

    def test_public_case_tracking_only_returns_public_fields(self):
        response = APIClient().get(
            "/api/cases/track/",
            {"case_number": self.case.case_number},
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["case_number"], self.case.case_number)
        self.assertNotIn("title", response.data)
        self.assertNotIn("parties", response.data)
        self.assertNotIn("documents", response.data)

    def test_private_case_is_not_publicly_discoverable(self):
        self.case.is_publicly_trackable = False
        self.case.save(update_fields=("is_publicly_trackable",))

        response = APIClient().get(
            "/api/cases/track/",
            {"case_number": self.case.case_number},
        )

        self.assertEqual(response.status_code, 404)

    def test_case_participant_can_track_private_case_but_other_user_cannot(self):
        self.case.is_publicly_trackable = False
        self.case.save(update_fields=("is_publicly_trackable",))
        private_event = CaseEvent.objects.create(
            case=self.case,
            action="Registry review in progress",
            actor=self.registry,
            is_public=False,
        )

        stakeholder_response = self.authenticated_client(self.lawyer).get(
            "/api/cases/track/",
            {"case_number": self.case.case_number},
        )
        other_user_response = self.authenticated_client(self.other_lawyer).get(
            "/api/cases/track/",
            {"case_number": self.case.case_number},
        )

        self.assertEqual(stakeholder_response.status_code, 200)
        self.assertIn(
            "Registry review in progress",
            [event["action"] for event in stakeholder_response.data["public_timeline"]],
        )
        self.assertEqual(other_user_response.status_code, 404)

    def test_lawyers_only_list_cases_they_are_party_to(self):
        other_case = CourtCase.objects.create(
            case_number="HC/124/2026",
            title="Another dispute",
            case_type="Civil Matter",
            court=CourtCase.Court.HIGH_COURT,
            practitioner=self.other_lawyer,
        )

        response = self.authenticated_client(self.lawyer).get("/api/cases/")
        visible_ids = {item["case_number"] for item in response.data["results"]}

        self.assertIn(self.case.case_number, visible_ids)
        self.assertNotIn(other_case.case_number, visible_ids)

    def test_filing_creates_receipt_and_encrypted_immutable_document(self):
        original = b"%PDF-1.7\nsample legal filing\n%%EOF"
        upload = SimpleUploadedFile("claim.pdf", original, content_type="application/pdf")
        payment_proof = SimpleUploadedFile(
            "payment-proof.pdf",
            b"%PDF-1.7\npayment receipt\n%%EOF",
            content_type="application/pdf",
        )
        client = self.authenticated_client(self.lawyer)

        response = client.post(
            "/api/filings/",
            {
                "court": CourtCase.Court.HIGH_COURT,
                "court_division": "General List",
                "title": "Applicant v Respondent",
                "case_type": "Civil Matter",
                "document_type": "Statement of Claim",
                "parties": '["Applicant", "Respondent"]',
                "document": upload,
                "fee_amount": "167.00",
                "payment_reference": "BANK-REF-001",
                "payment_proof": payment_proof,
            },
            format="multipart",
        )

        self.assertEqual(response.status_code, 201, response.data)
        self.assertTrue(response.data["receipt_number"].startswith("EJ-"))
        receipt_case = CourtCase.objects.get(pk=response.data["case_id"])
        self.assertEqual(response.data["case_number"], receipt_case.case_number)
        document = CaseDocument.objects.get(original_filename="claim.pdf")
        with document.file.open("rb") as saved_file:
            encrypted = saved_file.read()
        self.assertNotIn(original, encrypted)
        self.assertEqual(decrypt_document(encrypted), original)
        self.assertEqual(document.sha256_digest, sha256(original).hexdigest())
        self.assertEqual(response.data["case_number"], document.case.case_number)
        filing = Filing.objects.get(receipt_number=response.data["receipt_number"])
        self.assertEqual(filing.fee_amount, 167)
        self.assertEqual(filing.payment_reference, "BANK-REF-001")
        self.assertEqual(filing.payment_status, Filing.PaymentStatus.PENDING_REVIEW)
        self.assertEqual(response.data["payment_status"], Filing.PaymentStatus.PENDING_REVIEW)
        self.assertEqual(response.data["court_division"], "General List")
        self.assertEqual(response.data["fee_amount"], "167.00")
        proof_document = filing.payment_proof
        with proof_document.file.open("rb") as saved_file:
            encrypted_proof = saved_file.read()
        self.assertEqual(
            decrypt_document(encrypted_proof),
            b"%PDF-1.7\npayment receipt\n%%EOF",
        )

        registry_client = self.authenticated_client(self.registry)
        blocked_registration = registry_client.post(
            f"/api/cases/{receipt_case.pk}/status/",
            {"status": CourtCase.Status.REGISTERED},
            format="json",
        )
        self.assertEqual(blocked_registration.status_code, 400)
        denied_verification = client.post(
            f"/api/cases/{receipt_case.pk}/payment-review/",
            {},
            format="json",
        )
        self.assertEqual(denied_verification.status_code, 403)

        verification = registry_client.post(
            f"/api/cases/{receipt_case.pk}/payment-review/",
            {},
            format="json",
        )
        self.assertEqual(verification.status_code, 200, verification.data)
        filing.refresh_from_db()
        self.assertEqual(filing.payment_status, Filing.PaymentStatus.VERIFIED)
        self.assertEqual(filing.payment_reviewed_by, self.registry)
        receipt_case.assigned_officer = self.officer
        receipt_case.save(update_fields=("assigned_officer",))
        judge_registration = self.authenticated_client(self.officer).post(
            f"/api/cases/{receipt_case.pk}/status/",
            {"status": CourtCase.Status.REGISTERED},
            format="json",
        )
        self.assertEqual(judge_registration.status_code, 403)
        receipt_case.assigned_officer = None
        receipt_case.save(update_fields=("assigned_officer",))

        registered = registry_client.post(
            f"/api/cases/{receipt_case.pk}/status/",
            {"status": CourtCase.Status.REGISTERED},
            format="json",
        )
        self.assertEqual(registered.status_code, 200, registered.data)
        self.assertEqual(registered.data["status"], CourtCase.Status.REGISTERED)

    def test_only_case_participant_can_download_document(self):
        document = CaseDocument(
            case=self.case,
            document_type="Statement of Claim",
            original_filename="claim.pdf",
            sha256_digest=sha256(b"%PDF-content").hexdigest(),
            size_bytes=12,
            uploaded_by=self.lawyer,
        )
        from django.core.files.base import ContentFile
        from .crypto import encrypt_document

        document.file.save("claim.pdf", ContentFile(encrypt_document(b"%PDF-content")), save=False)
        document.save()

        allowed = self.authenticated_client(self.lawyer).get(
            f"/api/documents/{document.pk}/download/"
        )
        denied = self.authenticated_client(self.other_lawyer).get(
            f"/api/documents/{document.pk}/download/"
        )

        self.assertEqual(allowed.status_code, 200)
        self.assertEqual(denied.status_code, 404)

    def test_only_registry_can_allocate_a_case(self):
        lawyer_response = self.authenticated_client(self.lawyer).post(
            f"/api/cases/{self.case.pk}/assign/",
            {"assigned_officer": self.officer.pk},
            format="json",
        )
        registry_response = self.authenticated_client(self.registry).post(
            f"/api/cases/{self.case.pk}/assign/",
            {"assigned_officer": self.officer.pk},
            format="json",
        )

        self.assertEqual(lawyer_response.status_code, 403)
        self.assertEqual(registry_response.status_code, 200)
        self.assertEqual(registry_response.data["status"], CourtCase.Status.ASSIGNED)

    def test_registry_status_change_is_audited_and_notifies_case_owner(self):
        Filing.objects.create(
            case=self.case,
            submitted_by=self.lawyer,
            fee_amount="167.00",
            payment_reference="TEST-REF",
            payment_status=Filing.PaymentStatus.VERIFIED,
            payment_reviewed_by=self.registry,
        )
        response = self.authenticated_client(self.registry).post(
            f"/api/cases/{self.case.pk}/status/",
            {"status": CourtCase.Status.REGISTERED},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(CourtCase.objects.get(pk=self.case.pk).status, CourtCase.Status.REGISTERED)
        self.assertTrue(
            CaseEvent.objects.filter(
                case=self.case,
                action="Case status updated to Registered",
                actor=self.registry,
            ).exists()
        )
        self.assertTrue(self.lawyer.notifications.filter(title="Case status updated").exists())

    @override_settings(
        EMAIL_HOST="smtp.example.test",
        EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend",
    )
    def test_email_delivery_state_is_tracked_without_duplicate_alert(self):
        create_notification(
            self.lawyer,
            "Case update",
            "A case update is available.",
            self.case,
        )

        alerts = Notification.objects.filter(recipient=self.lawyer, title="Case update")
        self.assertEqual(alerts.count(), 1)
        self.assertEqual(
            alerts.get().email_delivery_status,
            Notification.DeliveryStatus.SENT,
        )

    def test_lawyer_cannot_change_case_status(self):
        response = self.authenticated_client(self.lawyer).post(
            f"/api/cases/{self.case.pk}/status/",
            {"status": CourtCase.Status.REGISTERED},
            format="json",
        )

        self.assertEqual(response.status_code, 403)

    def test_registry_can_link_provisioned_litigant_to_case(self):
        litigant = User.objects.create_user(
            username="case-litigant",
            password="A-strong-test-password-92",
            role=User.Role.LITIGANT,
        )
        party = CaseParty.objects.create(case=self.case, name="Named litigant")

        response = self.authenticated_client(self.registry).post(
            f"/api/cases/{self.case.pk}/parties/{party.pk}/link-account/",
            {"account": litigant.pk},
            format="json",
        )
        litigant_cases = self.authenticated_client(litigant).get("/api/cases/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(litigant_cases.data["results"][0]["case_number"], self.case.case_number)
        self.assertTrue(litigant.notifications.filter(title="Case linked to your account").exists())

    def test_registry_cannot_schedule_conflicting_hearing(self):
        data = {
            "case": self.case.pk,
            "hearing_date": date(2026, 12, 1).isoformat(),
            "hearing_time": time(9, 30).isoformat(),
            "courtroom": "Courtroom 1",
            "purpose": "Hearing",
        }
        client = self.authenticated_client(self.registry)
        first_response = client.post("/api/hearings/", data, format="json")

        second_case = CourtCase.objects.create(
            case_number="HC/125/2026",
            title="A further dispute",
            case_type="Civil Matter",
            court=CourtCase.Court.HIGH_COURT,
            practitioner=self.lawyer,
        )
        data["case"] = second_case.pk
        conflict_response = client.post("/api/hearings/", data, format="json")

        self.assertEqual(first_response.status_code, 201)
        self.assertEqual(conflict_response.status_code, 400)
        self.assertEqual(Hearing.objects.count(), 1)
