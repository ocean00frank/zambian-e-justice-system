"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { HearingCountdown } from "@/components/hearing-countdown";
import { ApiHearing, PaginatedResponse, apiRequest, formatDate, getSessionToken } from "@/components/api";
import { LawyerPageShell } from "@/components/lawyer-page-shell";

export default function CauseListPage() {
  const [hearings, setHearings] = useState<ApiHearing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  const load = useCallback(async (signal: AbortSignal) => {
    const token = getSessionToken();
    if (!token) {
      setError("Sign in to view hearings.");
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const response = await apiRequest<PaginatedResponse<ApiHearing>>(
        "hearings/?upcoming=true",
        { signal },
        token,
      );
      setHearings(response.results);
      setError(null);
    } catch (loadError) {
      if (!signal.aborted) setError(loadError instanceof Error ? loadError.message : "Could not load hearings.");
    } finally {
      if (!signal.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const start = async () => load(controller.signal);
    void start();
    return () => controller.abort();
  }, [attempt, load]);

  const byDate = hearings.reduce<Record<string, ApiHearing[]>>((groups, hearing) => {
    (groups[hearing.hearing_date] ??= []).push(hearing);
    return groups;
  }, {});

  return (
    <LawyerPageShell title="Cause list">
      <div className="bg-[#f8f8f4]">
        <section className="mx-auto max-w-6xl border border-[#173b30]/10 bg-white p-6 shadow-sm lg:p-8">
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Cause list</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">Scheduled hearings</h1>
          </div>
          {error && (
            <div role="alert" className="mb-5 flex flex-wrap justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
              <p>{error}</p>
              {error.includes("sign in") || error.includes("session has expired")
                ? <Link href="/login" className="font-semibold underline">Sign in</Link>
                : <button onClick={() => setAttempt((value) => value + 1)} className="font-semibold underline">Try again</button>}
            </div>
          )}
          {loading ? <p className="py-8 text-sm text-slate-500">Loading scheduled hearings…</p>
            : Object.keys(byDate).length ? (
              <div className="space-y-6">
                {Object.entries(byDate).sort(([left], [right]) => left.localeCompare(right)).map(([day, entries]) => (
                  <section key={day} className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                    <h2 className="text-lg font-semibold text-slate-900">{formatDate(day)}</h2>
                    <ul className="mt-4 divide-y divide-slate-200">
                      {entries.sort((a, b) => a.hearing_time.localeCompare(b.hearing_time)).map((entry) => (
                        <li key={entry.id} className="flex flex-wrap items-center justify-between gap-3 py-4 first:pt-0 last:pb-0">
                          <div>
                            <p className="font-semibold text-slate-900">{entry.case_number}</p>
                            <p className="mt-1 text-sm text-slate-600">{entry.purpose}</p>
                          </div>
                          <div className="text-right text-sm text-slate-600">
                            <p>{entry.hearing_time}</p>
                            <p>{entry.courtroom || "Courtroom not specified"}</p>
                            <HearingCountdown
                              date={entry.hearing_date}
                              time={entry.hearing_time}
                              className="mt-1 font-medium text-emerald-700"
                            />
                          </div>
                        </li>
                      ))}
                    </ul>
                  </section>
                ))}
              </div>
            ) : !error && <p className="py-10 text-center text-sm text-slate-500">No upcoming hearings are scheduled for cases you can access.</p>}
        </section>
      </div>
    </LawyerPageShell>
  );
}
