import Link from "next/link";
import { API_BASE_URL } from "@/components/api";
import { PortalHeader } from "@/components/portal-header";

export default function AdminPage() {
  return (
    <>
      <PortalHeader backHref="/" backLabel="Home" />
      <main className="min-h-[calc(100vh-73px)] bg-[#f8f8f4] px-5 py-12 sm:px-8">
        <section className="mx-auto max-w-2xl border border-[#173b30]/10 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Administration</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">Manage user accounts</h1>
          <p className="mt-4 text-sm leading-6 text-slate-600">
            User accounts and assigned roles are managed in Django admin. Sign in there with your superuser account.
          </p>
          <Link
            href={`${API_BASE_URL}/admin/`}
            className="mt-6 inline-flex min-h-11 items-center rounded-lg bg-[#173b30] px-5 text-sm font-semibold text-white transition hover:bg-[#0f2d23]"
          >
            Open Django admin
          </Link>
        </section>
      </main>
    </>
  );
}
