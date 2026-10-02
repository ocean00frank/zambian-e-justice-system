import { justiceCases } from "@/components/mock-data";
import { PortalHeader } from "@/components/portal-header";

function StatusBadge({ status }: { status: string }) {
  const palette = {
    "Hearing Scheduled": "bg-amber-100 text-amber-700",
    Assigned: "bg-blue-100 text-blue-700",
    "Judgment Delivered": "bg-emerald-100 text-emerald-700",
    Filed: "bg-slate-200 text-slate-700",
    Registered: "bg-emerald-100 text-emerald-700",
  };

  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${palette[status as keyof typeof palette] ?? "bg-slate-200 text-slate-700"}`}>{status}</span>;
}

export default async function CaseDetailsPage({ params }: { params: Promise<{ caseId: string }> }) {
  const { caseId } = await params;
  const caseRecord = justiceCases.find((item) => item.id.toLowerCase() === caseId.toLowerCase()) ?? justiceCases[0];

  return (
    <>
      <PortalHeader backHref="/cases" backLabel="Case register" />
      <div className="min-h-screen bg-[#f8f8f4] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl border border-[#173b30]/10 bg-white p-6 shadow-sm lg:p-8">
        <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Case details</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">{caseRecord.id}</h1>
          </div>
          <StatusBadge status={caseRecord.status} />
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <h2 className="text-xl font-semibold text-slate-900">{caseRecord.title}</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div><p className="text-xs uppercase tracking-[0.18em] text-slate-500">Court</p><p className="mt-2 text-base font-semibold text-slate-800">{caseRecord.court}</p></div>
              <div><p className="text-xs uppercase tracking-[0.18em] text-slate-500">Case type</p><p className="mt-2 text-base font-semibold text-slate-800">{caseRecord.caseType}</p></div>
              <div><p className="text-xs uppercase tracking-[0.18em] text-slate-500">Filing date</p><p className="mt-2 text-base font-semibold text-slate-800">{caseRecord.filingDate}</p></div>
              <div><p className="text-xs uppercase tracking-[0.18em] text-slate-500">Assigned judge</p><p className="mt-2 text-base font-semibold text-slate-800">{caseRecord.assignedTo}</p></div>
              <div><p className="text-xs uppercase tracking-[0.18em] text-slate-500">Next hearing</p><p className="mt-2 text-base font-semibold text-slate-800">{caseRecord.nextHearing}</p></div>
              <div><p className="text-xs uppercase tracking-[0.18em] text-slate-500">Last updated</p><p className="mt-2 text-base font-semibold text-slate-800">{caseRecord.lastUpdated}</p></div>
            </div>

            <div className="mt-8">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Parties</p>
              <ul className="mt-3 space-y-2 text-sm text-slate-700">
                {caseRecord.parties.map((party) => <li key={party}>• {party}</li>)}
              </ul>
            </div>
          </section>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Current status</p>
              <div className="mt-3 h-2.5 rounded-full bg-slate-200">
                <div className="h-2.5 rounded-full bg-[#1b4d3e]" style={{ width: `${caseRecord.progress}%` }} />
              </div>
              <p className="mt-3 text-sm text-slate-600">{caseRecord.progress}% complete</p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5">
              <h3 className="text-lg font-semibold text-slate-900">Tabs</h3>
              <div className="mt-4 flex flex-wrap gap-2 text-sm">
                {['Overview','Documents','Hearings','Timeline','Notifications'].map((tab) => (
                  <span key={tab} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-slate-600">{tab}</span>
                ))}
              </div>
            </div>
          </aside>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 lg:col-span-1">
            <h3 className="text-lg font-semibold text-slate-900">Documents</h3>
            <div className="mt-4 space-y-3">
              {caseRecord.documents.map((document) => (
                <div key={document.name} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium text-slate-800">{document.name}</p>
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-700">{document.type}</span>
                  </div>
                  <p className="mt-2 text-xs text-slate-500">Submitted {document.submitted}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 lg:col-span-1">
            <h3 className="text-lg font-semibold text-slate-900">Hearings</h3>
            <div className="mt-4 space-y-3">
              {caseRecord.hearings.map((hearing) => (
                <div key={`${hearing.date}-${hearing.time}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  <p className="font-medium text-slate-800">{hearing.date}</p>
                  <p className="mt-1 text-sm text-slate-600">{hearing.time} • {hearing.courtroom}</p>
                  <p className="mt-1 text-xs text-slate-500">{hearing.purpose}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 lg:col-span-1">
            <h3 className="text-lg font-semibold text-slate-900">Timeline</h3>
            <div className="mt-4 space-y-3">
              {caseRecord.timeline.map((item) => (
                <div key={`${item.date}-${item.event}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium text-slate-800">{item.event}</p>
                    <span className="text-[10px] uppercase tracking-[0.16em] text-slate-500">{item.actor}</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{item.date}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      </div>
    </>
  );
}
