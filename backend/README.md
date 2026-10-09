# Zambian E-Justice backend

Django REST API for provisioned-user authentication, electronic filing, case
tracking, controlled document access, case assignment, hearing schedules, and
in-app/email notifications.

## Local setup

From `backend/` in PowerShell:

```powershell
.\venv_backend\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver 0.0.0.0:8000
```

Copy `.env.example` to `.env` only if you need a fresh local configuration.
Keep the existing `.env` private. `SECRET_KEY` must remain stable while
encrypted documents exist; changing it prevents their decryption. `DB_NAME`
selects PostgreSQL using the `DB_*` variables; leave it unset for local SQLite.
Production deployments must use HTTPS, a durable private media volume, backups,
and a stable secret key. When `DEBUG=false`, HTTPS redirection and secure
session/CSRF cookies are enabled and cannot be disabled through environment
settings. If TLS terminates at a trusted reverse proxy, set
`TRUST_X_FORWARDED_PROTO=true` only when that proxy strips and replaces
`X-Forwarded-Proto`; otherwise clients could spoof HTTPS. For local HTTP
development, explicitly set `DEBUG=true` in the private `.env` file.

Use the Django superuser account at `/admin/` to create and manage user accounts
and assign roles. Public account registration is intentionally not provided.
Lawyer (`lawyer`), Judge (`judge`), Registry
(`registry`), and Litigant (`litigant`) accounts must be provisioned by
an administrator. A superuser has administrator access; this is separate from
the account's application role.

## API

Authenticated endpoints use DRF token authentication:

```http
Authorization: Token <token>
```

| Method | Endpoint | Access |
|---|---|---|
| POST | `/api/auth/login/` | Public; username or email and password |
| POST | `/api/auth/logout/` | Authenticated |
| GET | `/api/auth/me/` | Authenticated |
| GET | `/api/health/` | Public |
| GET | `/api/cases/` | Authenticated, role-filtered; `search`, `status`, and `filing_date` filters |
| GET | `/api/cases/{id}/` | Authenticated, role-filtered |
| POST | `/api/cases/{id}/status/` | Judge or Registry |
| POST | `/api/cases/{id}/payment-review/` | Registry; verifies submitted fee evidence |
| POST | `/api/cases/{id}/assign/` | Registry |
| POST | `/api/cases/{id}/parties/{party_id}/link-account/` | Registry; link a provisioned Litigant account |
| GET | `/api/cases/track/?case_number=...` | Public for explicitly public-trackable cases; authenticated case stakeholders can also track their own cases |
| POST | `/api/filings/` | Lawyer; multipart PDF |
| GET | `/api/filings/receipts/{receipt_number}/` | Authenticated case participant or court role |
| GET | `/api/documents/` | Authenticated, role-filtered |
| GET | `/api/documents/{id}/download/` | Authorized case participant or court role |
| GET, POST | `/api/hearings/` | Authenticated read; court roles may schedule; supports `date` and `upcoming=true` filters |
| GET | `/api/notifications/` | Current user's notifications |
| PATCH | `/api/notifications/{id}/` | Mark current user's notification read/unread |
| GET | `/api/dashboard/summary/` | Authenticated, role-filtered counts |
| GET | `/api/judicial-officers/` | Registry only; active judges available for case assignment |

An e-filing sends `court`, `court_division`, `title`, `case_type`,
`document_type`, `parties` (JSON array), `document`, `fee_amount`,
`payment_reference`, and `payment_proof` as multipart fields. The filing
document must be a PDF; payment proof may be a PDF, JPG, or PNG. Each file is
limited to 10 MB. Each submission creates a case number and timestamped
receipt. Fee amounts are entered by the Lawyer and are not calculated by the
system because fees vary by court/division and filing process. Registry must
review the proof before the case can be marked Registered. The submission
receipt is not a court acceptance or a confirmation that the amount is correct.
Documents are stored encrypted using AES-256-GCM; downloads require case access
and pass an authenticated integrity check. Case documents and audit events
cannot be edited or deleted through the API or Django admin.

Case tracking returns only the case number, court, case type, filing date,
status, next scheduled hearing, and progress timeline. Public visitors can see
only cases explicitly enabled for public tracking. Authenticated lawyers,
litigants, judges, and Registry users can track private cases only when the
case is within their existing role-based access. The tracking page refreshes
progress every 15 seconds while visible and on returning to the page; it does
not expose filing documents, parties, or payment evidence.

In-app notifications are always recorded. Email delivery is enabled when SMTP
settings are supplied. SMS delivery requires an SMS provider and is not enabled
by this backend configuration.

The frontend development origin is allowed by default at `http://localhost:3000`;
set `CORS_ALLOWED_ORIGINS` to the deployed frontend origin in production.

Run backend checks and API tests with:

```powershell
python manage.py check --settings=test_settings
python manage.py test auth_app cases --settings=test_settings
```
