import Link from "next/link";
import { DashboardShell } from "@/components/dashboard-shell";
import { justiceCases, notificationItems } from "@/components/mock-data";

const navItems = [
  { label: "Dashboard", href: "/dashboards/registry", active: true },
  { label: "Incoming Filings", href: "/e-filing" },
  { label: "Case Records", href: "/cases" },
  { label: "Cause List", href: "/cause-list" },
  { label: "Documents", href: "/documents" },
  { label: "Notifications", href: "/notifications" },
];

function StatusBadge({ status }: { status: string }) {
  const palette = {
    "Hearing Scheduled": "bg-amber-100 text-amber-700",
    Assigned: "bg-blue-100 text-blue-700",
    Registered: "bg-emerald-100 text-emerald-700",
    Filed: "bg-slate-200 text-slate-700",
  };

  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${palette[status as keyof typeof palette] ?? "bg-slate-200 text-slate-700"}`}>{status}</span>;
}

export default function RegistryDashboardPage() {
  return (
    <DashboardShell title="Court Registry Dashboard" subtitle="Registry workflow and scheduling" role="Registry" navItems={navItems}>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Incoming filings", value: "8", note: "Review due today" },
          { label: "Registered cases", value: "42", note: "Live active record" },
          { label: "Hearing dates", value: "17", note: "Scheduled this week" },
          { label: "Notifications", value: "5", note: "Awaiting action" },
        ].map((item) => (
          <div key={item.label} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">{item.label}</p>
            <p className="mt-4 text-4xl font-bold text-slate-900">{item.value}</p>
            <p className="mt-2 text-xs uppercase tracking-[0.18em] text-slate-400">{item.note}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-xl font-semibold text-slate-900">Incoming filings</h3>
            <Link href="/e-filing" className="text-sm font-semibold text-emerald-700">Review queue</Link>
          </div>

          <div className="space-y-4">
            {justiceCases.map((item) => (
              <div key={item.id} className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-semibold text-slate-900">{item.id}</span>
                    <StatusBadge status={item.status} />
                  </div>
                  <p className="mt-2 text-sm text-slate-600">{item.title}</p>
                </div>

                <div className="text-sm text-slate-500">
                  <p>Filed: {item.filingDate}</p>
                  <p className="mt-1">Court: {item.court}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-slate-900">Recent updates</h3>
          <div className="mt-5 space-y-4">
            {notificationItems.slice(0, 4).map((item) => (
              <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-800">{item.title}</p>
                <p className="mt-1 text-sm text-slate-600">{item.description}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}
