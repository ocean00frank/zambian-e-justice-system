from rest_framework.routers import DefaultRouter
from django.urls import include, path

from .views import (
    CaseDocumentListView,
    CaseViewSet,
    DashboardSummaryView,
    DocumentDownloadView,
    FilingCreateView,
    FilingReceiptView,
    HealthCheckView,
    HearingViewSet,
    NotificationViewSet,
    PublicCaseTrackView,
)

router = DefaultRouter()
router.register("cases", CaseViewSet, basename="case")
router.register("hearings", HearingViewSet, basename="hearing")
router.register("notifications", NotificationViewSet, basename="notification")

urlpatterns = [
    path("cases/track/", PublicCaseTrackView.as_view(), name="public-case-track"),
    path("", include(router.urls)),
    path("health/", HealthCheckView.as_view(), name="api-health"),
    path("filings/", FilingCreateView.as_view(), name="filing-create"),
    path(
        "filings/receipts/<str:receipt_number>/",
        FilingReceiptView.as_view(),
        name="filing-receipt",
    ),
    path("documents/", CaseDocumentListView.as_view(), name="document-list"),
    path(
        "documents/<int:document_id>/download/",
        DocumentDownloadView.as_view(),
        name="document-download",
    ),
    path("dashboard/summary/", DashboardSummaryView.as_view(), name="dashboard-summary"),
]
