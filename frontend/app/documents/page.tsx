import { documentList } from "@/components/mock-data";
import { RolePortalHeader } from "@/components/role-portal-header";

export default function DocumentsPage() {
  return (
    <>
      <RolePortalHeader />
      <div className="min-h-screen bg-[#f8f8f4] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl border border-[#173b30]/10 bg-white p-6 shadow-sm lg:p-8">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Documents</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">Filed document register</h1>
        </div>

        <div className="space-y-4">
          {documentList.map((document) => (
            <div key={document.name} className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-5 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <p className="text-lg font-semibold text-slate-900">{document.name}</p>
                  <span className="rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-700">{document.type}</span>
                </div>
                <p className="mt-2 text-sm text-slate-500">Submitted {document.submitted} by {document.by}</p>
              </div>

              <div className="flex items-center gap-3">
                <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">{document.status}</span>
                <button className="rounded-full bg-[#1b4d3e] px-4 py-2 text-sm font-semibold text-white">View</button>
              </div>
            </div>
          ))}
        </div>
      </div>
      </div>
    </>
  );
}
