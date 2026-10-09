"use client";

import Link from "next/link";
import { DashboardShell } from "@/components/dashboard-shell";
import { HearingCountdown } from "@/components/hearing-countdown";
import { formatDate, roleLabelByRole } from "@/components/api";
import { useRoleDashboard } from "@/components/use-role-dashboard";

export default function RegistryDashboardPage() {
  const { data, error, loading, retry } = useRoleDashboard("registry");
  const metrics = [
    { label: "Incoming filings", value: data?.summary.incoming_filings },
    { label: "Active case records", value: data?.summary.active_cases },
    { label: "Upcoming hearings", value: data?.summary.upcoming_hearings },
  ];
  const userName = data?.user.full_name || data?.user.username || "Account";
  const incomingCases = data?.cases.filter((item) => item.status === "Filed") ?? [];

  return (
    <DashboardShell
      title="Registry dashboard"
      subtitle="Filings, records, and scheduling"
      role={roleLabelByRole.registry}
      userName={userName}
      navItems={[
        { label: "Dashboard", href: "/dashboards/registry", active: true },
        { label: "Register Cases", href: "/dashboards/registry/register" },
        { label: "Case Records", href: "/cases" },
        { label: "Cause List", href: "/cause-list" },
        { label: "Documents", href: "/documents" },
        { label: "Notifications", href: "/notifications" },
      ]}
    >
      <div className="space-y-8">
        <div>
          <p className="text-sm font-medium text-emerald-700">Registry portal</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">
            Welcome, {data?.user.full_name?.trim().split(/\s+/)[0] || data?.user.username || "…"}
          </h1>
          <p className="mt-2 text-slate-600">Current filing activity and court records.</p>
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

        <section aria-label="Registry summary" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {metrics.map((metric) => (
            <article key={metric.label} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-medium text-slate-600">{metric.label}</p>
              <p className="mt-3 text-3xl font-semibold text-slate-900">
                {loading ? <span className="animate-pulse text-slate-300">…</span> : data ? metric.value ?? 0 : "—"}
              </p>
            </article>
          ))}
        </section>

        <div className="grid gap-6 xl:grid-cols-2">
          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <h2 className="font-semibold text-slate-900">Incoming filings</h2>
                <p className="mt-1 text-sm text-slate-500">Recently filed cases awaiting registry processing</p>
              </div>
              <Link href="/dashboards/registry/register" className="text-sm font-semibold text-emerald-700">Register a case</Link>
            </div>
            {loading ? (
              <p className="px-5 py-8 text-sm text-slate-500">Loading filings…</p>
            ) : incomingCases.length ? (
              <div className="divide-y divide-slate-100">
                {incomingCases.slice(0, 5).map((item) => (
                  <article key={item.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                    <div>
                      <p className="font-medium text-slate-900">{item.case_number} · {item.title}</p>
                      <p className="mt-1 text-sm text-slate-500">{item.court} · {item.case_type}</p>
                    </div>
                    <p className="text-sm text-slate-500">Filed {formatDate(item.filing_date)}</p>
                    <Link href={`/dashboards/registry/register?case=${item.id}`} className="text-sm font-semibold text-emerald-700">Review</Link>
                  </article>
                ))}
              </div>
            ) : error ? null : (
              <p className="px-5 py-8 text-center text-sm text-slate-500">No incoming filings.</p>
            )}
          </section>

          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <h2 className="font-semibold text-slate-900">Upcoming hearings</h2>
                <p className="mt-1 text-sm text-slate-500">Scheduled across accessible case records</p>
              </div>
              <Link href="/cause-list" className="text-sm font-semibold text-emerald-700">Cause list</Link>
            </div>
            {loading ? (
              <p className="px-5 py-8 text-sm text-slate-500">Loading hearings…</p>
            ) : data?.hearings.filter((hearing) => hearing.status === "Scheduled").length ? (
              <div className="divide-y divide-slate-100">
                {data.hearings.filter((hearing) => hearing.status === "Scheduled").slice(0, 5).map((hearing) => (
                  <article key={hearing.id} className="px-5 py-4">
                    <p className="font-medium text-slate-900">{hearing.case_number} · {hearing.purpose}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {formatDate(hearing.hearing_date)} · {hearing.hearing_time}
                      {hearing.courtroom ? ` · ${hearing.courtroom}` : ""}
                    </p>
                    <HearingCountdown
                      date={hearing.hearing_date}
                      time={hearing.hearing_time}
                      className="mt-1 text-xs font-medium text-emerald-700"
                    />
                  </article>
                ))}
              </div>
            ) : error ? null : (
              <p className="px-5 py-8 text-center text-sm text-slate-500">No upcoming hearings are scheduled.</p>
            )}
          </section>
        </div>
      </div>
    </DashboardShell>
  );
}
