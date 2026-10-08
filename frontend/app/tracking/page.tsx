import { justiceCases } from "@/components/mock-data";
import { PortalHeader } from "@/components/portal-header";

export default function TrackingPage() {
  const caseRecord = justiceCases[0];

  return (
    <>
      <PortalHeader backHref="/dashboards/public" backLabel="Public tracking" />
      <div className="min-h-screen bg-[#f8f8f4] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-5xl border border-[#173b30]/10 bg-white p-6 shadow-sm lg:p-8">
        <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Case tracking</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">{caseRecord.id}</h1>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><p className="text-xs uppercase tracking-[0.18em] text-slate-500">Court</p><p className="mt-2 font-semibold text-slate-800">{caseRecord.court}</p></div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><p className="text-xs uppercase tracking-[0.18em] text-slate-500">Current status</p><p className="mt-2 font-semibold text-slate-800">{caseRecord.status}</p></div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><p className="text-xs uppercase tracking-[0.18em] text-slate-500">Next hearing</p><p className="mt-2 font-semibold text-slate-800">{caseRecord.nextHearing}</p></div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><p className="text-xs uppercase tracking-[0.18em] text-slate-500">Last updated</p><p className="mt-2 font-semibold text-slate-800">{caseRecord.lastUpdated}</p></div>
        </div>

        <div className="mt-8 rounded-3xl border border-slate-200 bg-slate-50 p-6">
          <h2 className="text-xl font-semibold text-slate-900">Case timeline</h2>
          <div className="mt-6 space-y-5">
            {[
              { label: "Filed", complete: true },
              { label: "Registered", complete: true },
              { label: "Assigned", complete: true },
              { label: "Hearing Scheduled", complete: true },
              { label: "Judgment Delivered", complete: false },
            ].map((step) => (
              <div key={step.label} className="flex items-center gap-4">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full ${step.complete ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-600"}`}>
                  {step.complete ? "✓" : "○"}
                </div>
                <div className="text-sm font-medium text-slate-700">{step.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      </div>
    </>
  );
}
