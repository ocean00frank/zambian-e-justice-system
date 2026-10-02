import Link from "next/link";
import { DashboardShell } from "@/components/dashboard-shell";
import { justiceCases, notificationItems } from "@/components/mock-data";

const navItems = [
  { label: "Dashboard", href: "/dashboards/lawyer", active: true },
  { label: "Cases", href: "/cases" },
  { label: "e-Filing", href: "/e-filing" },
  { label: "Case Tracking", href: "/tracking" },
  { label: "Documents", href: "/documents" },
  { label: "Notifications", href: "/notifications" },
  { label: "Profile", href: "/login" },
];

function StatusBadge({ status }: { status: string }) {
  const palette = {
    "Hearing Scheduled": "bg-amber-100 text-amber-700",
    Assigned: "bg-blue-100 text-blue-700",
    Filed: "bg-slate-200 text-slate-700",
    "Judgment Delivered": "bg-emerald-100 text-emerald-700",
    "Concluded": "bg-emerald-100 text-emerald-700",
  };

  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${palette[status as keyof typeof palette] ?? "bg-slate-200 text-slate-700"}`}>{status}</span>;
}

export default function LawyerDashboardPage() {
  return (
    <DashboardShell title="Legal Practitioner Dashboard" subtitle="Case filings and updates" role="Lawyer" navItems={navItems}>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Active Cases", value: "12", note: "Across 3 courts" },
          { label: "Pending Filings", value: "3", note: "Awaiting registry review" },
          { label: "Upcoming Hearings", value: "4", note: "Next in 10 days" },
          { label: "Notifications", value: "5", note: "Requires attention" },
        ].map((item) => (
          <div key={item.label} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">{item.label}</p>
            <p className="mt-4 text-4xl font-bold text-slate-900">{item.value}</p>
            <p className="mt-2 text-xs uppercase tracking-[0.18em] text-slate-400">{item.note}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-xl font-semibold text-slate-900">My Cases</h3>
            <Link href="/cases" className="text-sm font-semibold text-emerald-700">View all</Link>
          </div>

          <div className="space-y-4">
            {justiceCases.slice(0, 3).map((caseItem) => (
              <div key={caseItem.id} className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-semibold text-slate-900">{caseItem.id}</span>
                    <StatusBadge status={caseItem.status} />
                  </div>
                  <p className="mt-2 text-sm text-slate-600">{caseItem.title}</p>
                </div>

                <div className="text-sm text-slate-500">
                  <p>Next hearing: {caseItem.nextHearing}</p>
                  <p className="mt-1">Court: {caseItem.court}</p>
                </div>

                <Link href={`/cases/${caseItem.id}`} className="inline-flex rounded-full bg-[#1b4d3e] px-4 py-2 text-sm font-semibold text-white">
                  View case
                </Link>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-slate-900">Recent notifications</h3>
          <div className="mt-5 space-y-4">
            {notificationItems.slice(0, 4).map((item) => (
              <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-700">
                    {item.type}
                  </span>
                  <span className="text-xs text-slate-400">{item.time}</span>
                </div>
                <p className="mt-3 text-sm font-semibold text-slate-800">{item.title}</p>
                <p className="mt-1 text-sm text-slate-600">{item.description}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}
