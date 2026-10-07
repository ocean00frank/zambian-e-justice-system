from django.contrib import admin

from .models import (
    CaseDocument,
    CaseEvent,
    CaseParty,
    CourtCase,
    Filing,
    Hearing,
    Notification,
)
from .models import CaseEvent


class ImmutableRecordAdmin(admin.ModelAdmin):
    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(CourtCase)
class CourtCaseAdmin(admin.ModelAdmin):
    list_display = ("case_number", "court", "case_type", "status", "filing_date")
    list_filter = ("court", "status", "filing_date")
    search_fields = ("case_number", "title", "parties__name")
    fields = (
        "case_number",
        "title",
        "case_type",
        "court",
        "filing_date",
        "status",
        "practitioner",
        "assigned_officer",
        "is_publicly_trackable",
        "created_at",
        "updated_at",
    )

    def has_add_permission(self, request):
        return False

    def get_readonly_fields(self, request, obj=None):
        if obj is None:
            return ("case_number", "filing_date", "status", "practitioner", "assigned_officer", "created_at", "updated_at")
        return (
            "case_number",
            "title",
            "case_type",
            "court",
            "filing_date",
            "status",
            "practitioner",
            "assigned_officer",
            "created_at",
            "updated_at",
        )

    def save_model(self, request, obj, form, change):
        was_trackable = None
        if change:
            was_trackable = CourtCase.objects.get(pk=obj.pk).is_publicly_trackable
        super().save_model(request, obj, form, change)
        if was_trackable is not None and was_trackable != obj.is_publicly_trackable:
            CaseEvent.objects.create(
                case=obj,
                action=(
                    "Public tracking enabled"
                    if obj.is_publicly_trackable
                    else "Public tracking disabled"
                ),
                actor=request.user,
                is_public=False,
            )


@admin.register(CaseDocument)
class CaseDocumentAdmin(ImmutableRecordAdmin):
    list_display = ("original_filename", "case", "document_type", "size_bytes", "uploaded_at")
    list_filter = ("document_type", "uploaded_at")
    search_fields = ("original_filename", "case__case_number", "sha256_digest")


@admin.register(CaseEvent)
class CaseEventAdmin(ImmutableRecordAdmin):
    list_display = ("case", "action", "actor", "is_public", "created_at")
    list_filter = ("is_public", "created_at")
    search_fields = ("case__case_number", "action", "actor__username")


@admin.register(Filing)
class FilingAdmin(ImmutableRecordAdmin):
    list_display = ("receipt_number", "case", "submitted_by", "submitted_at")
    search_fields = ("receipt_number", "case__case_number", "submitted_by__username")


@admin.register(CaseParty)
class CasePartyAdmin(ImmutableRecordAdmin):
    list_display = ("name", "case", "account")
    search_fields = ("name", "case__case_number", "account__username")


@admin.register(Hearing)
class HearingAdmin(admin.ModelAdmin):
    list_display = ("case", "hearing_date", "hearing_time", "courtroom", "status")
    list_filter = ("status", "hearing_date")
    search_fields = ("case__case_number", "purpose", "courtroom")


@admin.register(Notification)
class NotificationAdmin(ImmutableRecordAdmin):
    list_display = ("title", "recipient", "case", "channel", "delivery_status", "created_at")
    list_filter = ("channel", "delivery_status", "is_read", "created_at")
    search_fields = ("recipient__username", "case__case_number", "title")
