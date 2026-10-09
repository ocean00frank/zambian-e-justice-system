import uuid

from django.conf import settings
from django.db import models


class CaseNumberSequence(models.Model):
    court_prefix = models.CharField(max_length=2)
    year = models.PositiveSmallIntegerField()
    next_value = models.PositiveIntegerField(default=1)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=("court_prefix", "year"),
                name="unique_case_sequence_per_court_year",
            )
        ]


class CourtCase(models.Model):
    class Court(models.TextChoices):
        HIGH_COURT = "High Court", "High Court"
        SUBORDINATE_COURT = "Subordinate Court", "Subordinate Court"

    class Status(models.TextChoices):
        FILED = "Filed", "Filed"
        REGISTERED = "Registered", "Registered"
        ASSIGNED = "Assigned", "Assigned"
        HEARING_SCHEDULED = "Hearing Scheduled", "Hearing Scheduled"
        HEARING_HELD = "Hearing Held", "Hearing Held"
        JUDGMENT_DELIVERED = "Judgment Delivered", "Judgment Delivered"
        CONCLUDED = "Concluded", "Concluded"

    case_number = models.CharField(max_length=32, unique=True, blank=True)
    title = models.CharField(max_length=255)
    case_type = models.CharField(max_length=120)
    court = models.CharField(max_length=32, choices=Court.choices)
    court_division = models.CharField(max_length=100, blank=True)
    filing_date = models.DateField(auto_now_add=True)
    status = models.CharField(max_length=32, choices=Status.choices, default=Status.FILED)
    practitioner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="filed_cases",
    )
    assigned_officer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="assigned_cases",
        null=True,
        blank=True,
    )
    is_publicly_trackable = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("-created_at",)

    def __str__(self):
        return self.case_number or self.title


class CaseParty(models.Model):
    case = models.ForeignKey(CourtCase, on_delete=models.CASCADE, related_name="parties")
    name = models.CharField(max_length=255)
    account = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        related_name="case_participations",
        null=True,
        blank=True,
    )

    def __str__(self):
        return self.name


class Filing(models.Model):
    class PaymentStatus(models.TextChoices):
        PENDING_REVIEW = "pending_review", "Pending review"
        VERIFIED = "verified", "Verified"

    case = models.ForeignKey(CourtCase, on_delete=models.PROTECT, related_name="filings")
    receipt_number = models.CharField(max_length=40, unique=True, default=uuid.uuid4)
    submitted_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="filings",
    )
    fee_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    payment_reference = models.CharField(max_length=120, blank=True)
    payment_status = models.CharField(
        max_length=20,
        choices=PaymentStatus.choices,
        default=PaymentStatus.PENDING_REVIEW,
    )
    payment_proof = models.ForeignKey(
        "CaseDocument",
        on_delete=models.PROTECT,
        related_name="payment_proofs",
        null=True,
        blank=True,
    )
    payment_reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="reviewed_filing_payments",
        null=True,
        blank=True,
    )
    payment_reviewed_at = models.DateTimeField(null=True, blank=True)
    submitted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("-submitted_at",)

    def __str__(self):
        return self.receipt_number


class CaseDocument(models.Model):
    case = models.ForeignKey(CourtCase, on_delete=models.PROTECT, related_name="documents")
    filing = models.ForeignKey(
        Filing,
        on_delete=models.PROTECT,
        related_name="documents",
        null=True,
        blank=True,
    )
    document_type = models.CharField(max_length=120)
    original_filename = models.CharField(max_length=255)
    file = models.FileField(upload_to="case-documents/%Y/%m/")
    sha256_digest = models.CharField(max_length=64)
    size_bytes = models.PositiveBigIntegerField()
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="uploaded_case_documents",
    )
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("-uploaded_at",)

    def save(self, *args, **kwargs):
        if self.pk:
            raise ValueError("Filed documents are immutable.")
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        raise ValueError("Filed documents cannot be deleted.")

    def __str__(self):
        return self.original_filename


class Hearing(models.Model):
    class Status(models.TextChoices):
        SCHEDULED = "Scheduled", "Scheduled"
        COMPLETED = "Completed", "Completed"
        CANCELLED = "Cancelled", "Cancelled"

    case = models.ForeignKey(CourtCase, on_delete=models.PROTECT, related_name="hearings")
    hearing_date = models.DateField()
    hearing_time = models.TimeField()
    courtroom = models.CharField(max_length=80, blank=True)
    purpose = models.CharField(max_length=160)
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.SCHEDULED)
    scheduled_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="scheduled_hearings",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("hearing_date", "hearing_time")

    def __str__(self):
        return f"{self.case.case_number} - {self.hearing_date}"


class CaseEvent(models.Model):
    case = models.ForeignKey(CourtCase, on_delete=models.PROTECT, related_name="events")
    action = models.CharField(max_length=160)
    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="case_events",
    )
    is_public = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("created_at",)

    def save(self, *args, **kwargs):
        if self.pk:
            raise ValueError("Case history events are immutable.")
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        raise ValueError("Case history events cannot be deleted.")

    def __str__(self):
        return f"{self.case.case_number}: {self.action}"


class Notification(models.Model):
    class Channel(models.TextChoices):
        IN_APP = "in_app", "In-app"
        EMAIL = "email", "Email"
        SMS = "sms", "SMS"

    class DeliveryStatus(models.TextChoices):
        PENDING = "pending", "Pending"
        SENT = "sent", "Sent"
        FAILED = "failed", "Failed"
        NOT_CONFIGURED = "not_configured", "Not configured"

    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="notifications",
    )
    case = models.ForeignKey(
        CourtCase,
        on_delete=models.CASCADE,
        related_name="notifications",
        null=True,
        blank=True,
    )
    title = models.CharField(max_length=160)
    message = models.TextField(max_length=1000)
    channel = models.CharField(max_length=16, choices=Channel.choices, default=Channel.IN_APP)
    delivery_status = models.CharField(
        max_length=20,
        choices=DeliveryStatus.choices,
        default=DeliveryStatus.PENDING,
    )
    email_delivery_status = models.CharField(
        max_length=20,
        choices=DeliveryStatus.choices,
        default=DeliveryStatus.NOT_CONFIGURED,
    )
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    delivered_at = models.DateTimeField(null=True, blank=True)
    email_delivered_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ("-created_at",)

    def __str__(self):
        return f"{self.title} ({self.recipient})"
