import Link from "next/link";
import { filingSteps } from "@/components/mock-data";
import { PortalHeader } from "@/components/portal-header";

export default function EFilingPage() {
  return (
    <>
      <PortalHeader backHref="/dashboards/lawyer" backLabel="Dashboard" />
      <div className="min-h-screen bg-[#f8f8f4] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl border border-[#173b30]/10 bg-white p-6 shadow-sm lg:p-8">
        <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Electronic filing</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">File a case</h1>
          </div>
        </div>

        <div className="mb-8 grid gap-4 md:grid-cols-3 xl:grid-cols-6">
          {filingSteps.map((step, index) => (
            <div key={step} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-center">
              <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-[#1b4d3e] text-xs font-semibold text-white">
                {index + 1}
              </div>
              <p className="text-xs font-semibold text-slate-600">{step}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <form className="space-y-6 rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Select court</label>
              <select className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-800 outline-none focus:border-emerald-500">
                <option>High Court</option>
                <option>Subordinate Court</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Filing type</label>
              <select className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-800 outline-none focus:border-emerald-500">
                <option>Writ of Summons</option>
                <option>Statement of Claim</option>
                <option>Originating Summons</option>
                <option>Other permitted legal document</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Case title</label>
              <input defaultValue="Manda v. Attorney General" className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-800 outline-none focus:border-emerald-500" />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Parties</label>
              <textarea rows={3} defaultValue="Timothy Manda\nAttorney General of Zambia" className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-800 outline-none focus:border-emerald-500" />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Upload document</label>
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-5">
                <p className="text-sm text-slate-600">Statement_of_claim.pdf</p>
                <div className="mt-3 flex items-center justify-between gap-3 text-xs text-slate-500">
                  <span>Format: PDF</span>
                  <span>Size: 1.4 MB</span>
                </div>
                <div className="mt-4 h-2 rounded-full bg-slate-200">
                  <div className="h-2 w-[100%] rounded-full bg-[#1b4d3e]" />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
              Validation complete. The document is in PDF format and meets the court filing requirements.
            </div>
          </form>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-5">
              <h3 className="text-xl font-semibold text-slate-900">Review submission</h3>
              <div className="mt-4 space-y-3 text-sm text-slate-600">
                <p><span className="font-semibold text-slate-800">Court:</span> High Court</p>
                <p><span className="font-semibold text-slate-800">Document:</span> Statement of Claim</p>
                <p><span className="font-semibold text-slate-800">Submitted by:</span> M. Banda</p>
                <p><span className="font-semibold text-slate-800">Status:</span> Ready for submission</p>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5">
              <h3 className="text-xl font-semibold text-slate-900">Confirmation</h3>
              <div className="mt-4 flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                <input type="checkbox" defaultChecked className="mt-1 h-4 w-4 rounded border-slate-300 text-emerald-600" />
                I confirm that the filing details and uploaded document are correct before submission.
              </div>
              <Link href="/e-filing/receipt/REC-2026-0001" className="mt-5 flex w-full items-center justify-center rounded-2xl bg-[#1b4d3e] px-4 py-3 text-sm font-semibold text-white">
                Submit filing
              </Link>
            </div>
          </aside>
        </div>
      </div>
      </div>
    </>
  );
}
