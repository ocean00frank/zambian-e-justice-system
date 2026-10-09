"use client";

import Link from "next/link";
import { DashboardShell } from "@/components/dashboard-shell";
import { HearingCountdown } from "@/components/hearing-countdown";
import { formatDate, roleLabelByRole } from "@/components/api";
import { useRoleDashboard } from "@/components/use-role-dashboard";

export default function LitigantDashboardPage() {
  const { data, error, loading, retry } = useRoleDashboard("litigant");
  const userName = data?.user.full_name || data?.user.username || "Account";

  return (
    <DashboardShell
      title="Litigant dashboard"
      subtitle="Your cases and court updates"
      role={roleLabelByRole.litigant}
      userName={userName}
      navItems={[
        { label: "Dashboard", href: "/dashboards/litigant", active: true },
        { label: "My Cases", href: "/cases" },
        { label: "Cause List", href: "/cause-list" },
        { label: "Documents", href: "/documents" },
        { label: "Notifications", href: "/notifications" },
      ]}
    >
      <div className="space-y-8">
        <div>
          <p className="text-sm font-medium text-emerald-700">Litigant portal</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">
            Welcome, {data?.user.full_name?.trim().split(/\s+/)[0] || data?.user.username || "…"}
          </h1>
          <p className="mt-2 text-slate-600">Cases linked to your account and their latest updates.</p>
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

        <section aria-label="Your case summary" className="grid gap-4 sm:grid-cols-3">
          {[
            { label: "Active cases", value: data?.summary.active_cases },
            { label: "Upcoming hearings", value: data?.summary.upcoming_hearings },
          ].map((metric) => (
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
              <h2 className="font-semibold text-slate-900">Your cases</h2>
              <p className="mt-1 text-sm text-slate-500">Only cases linked to your account are shown.</p>
            </div>
            <Link href="/cases" className="text-sm font-semibold text-emerald-700">View all</Link>
          </div>
          {loading ? (
            <p className="px-5 py-8 text-sm text-slate-500">Loading your cases…</p>
          ) : data?.cases.length ? (
            <div className="divide-y divide-slate-100">
              {data.cases.map((item) => (
                <article key={item.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                  <div>
                    <p className="font-medium text-slate-900">{item.case_number}</p>
                    <p className="mt-1 text-sm text-slate-500">{item.court} · {item.case_type}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-slate-800">{item.status}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      Next hearing: {item.next_hearing ? formatDate(item.next_hearing.date) : "Not scheduled"}
                    </p>
                    {item.next_hearing && (
                      <HearingCountdown
                        date={item.next_hearing.date}
                        time={item.next_hearing.time}
                        className="mt-1 text-xs font-medium text-emerald-700"
                      />
                    )}
                  </div>
                </article>
              ))}
            </div>
          ) : error ? null : (
            <p className="px-5 py-8 text-center text-sm text-slate-500">No cases are linked to your account yet.</p>
          )}
        </section>
      </div>
    </DashboardShell>
  );
}
