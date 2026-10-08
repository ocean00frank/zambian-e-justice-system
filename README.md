# Zambian E-Justice System

The **Zambian E-Justice System** is a web-based court services platform for
electronic filing, case management, hearing schedules, notifications, and public
case tracking.

The project consists of two main parts:

- **Backend** – Built with Django and Django REST Framework. It provides the
  API, role-based access, filing workflows, and database integration.
- **Frontend** – Built with Next.js. It provides the interface for lawyers,
  judges, registry staff, litigants, and public case tracking.

This guide explains how to set up and run the project locally after cloning
the repository.

---

## 1. Prerequisites

Before setting up the project, install:

- **Python 3.12 or later**
- **Node.js and npm**
- **Git**
- **PostgreSQL** (optional; SQLite is used by default for local development)
- A code editor such as **Visual Studio Code**

Verify the installations in PowerShell:

```powershell
python --version
node --version
npm --version
git --version
```

If you plan to use PostgreSQL, also check:

```powershell
psql --version
```

---

## 2. Clone the repository

Clone the repository:

```powershell
git clone <YOUR_REPOSITORY_URL>
```

Navigate into the project:

```powershell
cd zambian-e-justice-system
```

---

## 3. Create and activate the backend virtual environment

Navigate to the backend directory:

```powershell
cd backend
```

Create the Python virtual environment:

```powershell
python -m venv venv_backend
```

Activate it in PowerShell:

```powershell
.\venv_backend\Scripts\Activate.ps1
```

If PowerShell blocks activation, you can run the environment's Python
executable directly:

```powershell
.\venv_backend\Scripts\python.exe --version
```

---

## 4. Install backend requirements

Make sure you are in the `backend` directory, then install the dependencies:

```powershell
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
```

---

## 5. Create the backend environment file

While inside `backend`, create `.env` from the provided example:

```powershell
Copy-Item .env.example .env
```

Open `backend/.env` and set a private Django secret key. Generate one with:

```powershell
python -c "import secrets; print(secrets.token_urlsafe(64))"
```

The example configuration uses SQLite by default. To use PostgreSQL, set the
database values described in section 6.

Keep `.env` private. Do not commit it or share its credentials. Keep the same
Django secret key while encrypted case documents exist; changing it prevents
those documents from being decrypted.

---

## 6. Set up the database

### SQLite (default)

No separate database server is required. Leave `DB_NAME` blank in
`backend/.env`; Django will use the local SQLite database.

### PostgreSQL (optional)

Make sure PostgreSQL is installed and running, then create a database. Update
the following values in `backend/.env` to match your local database:

```dotenv
DB_NAME=ejustice_db
DB_USER=postgres
DB_PASSWORD=replace-with-your-local-database-password
DB_HOST=localhost
DB_PORT=5432
```

Do not use the example password as a real credential.

---

## 7. Run database migrations and create the administrator

Make sure you are in `backend` and the virtual environment is active. Run:

```powershell
python manage.py migrate
python manage.py createsuperuser
```

The superuser account is used to sign in to Django admin and create the
application's user accounts.

---

## 8. Start the backend server

From the `backend` directory, run:

```powershell
python manage.py runserver
```

The backend will be available at:

```text
http://127.0.0.1:8000
```

Keep this terminal running.

---

## 9. Create user accounts and assign roles

Open Django admin at `http://127.0.0.1:8000/admin/` and sign in with the
superuser credentials. Create user accounts and assign each person their
application role.

The role shown in the interface and its Django role value are:

| Role | Django role value |
|---|---|
| Lawyer | `lawyer` |
| Judge | `judge` |
| Registry | `registry` |
| Litigant | `litigant` |

If the command line prompts for a role while creating a superuser, enter the
role value (for example, `registry`), not `admin`. Administrator access
comes from Django's superuser/staff flags; it is separate from the application
role.

Public account registration is not enabled. Accounts must be created by an
administrator.

---

## 10. Install frontend dependencies

Open a new terminal. From the repository root, navigate to the frontend:

```powershell
cd frontend
```

Install the required Node.js packages:

```powershell
npm install
```

---

## 11. Create the frontend environment file

Inside `frontend`, create `.env.local` with the backend URL:

```dotenv
NEXT_PUBLIC_BACKEND_URL=http://127.0.0.1:8000
```

`NEXT_PUBLIC_API_URL` is supported as a fallback, but
`NEXT_PUBLIC_BACKEND_URL` takes precedence. These variables contain only the
backend address. Do not put passwords, Django secret keys, or private API keys
in variables prefixed with `NEXT_PUBLIC_`.

---

## 12. Start the frontend

Make sure you are inside the `frontend` directory, then run:

```powershell
npm run dev
```

The frontend will be available at:

```text
http://localhost:3000
```

Open this address in your browser to use the system.

---

## 13. Run the complete system

Both servers must run at the same time.

### Backend

Open one terminal:

```powershell
cd backend
.\venv_backend\Scripts\Activate.ps1
python manage.py runserver
```

Backend address: `http://127.0.0.1:8000`

### Frontend

Open a second terminal from the repository root:

```powershell
cd frontend
npm run dev
```

Frontend address: `http://localhost:3000`

Sign in with the account credentials created by the administrator. The system
detects the account's assigned role and redirects the user to the matching
dashboard. The dashboard and case data are loaded from the backend.

---

## 14. Important notes

- If using PostgreSQL, make sure it is running and the database settings in
  `backend/.env` are correct.
- Keep both backend and frontend terminals running while using the system.
- Do not commit `backend/.env` or `frontend/.env.local`; these files may contain
  private configuration.
- The repository ignores environment files and the backend virtual environment.
- For production, set a unique secret key, `DEBUG=false`, valid
  `ALLOWED_HOSTS` and `CORS_ALLOWED_ORIGINS`, and serve the system over HTTPS.
- If TLS terminates at a trusted reverse proxy, set
  `TRUST_X_FORWARDED_PROTO=true` only when the proxy replaces the forwarded
  protocol header.
- Keep private case documents on durable private storage and maintain backups.

For API endpoint details, see [`backend/README.md`](./backend/README.md).
