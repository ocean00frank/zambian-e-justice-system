import hashlib
import logging
from hmac import compare_digest
from io import BytesIO

from cryptography.exceptions import InvalidTag
from django.http import FileResponse, Http404
from django.db.models import Q
from django.utils import timezone
from rest_framework import generics, mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.generics import GenericAPIView
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from auth_app.models import User

from .crypto import decrypt_document
from .models import CaseDocument, CaseEvent, CaseParty, CourtCase, Filing, Hearing, Notification
from .permissions import IsJudicialOrRegistry, IsRegistry
from .serializers import (
    AssignCaseSerializer,
    CaseDocumentSerializer,
    CaseDetailSerializer,
    CaseListSerializer,
    CaseStatusSerializer,
    FilingCreateSerializer,
    FilingReceiptSerializer,
    HearingSerializer,
    LinkPartyAccountSerializer,
    NotificationSerializer,
    PublicCaseSerializer,
)
from .services import (
    accessible_cases,
    assign_case,
    create_notification,
    update_case_status,
)

logger = logging.getLogger(__name__)


class CaseViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        queryset = accessible_cases(self.request.user).select_related(
            "practitioner",
            "assigned_officer",
        ).prefetch_related("parties", "documents", "hearings", "events")
        search = self.request.query_params.get("search", "").strip()
        if search:
            queryset = queryset.filter(
                Q(case_number__icontains=search)
                | Q(title__icontains=search)
                | Q(parties__name__icontains=search)
            ).distinct()
        case_status = self.request.query_params.get("status")
        if case_status:
            queryset = queryset.filter(status=case_status)
        filing_date = self.request.query_params.get("filing_date")
        if filing_date:
            queryset = queryset.filter(filing_date=filing_date)
        return queryset

    def get_serializer_class(self):
        if self.action == "retrieve":
            return CaseDetailSerializer
        if self.action == "update_status":
            return CaseStatusSerializer
        if self.action == "assign":
            return AssignCaseSerializer
        return CaseListSerializer

    @action(
        detail=True,
        methods=("post",),
        permission_classes=(IsJudicialOrRegistry,),
        url_path="status",
    )
    def update_status(self, request, pk=None):
        case = self.get_object()
        serializer = CaseStatusSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        case = update_case_status(
            case=case,
            status=serializer.validated_data["status"],
            actor=request.user,
        )
        return Response(CaseDetailSerializer(case, context=self.get_serializer_context()).data)

    @action(
        detail=True,
        methods=("post",),
        permission_classes=(IsRegistry,),
        url_path="assign",
    )
    def assign(self, request, pk=None):
        case = self.get_object()
        serializer = AssignCaseSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        case = assign_case(
            case=case,
            officer=serializer.validated_data["assigned_officer"],
            actor=request.user,
        )
        return Response(CaseDetailSerializer(case, context=self.get_serializer_context()).data)

    @action(
        detail=True,
        methods=("post",),
        permission_classes=(IsRegistry,),
        url_path=r"parties/(?P<party_id>[^/.]+)/link-account",
    )
    def link_party_account(self, request, pk=None, party_id=None):
        case = self.get_object()
        party = CaseParty.objects.filter(case=case, pk=party_id).first()
        if party is None:
            raise Http404("Case party was not found.")
        serializer = LinkPartyAccountSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        account = serializer.validated_data["account"]
        party.account = account
        party.save(update_fields=("account",))
        CaseEvent.objects.create(
            case=case,
            action="Litigant account linked to a case party",
            actor=request.user,
            is_public=False,
        )
        create_notification(
            account,
            "Case linked to your account",
            f"You have been linked to case {case.case_number}.",
            case,
        )
        return Response(CaseDetailSerializer(case, context=self.get_serializer_context()).data)


class PublicCaseTrackView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, request):
        case_number = request.query_params.get("case_number", "").strip()
        if not case_number:
            return Response(
                {"case_number": ["This query parameter is required."]},
                status=status.HTTP_400_BAD_REQUEST,
            )
        case = (
            CourtCase.objects.filter(
                case_number__iexact=case_number,
                is_publicly_trackable=True,
            )
            .prefetch_related("events", "hearings")
            .first()
        )
        if case is None:
            raise Http404("No publicly trackable case was found.")
        return Response(PublicCaseSerializer(case).data)


class FilingCreateView(GenericAPIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    serializer_class = FilingCreateSerializer

    def post(self, request):
        if request.user.role != User.Role.LAWYER and not request.user.is_superuser:
            raise PermissionDenied("Only lawyers may submit e-filings.")
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            filing = serializer.save()
        except ValueError as exc:
            return Response({"document": [str(exc)]}, status=status.HTTP_400_BAD_REQUEST)
        return Response(
            FilingReceiptSerializer(filing).data,
            status=status.HTTP_201_CREATED,
        )


class FilingReceiptView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, receipt_number):
        filing = (
            Filing.objects.select_related("case")
            .filter(receipt_number=receipt_number)
            .first()
        )
        if filing is None:
            raise Http404("Filing receipt was not found.")
        if not accessible_cases(request.user).filter(pk=filing.case_id).exists():
            raise Http404("Filing receipt was not found.")
        return Response(FilingReceiptSerializer(filing).data)


class CaseDocumentListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = CaseDocumentSerializer

    def get_queryset(self):
        documents = CaseDocument.objects.filter(
            case__in=accessible_cases(self.request.user)
        ).select_related("case", "uploaded_by")
        case_number = self.request.query_params.get("case_number")
        if case_number:
            documents = documents.filter(case__case_number__iexact=case_number.strip())
        return documents


class DocumentDownloadView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, document_id):
        document = (
            CaseDocument.objects.select_related("case")
            .filter(pk=document_id, case__in=accessible_cases(request.user))
            .first()
        )
        if document is None:
            raise Http404("Document was not found.")
        try:
            with document.file.open("rb") as stored_file:
                plaintext = decrypt_document(stored_file.read())
        except (InvalidTag, ValueError):
            logger.exception("Encrypted document integrity check failed for id %s", document.pk)
            return Response(
                {"detail": "The document could not be verified."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
        if not compare_digest(hashlib.sha256(plaintext).hexdigest(), document.sha256_digest):
            logger.error("Document digest mismatch for document id %s", document.pk)
            return Response(
                {"detail": "The document could not be verified."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        response = FileResponse(
            BytesIO(plaintext),
            as_attachment=True,
            filename=document.original_filename,
            content_type="application/pdf",
        )
        response["Cache-Control"] = "private, no-store"
        response["X-Content-Type-Options"] = "nosniff"
        return response


class HearingViewSet(
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    viewsets.GenericViewSet,
):
    permission_classes = [IsAuthenticated]
    serializer_class = HearingSerializer

    def get_queryset(self):
        queryset = Hearing.objects.filter(
            case__in=accessible_cases(self.request.user)
        ).select_related("case", "scheduled_by")
        day = self.request.query_params.get("date")
        if day:
            queryset = queryset.filter(hearing_date=day)
        if self.request.query_params.get("upcoming", "").lower() in {"true", "1", "yes"}:
            queryset = queryset.filter(
                hearing_date__gte=timezone.localdate(),
                status=Hearing.Status.SCHEDULED,
            )
        return queryset

    def perform_create(self, serializer):
        if not (
            self.request.user.is_superuser
            or self.request.user.role
            in {User.Role.REGISTRY, User.Role.JUDGE}
        ):
            raise PermissionDenied("Only registry staff or judges may schedule hearings.")
        serializer.save()


class NotificationViewSet(
    mixins.ListModelMixin,
    mixins.UpdateModelMixin,
    viewsets.GenericViewSet,
):
    permission_classes = [IsAuthenticated]
    serializer_class = NotificationSerializer
    http_method_names = ["get", "patch", "head", "options"]

    def get_queryset(self):
        queryset = Notification.objects.filter(recipient=self.request.user)
        unread = self.request.query_params.get("unread")
        if unread and unread.lower() in {"true", "1", "yes"}:
            queryset = queryset.filter(is_read=False)
        return queryset

    def update(self, request, *args, **kwargs):
        notification = self.get_object()
        is_read = request.data.get("is_read")
        if not isinstance(is_read, bool):
            return Response(
                {"is_read": ["A boolean value is required."]},
                status=status.HTTP_400_BAD_REQUEST,
            )
        notification.is_read = is_read
        notification.save(update_fields=("is_read",))
        return Response(self.get_serializer(notification).data)


class DashboardSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        cases = accessible_cases(request.user)
        upcoming = Hearing.objects.filter(
            case__in=cases,
            hearing_date__gte=timezone.localdate(),
            status=Hearing.Status.SCHEDULED,
        )
        data = {
            "active_cases": cases.exclude(status=CourtCase.Status.CONCLUDED).count(),
            "pending_filings": cases.filter(status=CourtCase.Status.FILED).count(),
            "upcoming_hearings": upcoming.count(),
            "unread_notifications": request.user.notifications.filter(is_read=False).count(),
        }
        if request.user.role in {User.Role.REGISTRY} or request.user.is_superuser:
            data["incoming_filings"] = Filing.objects.filter(
                case__status=CourtCase.Status.FILED
            ).count()
        return Response(data)


class HealthCheckView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, request):
        return Response({"status": "ok"})


class JudicialOfficerListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not (request.user.is_superuser or request.user.role == User.Role.REGISTRY):
            raise PermissionDenied("Only Registry staff may view assignable judges.")
        officers = User.objects.filter(
            role=User.Role.JUDGE,
            is_active=True,
        ).order_by("last_name", "first_name", "username")
        return Response(
            [
                {
                    "id": officer.pk,
                    "full_name": officer.get_full_name() or officer.username,
                }
                for officer in officers
            ]
        )
