"use client";

import { FormEvent, useState } from "react";
import { ApiPublicCase, apiRequest, formatDate } from "@/components/api";
import { PortalHeader } from "@/components/portal-header";

export default function PublicDashboardPage() {
  const [caseNumber, setCaseNumber] = useState("");
  const [result, setResult] = useState<ApiPublicCase | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  async function searchCase(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalized = caseNumber.trim();
    if (!normalized) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setSearched(true);
    try {
      const query = new URLSearchParams({ case_number: normalized });
      const data = await apiRequest<ApiPublicCase>(`cases/track/?${query.toString()}`);
      setResult(data);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Case search failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <PortalHeader />
      <main className="min-h-screen bg-[#f8f8f4] p-4 sm:p-6 lg:p-10">
        <section className="mx-auto max-w-5xl border border-[#173b30]/10 bg-white p-6 shadow-sm lg:p-8">
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Public case tracking</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">Search for a case</h1>
          </div>

          <form onSubmit={searchCase} className="flex flex-col gap-4 sm:flex-row">
            <input
              value={caseNumber}
              onChange={(event) => setCaseNumber(event.target.value)}
              placeholder="Enter case number"
              aria-label="Case number"
              required
              className="min-h-12 flex-1 rounded-lg border border-slate-200 bg-slate-50 px-5 text-base text-slate-800 outline-none focus:border-emerald-600"
            />
            <button
              type="submit"
              disabled={loading}
              className="min-h-12 rounded-lg bg-[#1b4d3e] px-6 text-sm font-semibold text-white disabled:cursor-wait disabled:opacity-70"
            >
              {loading ? "Searching…" : "Search"}
            </button>
          </form>

          {error && <p role="alert" className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">{error}</p>}
          {!error && searched && !loading && !result && (
            <p className="mt-6 text-sm text-slate-600">No publicly trackable case was found.</p>
          )}
          {!searched && <p className="mt-6 text-sm text-slate-500">Enter a case number to view its public status and timeline.</p>}

          {result && (
            <section aria-label="Case tracking result" className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Case number</p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-900">{result.case_number}</h2>
                </div>
                <span className="inline-flex w-fit rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-800">{result.status}</span>
              </div>

              <dl className="mt-7 grid gap-5 sm:grid-cols-3">
                <div><dt className="text-xs uppercase tracking-[0.15em] text-slate-500">Court</dt><dd className="mt-2 font-medium text-slate-800">{result.court}</dd></div>
                <div><dt className="text-xs uppercase tracking-[0.15em] text-slate-500">Case type</dt><dd className="mt-2 font-medium text-slate-800">{result.case_type}</dd></div>
                <div><dt className="text-xs uppercase tracking-[0.15em] text-slate-500">Filing date</dt><dd className="mt-2 font-medium text-slate-800">{formatDate(result.filing_date)}</dd></div>
              </dl>

              {result.next_hearing && (
                <p className="mt-6 text-sm text-slate-700">
                  Next hearing: <strong>{formatDate(result.next_hearing.date)} · {result.next_hearing.time}</strong>
                </p>
              )}

              <div className="mt-8">
                <h3 className="font-semibold text-slate-900">Public timeline</h3>
                {result.public_timeline.length ? (
                  <ol className="mt-4 space-y-3">
                    {result.public_timeline.map((event, index) => (
                      <li key={`${event.date}-${index}`} className="flex gap-3 text-sm">
                        <span aria-hidden="true" className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-emerald-700" />
                        <span className="text-slate-700">{event.action} <span className="text-slate-500">· {formatDate(event.date)}</span></span>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="mt-3 text-sm text-slate-500">No public updates are available.</p>
                )}
              </div>
            </section>
          )}
        </section>
      </main>
    </>
  );
}
