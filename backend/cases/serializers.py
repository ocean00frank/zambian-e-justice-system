from decimal import Decimal

from django.utils import timezone
from rest_framework import serializers

from auth_app.models import User

from .models import (
    CaseDocument,
    CaseEvent,
    CaseParty,
    CourtCase,
    Filing,
    Hearing,
    Notification,
)
from .services import accessible_cases, schedule_hearing, submit_filing


class CasePartySerializer(serializers.ModelSerializer):
    class Meta:
        model = CaseParty
        fields = ("id", "name")


class CaseDocumentSerializer(serializers.ModelSerializer):
    download_url = serializers.SerializerMethodField()
    case_number = serializers.CharField(source="case.case_number", read_only=True)

    class Meta:
        model = CaseDocument
        fields = (
            "id",
            "case_number",
            "document_type",
            "original_filename",
            "sha256_digest",
            "size_bytes",
            "uploaded_at",
            "download_url",
        )

    def get_download_url(self, document):
        request = self.context.get("request")
        path = f"/api/documents/{document.pk}/download/"
        return request.build_absolute_uri(path) if request else path


class HearingSerializer(serializers.ModelSerializer):
    case_number = serializers.CharField(source="case.case_number", read_only=True)

    class Meta:
        model = Hearing
        fields = (
            "id",
            "case",
            "case_number",
            "hearing_date",
            "hearing_time",
            "courtroom",
            "purpose",
            "status",
            "scheduled_by",
            "created_at",
        )
        read_only_fields = ("id", "case_number", "status", "scheduled_by", "created_at")

    def validate_case(self, case):
        if not accessible_cases(self.context["request"].user).filter(pk=case.pk).exists():
            raise serializers.ValidationError("You do not have access to this case.")
        return case

    def create(self, validated_data):
        request = self.context["request"]
        try:
            return schedule_hearing(actor=request.user, **validated_data)
        except ValueError as exc:
            raise serializers.ValidationError({"hearing_time": str(exc)}) from exc


class CaseEventSerializer(serializers.ModelSerializer):
    actor_name = serializers.CharField(source="actor.get_full_name", read_only=True)

    class Meta:
        model = CaseEvent
        fields = ("id", "action", "actor_name", "created_at")


class CaseListSerializer(serializers.ModelSerializer):
    assigned_officer_name = serializers.SerializerMethodField()
    assigned_officer_username = serializers.CharField(
        source="assigned_officer.username",
        read_only=True,
        allow_null=True,
    )
    next_hearing = serializers.SerializerMethodField()
    filing_fee_amount = serializers.SerializerMethodField()
    payment_reference = serializers.SerializerMethodField()
    payment_status = serializers.SerializerMethodField()
    payment_proof_document_id = serializers.SerializerMethodField()

    class Meta:
        model = CourtCase
        fields = (
            "id",
            "case_number",
            "title",
            "case_type",
            "court",
            "court_division",
            "filing_date",
            "status",
            "assigned_officer",
            "assigned_officer_name",
            "assigned_officer_username",
            "next_hearing",
            "filing_fee_amount",
            "payment_reference",
            "payment_status",
            "payment_proof_document_id",
            "updated_at",
        )

    def _first_filing(self, case):
        filings = case.filings.all()
        return filings[0] if filings else None

    def get_assigned_officer_name(self, case):
        if not case.assigned_officer_id:
            return None
        return case.assigned_officer.get_full_name() or case.assigned_officer.username

    def get_filing_fee_amount(self, case):
        filing = self._first_filing(case)
        return filing.fee_amount if filing else None

    def get_payment_reference(self, case):
        filing = self._first_filing(case)
        return filing.payment_reference if filing else None

    def get_payment_status(self, case):
        filing = self._first_filing(case)
        return filing.payment_status if filing else None

    def get_payment_proof_document_id(self, case):
        filing = self._first_filing(case)
        return filing.payment_proof_id if filing else None

    def get_next_hearing(self, case):
        hearing = case.hearings.filter(
            status=Hearing.Status.SCHEDULED,
            hearing_date__gte=timezone.localdate(),
        ).first()
        if not hearing:
            return None
        return {
            "date": hearing.hearing_date,
            "time": hearing.hearing_time,
            "courtroom": hearing.courtroom,
        }


class CaseDetailSerializer(CaseListSerializer):
    parties = CasePartySerializer(many=True, read_only=True)
    documents = CaseDocumentSerializer(many=True, read_only=True)
    hearings = HearingSerializer(many=True, read_only=True)
    events = CaseEventSerializer(many=True, read_only=True)
    practitioner_name = serializers.CharField(
        source="practitioner.get_full_name",
        read_only=True,
    )

    class Meta(CaseListSerializer.Meta):
        fields = CaseListSerializer.Meta.fields + (
            "practitioner",
            "practitioner_name",
            "parties",
            "documents",
            "hearings",
            "events",
        )


