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
    assigned_officer_name = serializers.CharField(
        source="assigned_officer.get_full_name",
        read_only=True,
        allow_null=True,
    )
    next_hearing = serializers.SerializerMethodField()

    class Meta:
        model = CourtCase
        fields = (
            "id",
            "case_number",
            "title",
            "case_type",
            "court",
            "filing_date",
            "status",
            "assigned_officer",
            "assigned_officer_name",
            "next_hearing",
            "updated_at",
        )

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
        return [
            {"action": event.action, "date": event.created_at}
            for event in case.events.filter(is_public=True)
        ]

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
    title = serializers.CharField(max_length=255)
    case_type = serializers.CharField(max_length=120)
    document_type = serializers.CharField(max_length=120)
    parties = serializers.JSONField()
    document = serializers.FileField()

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

    def create(self, validated_data):
        upload = validated_data.pop("document")
        return submit_filing(
            user=self.context["request"].user,
            upload=upload,
            **validated_data,
        )


class FilingReceiptSerializer(serializers.ModelSerializer):
    case_id = serializers.IntegerField(source="case.pk", read_only=True)
    case_number = serializers.CharField(source="case.case_number", read_only=True)
    court = serializers.CharField(source="case.court", read_only=True)
    document_type = serializers.SerializerMethodField()

    class Meta:
        model = Filing
        fields = ("receipt_number", "case_id", "case_number", "court", "document_type", "submitted_at")

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
