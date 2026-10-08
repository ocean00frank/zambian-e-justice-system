"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { ApiCase, PaginatedResponse, apiRequest, formatDate, getSessionToken } from "@/components/api";
import { LawyerPageShell } from "@/components/lawyer-page-shell";

export default function CasesPage() {
  const [cases, setCases] = useState<ApiCase[]>([]);
  const [query, setQuery] = useState("");
  const [filingDate, setFilingDate] = useState("");
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  const loadCases = useCallback(async (signal: AbortSignal) => {
    const token = getSessionToken();
    if (!token) {
      setError("Please sign in to view cases.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (dateFilter) params.set("filing_date", dateFilter);
      const suffix = params.size ? `?${params.toString()}` : "";
      const response = await apiRequest<PaginatedResponse<ApiCase>>(`cases/${suffix}`, { signal }, token);
      setCases(response.results);
    } catch (loadError) {
      if (!signal.aborted) setError(loadError instanceof Error ? loadError.message : "Could not load cases.");
    } finally {
      if (!signal.aborted) setLoading(false);
    }
  }, [dateFilter, search]);

  useEffect(() => {
    const controller = new AbortController();
    const start = async () => loadCases(controller.signal);
    void start();
    return () => controller.abort();
  }, [attempt, loadCases]);

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSearch(query.trim());
    setDateFilter(filingDate);
  }

  return (
    <LawyerPageShell title="My cases">
        <div className="bg-[#f8f8f4]">
        <section className="mx-auto max-w-7xl border border-[#173b30]/10 bg-white p-6 shadow-sm lg:p-8">
          <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Case management</p>
              <h1 className="mt-2 text-3xl font-semibold text-slate-900">Case register</h1>
            </div>
            <form onSubmit={submitSearch} className="flex w-full flex-wrap gap-2 lg:w-auto">
              <label htmlFor="case-search" className="sr-only">Search by case number, title, or party</label>
              <input id="case-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Case number, title, or party" className="min-h-11 min-w-56 flex-1 rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm text-slate-800 outline-none focus:border-emerald-600 lg:w-72" />
              <label htmlFor="filing-date" className="sr-only">Filter by filing date</label>
              <input id="filing-date" type="date" value={filingDate} onChange={(event) => setFilingDate(event.target.value)} className="min-h-11 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700" />
              <button className="rounded-lg bg-[#173b30] px-4 text-sm font-semibold text-white">Search</button>
            </form>
          </div>

          {error && (
            <div role="alert" className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
              <p>{error}</p>
              {error.includes("sign in") || error.includes("session has expired") ? (
                <Link href="/login" className="font-semibold underline">Sign in</Link>
              ) : (
                <button onClick={() => setAttempt((value) => value + 1)} className="font-semibold underline">Try again</button>
              )}
            </div>
          )}

          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-left">
              <thead className="bg-slate-50">
                <tr>
                  {["Case", "Court", "Status", "Next hearing", "Action"].map((label) => (
                    <th key={label} className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{label}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {loading ? (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-slate-500">Loading cases…</td></tr>
                ) : cases.length ? cases.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-4 py-4">
                      <p className="font-semibold text-slate-900">{item.case_number}</p>
                      <p className="text-sm text-slate-500">{item.title}</p>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">{item.court}</td>
                    <td className="whitespace-nowrap px-4 py-4">
                      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800">{item.status}</span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">
                      {item.next_hearing ? formatDate(item.next_hearing.date) : "Not scheduled"}
                    </td>
                    <td className="px-4 py-4">
                      <Link href={`/cases/${item.id}`} className="font-semibold text-emerald-700 hover:text-emerald-900">Open</Link>
                    </td>
                  </tr>
                )) : !error && (
                  <tr><td colSpan={5} className="px-4 py-10 text-center text-sm text-slate-500">No cases match your search.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
        </div>
    </LawyerPageShell>
  );
}