class PublicCaseSerializer(serializers.ModelSerializer):
    public_timeline = serializers.SerializerMethodField()
    next_hearing = serializers.SerializerMethodField()

    class Meta:
        model = CourtCase
        fields = (
            "case_number",
            "court",
            "case_type",
            "filing_date",
            "status",
            "updated_at",
            "next_hearing",
            "public_timeline",
        )

    def get_public_timeline(self, case):
        events = (
            case.events.all()
            if self.context.get("can_view_private_updates")
            else case.events.filter(is_public=True)
        )
        return [{"action": event.action, "date": event.created_at} for event in events]

    def get_next_hearing(self, case):
        hearing = case.hearings.filter(
            status=Hearing.Status.SCHEDULED,
            hearing_date__gte=timezone.localdate(),
        ).first()
        if not hearing:
            return None
        return {
            "date": hearing.hearing_date,
            "time": hearing.hearing_time,
        }


class FilingCreateSerializer(serializers.Serializer):
    court = serializers.ChoiceField(choices=CourtCase.Court.choices)
    court_division = serializers.CharField(max_length=100)
    title = serializers.CharField(max_length=255)
    case_type = serializers.CharField(max_length=120)
    document_type = serializers.CharField(max_length=120)
    parties = serializers.JSONField()
    document = serializers.FileField()
    fee_amount = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        min_value=Decimal("0.01"),
    )
    payment_reference = serializers.CharField(max_length=120)
    payment_proof = serializers.FileField()

    def validate_parties(self, parties):
        if not isinstance(parties, list) or not parties:
            raise serializers.ValidationError("Provide at least one party name.")
        if len(parties) > 20:
            raise serializers.ValidationError("A filing may include at most 20 parties.")
        if any(not isinstance(party, str) or not party.strip() for party in parties):
            raise serializers.ValidationError("Each party must have a non-empty name.")
        return parties

    def validate_document(self, upload):
        if not upload.name.lower().endswith(".pdf"):
            raise serializers.ValidationError("Only PDF documents are accepted.")
        if upload.size > 10 * 1024 * 1024:
            raise serializers.ValidationError("The PDF must be 10 MB or smaller.")
        header = upload.read(5)
        upload.seek(0)
        if header != b"%PDF-":
            raise serializers.ValidationError("The uploaded file is not a valid PDF document.")
        return upload

    def validate_court_division(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Enter the court division or registry.")
        return value

    def validate_payment_reference(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Enter the payment reference.")
        return value

    def validate_payment_proof(self, upload):
        if upload.size > 10 * 1024 * 1024:
            raise serializers.ValidationError("The payment proof must be 10 MB or smaller.")
        extension = upload.name.lower().rsplit(".", 1)[-1] if "." in upload.name else ""
        signatures = {
            "pdf": (b"%PDF-",),
            "png": (b"\x89PNG\r\n\x1a\n",),
            "jpg": (b"\xff\xd8\xff",),
            "jpeg": (b"\xff\xd8\xff",),
        }
        allowed_signatures = signatures.get(extension)
        if not allowed_signatures:
            raise serializers.ValidationError("Upload payment proof as PDF, JPG, or PNG.")
        header = upload.read(max(map(len, allowed_signatures)))
        upload.seek(0)
        if not any(header.startswith(signature) for signature in allowed_signatures):
            raise serializers.ValidationError("The payment proof file is not valid for its file type.")
        return upload

    def create(self, validated_data):
        upload = validated_data.pop("document")
        payment_proof = validated_data.pop("payment_proof")
        return submit_filing(
            user=self.context["request"].user,
            upload=upload,
            payment_proof=payment_proof,
            **validated_data,
        )


class FilingReceiptSerializer(serializers.ModelSerializer):
    case_id = serializers.IntegerField(source="case.pk", read_only=True)
    case_number = serializers.CharField(source="case.case_number", read_only=True)
    court = serializers.CharField(source="case.court", read_only=True)
    document_type = serializers.SerializerMethodField()
    court_division = serializers.CharField(source="case.court_division", read_only=True)
    payment_proof_document_id = serializers.IntegerField(
        source="payment_proof_id",
        read_only=True,
        allow_null=True,
    )

    class Meta:
        model = Filing
        fields = (
            "receipt_number",
            "case_id",
            "case_number",
            "court",
            "court_division",
            "document_type",
            "fee_amount",
            "payment_reference",
            "payment_status",
            "payment_proof_document_id",
            "payment_reviewed_at",
            "submitted_at",
        )

    def get_document_type(self, filing):
        document = filing.documents.first()
        return document.document_type if document else None


class CaseStatusSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=CourtCase.Status.choices)


class AssignCaseSerializer(serializers.Serializer):
    assigned_officer = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(role=User.Role.JUDGE, is_active=True)
    )


class LinkPartyAccountSerializer(serializers.Serializer):
    account = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(role=User.Role.LITIGANT, is_active=True)
    )


class NotificationSerializer(serializers.ModelSerializer):
    case_number = serializers.CharField(source="case.case_number", read_only=True, allow_null=True)

    class Meta:
        model = Notification
        fields = (
            "id",
            "case",
            "case_number",
            "title",
            "message",
            "channel",
            "delivery_status",
            "email_delivery_status",
            "is_read",
            "created_at",
            "delivered_at",
            "email_delivered_at",
        )
        read_only_fields = fields
