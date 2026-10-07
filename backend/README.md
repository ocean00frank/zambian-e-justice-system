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
Legal Practitioner, Judicial Officer, Court Registry, and Litigant accounts
must be provisioned by an administrator. A superuser has administrator access.

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
| GET | `/api/cases/` | Authenticated, role-filtered; `search` and `filing_date` filters |
| GET | `/api/cases/{id}/` | Authenticated, role-filtered |
| POST | `/api/cases/{id}/status/` | Judicial Officer or Court Registry |
| POST | `/api/cases/{id}/assign/` | Court Registry |
| POST | `/api/cases/{id}/parties/{party_id}/link-account/` | Court Registry; link a provisioned Litigant account |
| GET | `/api/cases/track/?case_number=...` | Public, only explicitly public-trackable cases |
| POST | `/api/filings/` | Legal Practitioner; multipart PDF |
| GET | `/api/filings/receipts/{receipt_number}/` | Authenticated case participant or court role |
| GET | `/api/documents/` | Authenticated, role-filtered |
| GET | `/api/documents/{id}/download/` | Authorized case participant or court role |
| GET, POST | `/api/hearings/` | Authenticated read; court roles may schedule |
| GET | `/api/notifications/` | Current user's notifications |
| PATCH | `/api/notifications/{id}/` | Mark current user's notification read/unread |
| GET | `/api/dashboard/summary/` | Authenticated, role-filtered counts |

An e-filing sends `court`, `title`, `case_type`, `document_type`, `parties` (JSON
array), and `document` as multipart fields. Only PDF files up to 10 MB are
accepted. Each submission creates a case number and timestamped receipt.
Documents are stored encrypted using AES-256-GCM; downloads require case access
and pass an authenticated integrity check. Case documents and audit events
cannot be edited or deleted through the API or Django admin.

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
