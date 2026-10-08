import Link from "next/link";
import { RolePortalHeader } from "@/components/role-portal-header";

export default async function FilingReceiptPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <>
      <RolePortalHeader />
      <div className="min-h-screen bg-[#f8f8f4] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-4xl border border-[#173b30]/10 bg-white p-7 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Filing receipt</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">E-Filing Receipt</h1>
          </div>
          <div className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">Submission confirmed</div>
        </div>

        <div className="mt-8 rounded-3xl border border-slate-200 bg-slate-50 p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div><p className="text-xs uppercase tracking-[0.18em] text-slate-500">Receipt number</p><p className="mt-2 text-lg font-semibold text-slate-900">{id}</p></div>
            <div><p className="text-xs uppercase tracking-[0.18em] text-slate-500">Case ID</p><p className="mt-2 text-lg font-semibold text-slate-900">HC/123/2026</p></div>
            <div><p className="text-xs uppercase tracking-[0.18em] text-slate-500">Date and time submitted</p><p className="mt-2 text-lg font-semibold text-slate-900">08 Oct 2026 • 14:35</p></div>
            <div><p className="text-xs uppercase tracking-[0.18em] text-slate-500">Court</p><p className="mt-2 text-lg font-semibold text-slate-900">High Court</p></div>
            <div><p className="text-xs uppercase tracking-[0.18em] text-slate-500">Document type</p><p className="mt-2 text-lg font-semibold text-slate-900">Statement of Claim</p></div>
            <div><p className="text-xs uppercase tracking-[0.18em] text-slate-500">Submitted by</p><p className="mt-2 text-lg font-semibold text-slate-900">M. Banda</p></div>
            <div className="md:col-span-2"><p className="text-xs uppercase tracking-[0.18em] text-slate-500">Submission status</p><p className="mt-2 text-lg font-semibold text-slate-900">Submitted and registered in system</p></div>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <button className="rounded-full bg-[#1b4d3e] px-5 py-3 text-sm font-semibold text-white">View receipt</button>
          <button className="rounded-full border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-semibold text-slate-700">Download receipt</button>
          <button className="rounded-full border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-semibold text-slate-700">Print receipt</button>
        </div>

        <div className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          This receipt provides evidence of electronic submission and is stored in the case record for audit purposes.
        </div>

        <div className="mt-8 flex justify-start">
          <Link href="/e-filing" className="text-sm font-semibold text-emerald-700">File another case</Link>
        </div>
      </div>
      </div>
    </>
  );
}
