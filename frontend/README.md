# E-Justice frontend

The E-Justice frontend is a Next.js application for lawyers, judges, registry
staff, litigants, and public case tracking.

## Run locally

From this directory, create `.env.local` with the backend API URL:

```dotenv
NEXT_PUBLIC_BACKEND_URL=http://127.0.0.1:8000
```

Install dependencies and start the development server:

```powershell
npm install
npm run dev
```

Open `http://localhost:3000`. The Django backend must also be running; follow
the complete setup instructions in the repository
[`README.md`](../README.md).

The frontend uses the account's role returned by the backend to route signed-in
users to their dashboard. Do not put passwords, API secrets, or other private
credentials in `NEXT_PUBLIC_` environment variables.

## Checks

```powershell
npm run lint
npm run build
```
