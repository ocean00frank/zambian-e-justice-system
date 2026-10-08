import { causeList } from "@/components/mock-data";
import { RolePortalHeader } from "@/components/role-portal-header";

export default function CauseListPage() {
  return (
    <>
      <RolePortalHeader />
      <div className="min-h-screen bg-[#f8f8f4] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl border border-[#173b30]/10 bg-white p-6 shadow-sm lg:p-8">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Cause list</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">Scheduled hearings</h1>
        </div>

        <div className="space-y-6">
          {causeList.map((day) => (
            <div key={day.day} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <h2 className="text-xl font-semibold text-slate-900">{day.day}</h2>
              <div className="mt-4 space-y-3">
                {day.entries.map((entry) => (
                  <div key={`${day.day}-${entry.caseId}`} className="rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="text-lg font-semibold text-slate-900">{entry.caseId}</p>
                        <p className="text-sm text-slate-500">{entry.purpose}</p>
                      </div>
                      <div className="text-sm text-slate-600">{entry.time}</div>
                    </div>
                    <p className="mt-2 text-sm text-slate-500">Court: {entry.court}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      </div>
    </>
  );
}
