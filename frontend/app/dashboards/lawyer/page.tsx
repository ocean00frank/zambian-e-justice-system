"use client";

import Link from "next/link";
import { DashboardShell } from "@/components/dashboard-shell";
import { formatDate, roleLabelByRole } from "@/components/api";
import { useRoleDashboard } from "@/components/use-role-dashboard";

export default function LawyerDashboard() {
  const { data, error, loading, retry } = useRoleDashboard("lawyer");

  const metrics = [
    { label: "Active cases", value: data?.summary.active_cases },
    { label: "Pending filings", value: data?.summary.pending_filings },
    { label: "Upcoming hearings", value: data?.summary.upcoming_hearings },
    { label: "Unread notifications", value: data?.summary.unread_notifications },
  ];
  const userName = data?.user.full_name || data?.user.username || "Account";

  return (
    <DashboardShell
      title="Lawyer dashboard"
      subtitle="Your casework overview"
      role={roleLabelByRole.lawyer}
      userName={userName}
      navItems={[
        { label: "Dashboard", href: "/dashboards/lawyer", active: true },
        { label: "My Cases", href: "/cases" },
        { label: "E-Filing", href: "/e-filing" },
        { label: "Cause List", href: "/cause-list" },
        { label: "Documents", href: "/documents" },
        { label: "Notifications", href: "/notifications" },
      ]}
    >
      <div className="space-y-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-emerald-700">Lawyer portal</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">
              Welcome, {data?.user.full_name?.trim().split(/\s+/)[0] || data?.user.username || "…"}
            </h1>
            <p className="mt-2 text-slate-600">Your cases and court activity, in one place.</p>
          </div>
          <Link
            href="/e-filing"
            className="rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800"
          >
            File a case
          </Link>
        </div>

        {error && (
          <section role="alert" className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-950">
            <p>{error}</p>
            {error.includes("sign in") || error.includes("session has expired") ? (
              <Link href="/login" className="font-semibold underline underline-offset-4">Go to sign in</Link>
            ) : (
              <button type="button" onClick={retry} className="font-semibold underline underline-offset-4">Try again</button>
            )}
          </section>
        )}

        <section aria-label="Casework summary" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => (
            <article key={metric.label} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-medium text-slate-600">{metric.label}</p>
              <p className="mt-3 text-3xl font-semibold text-slate-900">
                {loading ? <span className="animate-pulse text-slate-300">…</span> : data ? metric.value ?? 0 : "—"}
              </p>
            </article>
          ))}
        </section>

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div>
              <h2 className="font-semibold text-slate-900">Recent cases</h2>
              <p className="mt-1 text-sm text-slate-500">Latest matters linked to your account</p>
            </div>
            <Link href="/cases" className="text-sm font-semibold text-emerald-700 hover:text-emerald-900">View all</Link>
          </div>
          {loading ? (
            <p className="px-5 py-8 text-sm text-slate-500">Loading cases…</p>
          ) : data?.cases.length ? (
            <div className="divide-y divide-slate-100">
              {data.cases.map((item) => (
                <article key={item.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-slate-900">{item.title}</p>
                    <p className="mt-1 text-sm text-slate-500">{item.case_number} · {item.case_type} · {item.court}</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-800">{item.status}</span>
                    <p className="mt-1 text-xs text-slate-500">
                      Hearing: {item.next_hearing ? formatDate(item.next_hearing.date) : "Not scheduled"}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          ) : error ? null : (
            <div className="px-5 py-8 text-center">
              <p className="font-medium text-slate-800">No cases yet</p>
              <p className="mt-1 text-sm text-slate-500">Cases filed or assigned to you will appear here.</p>
            </div>
          )}
        </section>

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="font-semibold text-slate-900">Notifications</h2>
            <p className="mt-1 text-sm text-slate-500">Updates for your account</p>
          </div>
          {loading ? (
            <p className="px-5 py-8 text-sm text-slate-500">Loading notifications…</p>
          ) : data?.notifications.length ? (
            <div className="divide-y divide-slate-100">
              {data.notifications.slice(0, 4).map((notification) => (
                <article key={notification.id} className="flex gap-3 px-5 py-4">
                  <span aria-hidden="true" className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${notification.is_read ? "bg-slate-300" : "bg-emerald-600"}`} />
                  <div className="min-w-0">
                    <p className="font-medium text-slate-900">{notification.title}</p>
                    <p className="mt-1 text-sm text-slate-600">{notification.message}</p>
                  </div>
                </article>
              ))}
            </div>
          ) : error ? null : (
            <p className="px-5 py-8 text-center text-sm text-slate-500">No notifications yet.</p>
          )}
        </section>
      </div>
    </DashboardShell>
  );
}
