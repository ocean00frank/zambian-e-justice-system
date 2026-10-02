import { adminUsers, auditHistory } from "@/components/mock-data";
import { PortalHeader } from "@/components/portal-header";

export default function AdminPage() {
  return (
    <>
      <PortalHeader backHref="/dashboards/registry" backLabel="Dashboard" />
      <div className="min-h-screen bg-[#f8f8f4] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="border border-[#173b30]/10 bg-white p-6 shadow-sm lg:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Administration</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">User management and audit</h1>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <section className="border border-[#173b30]/10 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">User account overview</h2>
            <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
              <table className="min-w-full divide-y divide-slate-200 text-left">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">User</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Role</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {adminUsers.map((user) => (
                    <tr key={user.name}>
                      <td className="px-4 py-4 text-sm font-medium text-slate-800">{user.name}</td>
                      <td className="px-4 py-4 text-sm text-slate-600">{user.role}</td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${user.status === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                          {user.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="border border-[#173b30]/10 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">System overview</h2>
            <div className="mt-5 space-y-4">
              {[
                { label: "System health", value: "99.9% uptime target" },
                { label: "Active roles", value: "4" },
                { label: "Pending audit checks", value: "2" },
                { label: "Protected document access", value: "Enabled" },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-500">{item.label}</p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">{item.value}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <section className="border border-[#173b30]/10 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Audit history</h2>
          <div className="mt-5 space-y-3">
            {auditHistory.map((entry) => (
              <div key={`${entry.date}-${entry.action}`} className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-800">{entry.action}</p>
                  <p className="mt-1 text-xs text-slate-500">User: {entry.user}</p>
                </div>
                <div className="text-sm text-slate-600">{entry.date}</div>
                <div className="text-sm text-slate-600">{entry.caseId}</div>
              </div>
            ))}
          </div>
        </section>
      </div>
      </div>
    </>
  );
}
