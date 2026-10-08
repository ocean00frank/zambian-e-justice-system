"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  ApiCase,
  PaginatedResponse,
  apiRequest,
  formatDate,
  getSessionToken,
} from "@/components/api";
import { LawyerPageShell } from "@/components/lawyer-page-shell";

export default function RegistryCaseRegistrationPage() {
  const [cases, setCases] = useState<ApiCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [registeringCaseId, setRegisteringCaseId] = useState<number | null>(null);
  const [attempt, setAttempt] = useState(0);

  const loadIncomingCases = useCallback(async (signal: AbortSignal) => {
    const token = getSessionToken();
    if (!token) {
      setError("Sign in with a Registry account to register incoming cases.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await apiRequest<PaginatedResponse<ApiCase>>(
        "cases/?status=Filed",
        { signal },
        token,
      );
      setCases(response.results);
    } catch (loadError) {
      if (!signal.aborted) {
        setError(loadError instanceof Error ? loadError.message : "Could not load incoming filings.");
      }
    } finally {
      if (!signal.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const start = async () => {
      await loadIncomingCases(controller.signal);
    };
    void start();
    return () => controller.abort();
  }, [attempt, loadIncomingCases]);

  async function registerCase(caseId: number, caseNumber: string) {
    const token = getSessionToken();
    if (!token) {
      setError("Your session has expired. Please sign in again.");
      return;
    }

    setRegisteringCaseId(caseId);
    setError(null);
    setNotice(null);
    try {
      await apiRequest(`cases/${caseId}/status/`, {
        method: "POST",
        body: JSON.stringify({ status: "Registered" }),
      }, token);
      setNotice(`Case ${caseNumber} has been registered.`);
      setCases((current) => current.filter((item) => item.id !== caseId));
    } catch (registerError) {
      setError(registerError instanceof Error ? registerError.message : "Could not register this case.");
    } finally {
      setRegisteringCaseId(null);
    }
  }

  return (
    <LawyerPageShell title="Register incoming cases" requiredRole="registry">
      <div className="min-h-[calc(100vh-88px)] bg-[#f8f8f4]">
        <section className="mx-auto max-w-7xl space-y-6">
          <header className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Registry workflow</p>
              <h1 className="mt-2 text-3xl font-semibold text-slate-900">Register incoming cases</h1>
              <p className="mt-2 text-sm text-slate-600">
                Review filings submitted by Lawyers and register them for court processing.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setAttempt((value) => value + 1)}
                disabled={loading}
                className="min-h-10 rounded-lg border border-[#173b30]/20 px-4 text-sm font-semibold text-[#173b30] hover:bg-white disabled:cursor-wait disabled:opacity-60"
              >
                {loading ? "Refreshing…" : "Refresh filings"}
              </button>
              <Link href="/cases" className="text-sm font-semibold text-emerald-700 hover:text-emerald-900">
                View case records
              </Link>
            </div>
          </header>

          {notice && (
            <p role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
              {notice}
            </p>
          )}

          {error && (
            <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
              <p>{error}</p>
              {error.includes("session has expired") || error.includes("Sign in") ? (
                <Link href="/login" className="font-semibold underline">Sign in</Link>
              ) : (
                <button type="button" onClick={() => setAttempt((value) => value + 1)} className="font-semibold underline">
                  Try again
                </button>
              )}
            </div>
          )}

          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-4">
              <h2 className="font-semibold text-slate-900">Awaiting registration</h2>
              <p className="mt-1 text-sm text-slate-500">Registering a case updates its status and notifies its case participants.</p>
            </div>

            {loading ? (
              <p className="px-5 py-8 text-sm text-slate-500">Loading incoming filings…</p>
            ) : cases.length ? (
              <div className="divide-y divide-slate-100">
                {cases.map((caseRecord) => (
                  <article key={caseRecord.id} className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900">{caseRecord.case_number}</p>
                      <p className="mt-1 truncate text-sm text-slate-700">{caseRecord.title}</p>
                      <p className="mt-1 text-sm text-slate-500">
                        {caseRecord.court} · {caseRecord.case_type} · Filed {formatDate(caseRecord.filing_date)}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <Link href={`/cases/${caseRecord.id}`} className="text-sm font-semibold text-emerald-700 hover:text-emerald-900">
                        Review details
                      </Link>
                      <button
                        type="button"
                        onClick={() => void registerCase(caseRecord.id, caseRecord.case_number)}
                        disabled={registeringCaseId !== null}
                        className="min-h-10 rounded-lg bg-[#173b30] px-4 text-sm font-semibold text-white hover:bg-[#0f2d23] disabled:cursor-wait disabled:opacity-60"
                      >
                        {registeringCaseId === caseRecord.id ? "Registering…" : "Register case"}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            ) : error ? null : (
              <p className="px-5 py-10 text-center text-sm text-slate-500">
                No incoming filings are waiting for registration. When a Lawyer submits a case through E-Filing, it will appear here with a Register case button.
              </p>
            )}
          </section>
        </section>
      </div>
    </LawyerPageShell>
  );
}
