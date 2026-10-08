import hashlib
import logging
import smtplib
from django.conf import settings
from django.core.files.base import ContentFile
from django.core.mail import send_mail
from django.db import transaction
from django.db.models import Q
from django.utils import timezone
from django.utils.crypto import get_random_string

from auth_app.models import User

from .crypto import encrypt_document
from .models import (
    CaseDocument,
    CaseEvent,
    CaseNumberSequence,
    CaseParty,
    CourtCase,
    Filing,
    Hearing,
    Notification,
)

logger = logging.getLogger(__name__)


def accessible_cases(user):
    if user.is_superuser or user.role == User.Role.REGISTRY:
        return CourtCase.objects.all()
    if user.role == User.Role.LAWYER:
        return CourtCase.objects.filter(
            Q(practitioner=user) | Q(parties__account=user)
        ).distinct()
    if user.role == User.Role.JUDGE:
        return CourtCase.objects.filter(assigned_officer=user)
    if user.role == User.Role.LITIGANT:
        return CourtCase.objects.filter(parties__account=user).distinct()
    return CourtCase.objects.none()


def notify_case_users(case, title, message):
    user_ids = {case.practitioner_id}
    if case.assigned_officer_id:
        user_ids.add(case.assigned_officer_id)
    user_ids.update(
        case.parties.exclude(account__isnull=True).values_list("account_id", flat=True)
    )
    for user in User.objects.filter(id__in=user_ids, is_active=True):
        create_notification(user, title, message, case)


def create_notification(recipient, title, message, case=None):
    email_enabled = bool(settings.EMAIL_HOST and recipient.email)
    notification = Notification.objects.create(
        recipient=recipient,
        case=case,
        title=title,
        message=message,
        channel=Notification.Channel.IN_APP,
        delivery_status=Notification.DeliveryStatus.SENT,
        email_delivery_status=(
            Notification.DeliveryStatus.PENDING
            if email_enabled
            else Notification.DeliveryStatus.NOT_CONFIGURED
        ),
        delivered_at=timezone.now(),
    )
    if not email_enabled:
        return notification

    try:
        sent_count = send_mail(
            subject=title,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[recipient.email],
            fail_silently=False,
        )
    except (OSError, smtplib.SMTPException):
        logger.exception(
            "Email notification delivery failed for notification id %s",
            notification.pk,
        )
        notification.email_delivery_status = Notification.DeliveryStatus.FAILED
        notification.save(update_fields=("email_delivery_status",))
    else:
        notification.email_delivery_status = (
            Notification.DeliveryStatus.SENT
            if sent_count == 1
            else Notification.DeliveryStatus.FAILED
        )
        if sent_count == 1:
            notification.email_delivered_at = timezone.now()
        notification.save(update_fields=("email_delivery_status", "email_delivered_at"))
    return notification


def _next_case_number(court):
    prefix = "HC" if court == CourtCase.Court.HIGH_COURT else "SC"
    year = timezone.localdate().year
    sequence, _ = CaseNumberSequence.objects.select_for_update().get_or_create(
        court_prefix=prefix,
        year=year,
    )
    candidate = f"{prefix}/{sequence.next_value}/{year}"
    while CourtCase.objects.filter(case_number=candidate).exists():
        sequence.next_value += 1
        candidate = f"{prefix}/{sequence.next_value}/{year}"
    sequence.next_value += 1
    sequence.save(update_fields=("next_value",))
    return candidate


@transaction.atomic
def submit_filing(*, user, court, title, case_type, parties, document_type, upload):
    original_bytes = upload.read()
    upload.seek(0)
    if not original_bytes.startswith(b"%PDF-"):
        raise ValueError("The uploaded file is not a valid PDF document.")
    if len(original_bytes) > settings.DOCUMENT_MAX_UPLOAD_BYTES:
        raise ValueError("The uploaded PDF exceeds the 10 MB limit.")

    case = CourtCase.objects.create(
        case_number=_next_case_number(court),
        title=title,
        case_type=case_type,
        court=court,
        practitioner=user,
    )
    for party_name in parties:
        CaseParty.objects.create(case=case, name=party_name.strip())

    filing = Filing.objects.create(
        case=case,
        receipt_number=f"EJ-{timezone.localdate():%Y}-{get_random_string(12).upper()}",
        submitted_by=user,
    )
    filename = upload.name.rsplit("/", 1)[-1].rsplit("\\", 1)[-1]
    document = CaseDocument(
        case=case,
        filing=filing,
        document_type=document_type,
        original_filename=filename,
        sha256_digest=hashlib.sha256(original_bytes).hexdigest(),
        size_bytes=len(original_bytes),
        uploaded_by=user,
    )
    document.file.save(filename, ContentFile(encrypt_document(original_bytes)), save=False)
    document.save()
    CaseEvent.objects.create(
        case=case,
        action="Electronic filing submitted",
        actor=user,
        is_public=case.is_publicly_trackable,
    )
    create_notification(
        user,
        "Filing submitted",
        f"Your filing for {case.case_number} was submitted. Receipt: {filing.receipt_number}.",
        case,
    )
    return filing


def update_case_status(*, case, status, actor):
    if case.status == status:
        return case
    case.status = status
    case.save(update_fields=("status", "updated_at"))
    CaseEvent.objects.create(
        case=case,
        action=f"Case status updated to {status}",
        actor=actor,
        is_public=case.is_publicly_trackable,
    )
    notify_case_users(
        case,
        "Case status updated",
        f"The status of {case.case_number} is now {status}.",
    )
    return case


def assign_case(*, case, officer, actor):
    case.assigned_officer = officer
    if case.status == CourtCase.Status.FILED or case.status == CourtCase.Status.REGISTERED:
        case.status = CourtCase.Status.ASSIGNED
    case.save(update_fields=("assigned_officer", "status", "updated_at"))
    CaseEvent.objects.create(
        case=case,
        action="Case assigned to a judicial officer",
        actor=actor,
        is_public=case.is_publicly_trackable,
    )
    notify_case_users(
        case,
        "Case assigned",
        f"{case.case_number} has been assigned to a judicial officer.",
    )
    create_notification(
        officer,
        "Case assigned",
        f"{case.case_number} has been assigned to you.",
        case,
    )
    return case


@transaction.atomic
def schedule_hearing(*, case, hearing_date, hearing_time, courtroom, purpose, actor):
    conflicts = Hearing.objects.filter(
        hearing_date=hearing_date,
        hearing_time=hearing_time,
        status=Hearing.Status.SCHEDULED,
        case__court=case.court,
    )
    if courtroom:
        conflicts = conflicts.filter(courtroom__iexact=courtroom)
    else:
        conflicts = conflicts.filter(courtroom="")
    if conflicts.exists():
        raise ValueError("A hearing is already scheduled at that date, time, and courtroom.")

    hearing = Hearing.objects.create(
        case=case,
        hearing_date=hearing_date,
        hearing_time=hearing_time,
        courtroom=courtroom,
        purpose=purpose,
        scheduled_by=actor,
    )
    case.status = CourtCase.Status.HEARING_SCHEDULED
    case.save(update_fields=("status", "updated_at"))
    CaseEvent.objects.create(
        case=case,
        action="Hearing scheduled",
        actor=actor,
        is_public=case.is_publicly_trackable,
    )
    notify_case_users(
        case,
        "Hearing scheduled",
        f"A hearing for {case.case_number} is scheduled for {hearing_date:%d %b %Y} at {hearing_time:%H:%M}.",
    )
    return hearing
