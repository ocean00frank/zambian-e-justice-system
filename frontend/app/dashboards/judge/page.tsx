import Link from "next/link";
import { DashboardShell } from "@/components/dashboard-shell";
import { causeList, justiceCases } from "@/components/mock-data";

const navItems = [
  { label: "Dashboard", href: "/dashboards/judge", active: true },
  { label: "Incoming Cases", href: "/cases" },
  { label: "Case Management", href: "/cases" },
  { label: "Cause List", href: "/cause-list" },
  { label: "Documents", href: "/documents" },
  { label: "Notifications", href: "/notifications" },
];

function StatusBadge({ status }: { status: string }) {
  const palette = {
    "Hearing Scheduled": "bg-amber-100 text-amber-700",
    Assigned: "bg-blue-100 text-blue-700",
    "Judgment Delivered": "bg-emerald-100 text-emerald-700",
    Filed: "bg-slate-200 text-slate-700",
  };

  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${palette[status as keyof typeof palette] ?? "bg-slate-200 text-slate-700"}`}>{status}</span>;
}

export default function JudgeDashboardPage() {
  return (
    <DashboardShell title="Judicial Officer Dashboard" subtitle="Assigned and incoming matters" role="Judge" navItems={navItems}>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Assigned Cases", value: "9", note: "3 active hearings" },
          { label: "Incoming Filings", value: "6", note: "New this week" },
          { label: "Scheduled Hearings", value: "11", note: "Across courts" },
          { label: "Pending Review", value: "2", note: "Waiting on registry" },
        ].map((item) => (
          <div key={item.label} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">{item.label}</p>
            <p className="mt-4 text-4xl font-bold text-slate-900">{item.value}</p>
            <p className="mt-2 text-xs uppercase tracking-[0.18em] text-slate-400">{item.note}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-xl font-semibold text-slate-900">Assigned cases</h3>
            <Link href="/cases" className="text-sm font-semibold text-emerald-700">Open case register</Link>
          </div>

          <div className="space-y-4">
            {justiceCases.map((item) => (
              <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-semibold text-slate-900">{item.id}</span>
                      <StatusBadge status={item.status} />
                    </div>
                    <p className="mt-2 text-sm text-slate-600">{item.title}</p>
                  </div>
                  <div className="text-sm text-slate-500">
                    <p>Next hearing: {item.nextHearing}</p>
                    <p className="mt-1">Assigned to: {item.assignedTo}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-slate-900">Cause list</h3>
          <div className="mt-5 space-y-4">
            {causeList.slice(0, 2).map((day) => (
              <div key={day.day} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-900">{day.day}</p>
                <div className="mt-3 space-y-2">
                  {day.entries.map((entry) => (
                    <div key={`${day.day}-${entry.caseId}`} className="rounded-xl bg-white p-3 text-sm text-slate-600">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-slate-800">{entry.time}</span>
                        <span className="text-xs uppercase tracking-[0.16em] text-emerald-700">{entry.purpose}</span>
                      </div>
                      <p className="mt-1 font-medium text-slate-700">{entry.caseId}</p>
                      <p className="text-xs text-slate-500">{entry.court}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}
