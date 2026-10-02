import Link from "next/link";
import { justiceCases } from "@/components/mock-data";
import { PortalHeader } from "@/components/portal-header";

function StatusBadge({ status }: { status: string }) {
  const palette = {
    "Hearing Scheduled": "bg-amber-100 text-amber-700",
    Assigned: "bg-blue-100 text-blue-700",
    Registered: "bg-emerald-100 text-emerald-700",
    Filed: "bg-slate-200 text-slate-700",
    "Judgment Delivered": "bg-emerald-100 text-emerald-700",
    Concluded: "bg-emerald-100 text-emerald-700",
  };

  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${palette[status as keyof typeof palette] ?? "bg-slate-200 text-slate-700"}`}>{status}</span>;
}

export default function CasesPage() {
  return (
    <>
      <PortalHeader backHref="/dashboards/lawyer" backLabel="Dashboard" />
      <div className="min-h-screen bg-[#f8f8f4] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl border border-[#173b30]/10 bg-white p-6 shadow-sm lg:p-8">
        <div className="mb-8 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Case management</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">Case register</h1>
          </div>
          <div className="flex w-full lg:w-auto">
            <input
              placeholder="Search by case number or party"
              className="w-full rounded-full border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-emerald-500 lg:w-80"
            />
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-left">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Case</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Court</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Status</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Next hearing</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {justiceCases.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="px-4 py-4">
                    <div>
                      <p className="font-semibold text-slate-900">{item.id}</p>
                      <p className="text-sm text-slate-500">{item.title}</p>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-slate-600">{item.court}</td>
                  <td className="px-4 py-4"><StatusBadge status={item.status} /></td>
                  <td className="px-4 py-4 text-sm text-slate-600">{item.nextHearing}</td>
                  <td className="px-4 py-4">
                    <Link href={`/cases/${item.id}`} className="font-semibold text-emerald-700">Open</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      </div>
    </>
  );
}
