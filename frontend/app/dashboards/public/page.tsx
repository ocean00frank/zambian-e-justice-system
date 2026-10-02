'use client';

import { useMemo, useState } from "react";
import { publicTrackingSearch } from "@/components/mock-data";
import { PortalHeader } from "@/components/portal-header";

export default function PublicDashboardPage() {
  const [query, setQuery] = useState("HC/123/2026");

  const result = useMemo(
    () => publicTrackingSearch.find((item) => item.id.toLowerCase() === query.trim().toLowerCase()) ?? publicTrackingSearch[0],
    [query],
  );

  return (
    <>
      <PortalHeader />
      <div className="min-h-screen bg-[#f8f8f4] p-4 sm:p-6 lg:p-10">
      <div className="mx-auto max-w-5xl border border-[#173b30]/10 bg-white p-6 shadow-sm lg:p-8">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Public case tracking</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">Search for a case</h1>
          </div>
        </div>

        <div className="flex flex-col gap-4 md:flex-row">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Enter Case Number"
            className="flex-1 rounded-full border border-slate-200 bg-slate-50 px-5 py-3 text-base text-slate-800 outline-none focus:border-emerald-500"
          />
          <button className="rounded-full bg-[#1b4d3e] px-6 py-3 text-sm font-semibold text-white">Search</button>
        </div>

        <div className="mt-8 rounded-3xl border border-slate-200 bg-slate-50 p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Case number</p>
              <h2 className="mt-2 text-3xl font-bold text-slate-900">{result.id}</h2>
            </div>
            <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">{result.status}</span>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-4">
            <div><p className="text-xs uppercase tracking-[0.18em] text-slate-500">Court</p><p className="mt-2 text-base font-semibold text-slate-800">{result.court}</p></div>
            <div><p className="text-xs uppercase tracking-[0.18em] text-slate-500">Type</p><p className="mt-2 text-base font-semibold text-slate-800">{result.type}</p></div>
            <div><p className="text-xs uppercase tracking-[0.18em] text-slate-500">Filing date</p><p className="mt-2 text-base font-semibold text-slate-800">{result.filingDate}</p></div>
            <div><p className="text-xs uppercase tracking-[0.18em] text-slate-500">Status</p><p className="mt-2 text-base font-semibold text-slate-800">{result.status}</p></div>
          </div>

          <div className="mt-8">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Progress</p>
            <div className="mt-4 space-y-3">
              {[
                "Filed",
                "Registered",
                "Assigned",
                "Hearing Scheduled",
                "Judgment Delivered",
              ].map((step, index) => (
                <div key={step} className="flex items-center gap-3">
                  <div className={`flex h-6 w-6 items-center justify-center rounded-full ${index <= 3 ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-600"}`}>
                    {index <= 3 ? "✓" : index + 1}
                  </div>
                  <span className="text-sm font-medium text-slate-700">{step}</span>
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
