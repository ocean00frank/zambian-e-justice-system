"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { HearingCountdown } from "@/components/hearing-countdown";
import {
  API_BASE_URL,
  ApiCaseDetail,
  ApiJudicialOfficer,
  ApiUser,
  apiRequest,
  formatDate,
  getSessionToken,
} from "@/components/api";
import { LawyerPageShell } from "@/components/lawyer-page-shell";

const caseStatuses = [
  "Filed",
  "Registered",
  "Assigned",
  "Hearing Scheduled",
  "Hearing Held",
  "Judgment Delivered",
  "Concluded",
];

export default function CaseDetailsPage() {
  const { caseId } = useParams<{ caseId: string }>();
  const [caseData, setCaseData] = useState<ApiCaseDetail | null>(null);
  const [user, setUser] = useState<ApiUser | null>(null);
  const [officers, setOfficers] = useState<ApiJudicialOfficer[]>([]);
  const [officerId, setOfficerId] = useState("");
  const [hearingDate, setHearingDate] = useState("");
  const [hearingTime, setHearingTime] = useState("");
  const [courtroom, setCourtroom] = useState("");
  const [purpose, setPurpose] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const loadCase = useCallback(async (signal: AbortSignal) => {
    const token = getSessionToken();
    if (!token) {
      setError("Sign in to view this case.");
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [result, currentUser] = await Promise.all([
        apiRequest<ApiCaseDetail>(`cases/${caseId}/`, { signal }, token),
        apiRequest<ApiUser>("auth/me/", { signal }, token),
      ]);
      setCaseData(result);
      setStatus(result.status);
      setOfficerId(result.assigned_officer ? String(result.assigned_officer) : "");
      setUser(currentUser);
      setError(null);
      if (currentUser.role === "registry") {
        const availableOfficers = await apiRequest<ApiJudicialOfficer[]>("judicial-officers/", { signal }, token);
        setOfficers(availableOfficers);
      }
    } catch (loadError) {
      if (!signal.aborted) setError(loadError instanceof Error ? loadError.message : "Could not load case details.");
    } finally {
      if (!signal.aborted) setLoading(false);
    }
  }, [caseId]);

  useEffect(() => {
    const controller = new AbortController();
    const start = async () => loadCase(controller.signal);
    void start();
    return () => controller.abort();
  }, [loadCase]);

  async function performAction(endpoint: string, body: object, successMessage: string) {
    const token = getSessionToken();
    if (!token) {
      setError("Sign in to continue.");
      return;
    }
    setError(null);
    setNotice(null);
    try {
      await apiRequest<ApiCaseDetail>(endpoint, { method: "POST", body: JSON.stringify(body) }, token);
      setNotice(successMessage);
      const controller = new AbortController();
      await loadCase(controller.signal);
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "The requested action failed.");
    }
  }

  function updateStatus(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void performAction(`cases/${caseId}/status/`, { status }, "Case status updated.");
  }

  function assignCase(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!officerId) {
      setError("Select a judge to assign this case.");
      return;
    }
    void performAction(`cases/${caseId}/assign/`, { assigned_officer: Number(officerId) }, "Case assignment updated.");
  }

  function scheduleHearing(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void performAction("hearings/", {
      case: Number(caseId),
      hearing_date: hearingDate,
      hearing_time: hearingTime,
      courtroom,
      purpose,
    }, "Hearing scheduled.");
  }

  async function downloadDocument(id: number, filename: string) {
    const token = getSessionToken();
    if (!token) {
      setError("Sign in to download this document.");
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/api/documents/${id}/download/`, {
        headers: { Authorization: `Token ${token}` },
        cache: "no-store",
      });
      if (!response.ok) {
        throw new Error(response.status === 404
          ? "The document was not found or you do not have access."
          : `Document download failed (${response.status}).`);
      }
      const url = URL.createObjectURL(await response.blob());
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = filename;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (downloadError) {
      setError(downloadError instanceof Error ? downloadError.message : "Document download failed.");
    }
  }

  const mayUpdateStatus = user?.role === "judge" || user?.role === "registry";
  const maySchedule = mayUpdateStatus;
  const mayAssign = user?.role === "registry";

  return (
    <LawyerPageShell title="Case details">
      <div className="bg-[#f8f8f4]">
        <section className="mx-auto max-w-7xl space-y-6">
          {error && (
            <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
              <p>{error}</p>
              {error.includes("sign in") || error.includes("session has expired") ? (
                <Link href="/login" className="font-semibold underline">Sign in</Link>
              ) : null}
            </div>
          )}
          {notice && <p role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">{notice}</p>}
          {loading && <p className="border border-slate-200 bg-white p-6 text-sm text-slate-600">Loading case…</p>}

          {caseData && (
            <>
              <section className="border border-[#173b30]/10 bg-white p-6 shadow-sm lg:p-8">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Case record</p>
                    <h1 className="mt-2 text-3xl font-semibold text-slate-900">{caseData.case_number}</h1>
                    <p className="mt-2 text-slate-600">{caseData.title}</p>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-800">{caseData.status}</span>
                </div>
                <dl className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                  <div><dt className="text-xs uppercase tracking-[0.15em] text-slate-500">Court</dt><dd className="mt-2 font-medium text-slate-800">{caseData.court}</dd></div>
                  <div><dt className="text-xs uppercase tracking-[0.15em] text-slate-500">Case type</dt><dd className="mt-2 font-medium text-slate-800">{caseData.case_type}</dd></div>
                  <div><dt className="text-xs uppercase tracking-[0.15em] text-slate-500">Filing date</dt><dd className="mt-2 font-medium text-slate-800">{formatDate(caseData.filing_date)}</dd></div>
                  <div>
                    <dt className="text-xs uppercase tracking-[0.15em] text-slate-500">Assigned judge</dt>
                    <dd className="mt-2 font-medium text-slate-800">
                      {caseData.assigned_officer
                        ? caseData.assigned_officer_username
                          ? `Username: ${caseData.assigned_officer_username}`
                          : caseData.assigned_officer_name || `Judge account ${caseData.assigned_officer}`
                        : "Not assigned"}
                    </dd>
                  </div>
                </dl>
                <div className="mt-6">
                  <h2 className="text-sm font-semibold text-slate-800">Parties</h2>
                  <ul className="mt-2 flex flex-wrap gap-2">
                    {caseData.parties.map((party) => <li key={party.id} className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700">{party.name}</li>)}
                  </ul>
                </div>
              </section>

              <div className="grid gap-6 lg:grid-cols-3">
                <section className="border border-slate-200 bg-white p-5">
                  <h2 className="font-semibold text-slate-900">Documents</h2>
                  {caseData.documents.length ? (
                    <ul className="mt-4 space-y-3">
                      {caseData.documents.map((item) => (
                        <li key={item.id} className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3 last:border-0">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-slate-800">{item.original_filename}</p>
                            <p className="text-xs text-slate-500">{item.document_type} · {formatDate(item.uploaded_at)}</p>
                          </div>
                          <button type="button" onClick={() => void downloadDocument(item.id, item.original_filename)} className="shrink-0 text-sm font-semibold text-emerald-700">Download</button>
                        </li>
                      ))}
                    </ul>
                  ) : <p className="mt-4 text-sm text-slate-500">No documents are attached.</p>}
                </section>

                <section className="border border-slate-200 bg-white p-5">
                  <h2 className="font-semibold text-slate-900">Hearings</h2>
                  {caseData.hearings.length ? (
                    <ul className="mt-4 space-y-3">
                      {caseData.hearings.map((hearing) => (
                        <li key={hearing.id} className="border-b border-slate-100 pb-3 last:border-0">
                          <p className="text-sm font-medium text-slate-800">{hearing.purpose}</p>
                          <p className="mt-1 text-xs text-slate-500">{formatDate(hearing.hearing_date)} · {hearing.hearing_time} · {hearing.courtroom || "Courtroom not specified"}</p>
                          {hearing.status === "Scheduled" && (
                            <HearingCountdown
                              date={hearing.hearing_date}
                              time={hearing.hearing_time}
                              className="mt-1 text-xs font-medium text-emerald-700"
                            />
                          )}
                          <p className="text-xs text-slate-500">{hearing.status}</p>
                        </li>
                      ))}
                    </ul>
                  ) : <p className="mt-4 text-sm text-slate-500">No hearing has been scheduled.</p>}
                </section>

                <section className="border border-slate-200 bg-white p-5">
                  <h2 className="font-semibold text-slate-900">Case history</h2>
                  {caseData.events.length ? (
                    <ol className="mt-4 space-y-3">
                      {caseData.events.map((event) => (
                        <li key={event.id} className="border-l-2 border-emerald-700 pl-3">
                          <p className="text-sm font-medium text-slate-800">{event.action}</p>
                          <p className="mt-1 text-xs text-slate-500">{event.actor_name || "System"} · {formatDate(event.created_at)}</p>
                        </li>
                      ))}
                    </ol>
                  ) : <p className="mt-4 text-sm text-slate-500">No case history is available.</p>}
                </section>
              </div>

              {(mayUpdateStatus || mayAssign || maySchedule) && (
                <section className="grid gap-6 lg:grid-cols-3">
                  {mayUpdateStatus && (
                    <form onSubmit={updateStatus} className="space-y-3 border border-slate-200 bg-white p-5">
                      <h2 className="font-semibold text-slate-900">Update case status</h2>
                      <label htmlFor="case-status" className="sr-only">Case status</label>
                      <select id="case-status" value={status} onChange={(event) => setStatus(event.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
                        {caseStatuses.map((value) => <option key={value}>{value}</option>)}
                      </select>
                      <button className="rounded-lg bg-[#173b30] px-4 py-2 text-sm font-semibold text-white">Save status</button>
                    </form>
                  )}

                  {mayAssign && (
                    <form onSubmit={assignCase} className="space-y-3 border border-slate-200 bg-white p-5">
                      <h2 className="font-semibold text-slate-900">Assign judge</h2>
                      {caseData.assigned_officer && (
                        <p className="text-sm text-slate-600">
                          Currently assigned to{" "}
                          {caseData.assigned_officer_username
                            ? `@${caseData.assigned_officer_username}`
                            : caseData.assigned_officer_name || `Judge account ${caseData.assigned_officer}`}
                          .
                        </p>
                      )}
                      <label htmlFor="judge" className="sr-only">Select judge</label>
                      <select id="judge" value={officerId} onChange={(event) => setOfficerId(event.target.value)} required className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
                        <option value="">Select a judge</option>
                        {officers.map((officer) => (
                          <option key={officer.id} value={officer.id}>
                            {officer.full_name === officer.username
                              ? `@${officer.username}`
                              : `${officer.full_name} (@${officer.username})`}
                          </option>
                        ))}
                      </select>
                      <button className="rounded-lg bg-[#173b30] px-4 py-2 text-sm font-semibold text-white">Assign case</button>
                    </form>
                  )}

                  {maySchedule && (
                    <form onSubmit={scheduleHearing} className="space-y-3 border border-slate-200 bg-white p-5">
                      <h2 className="font-semibold text-slate-900">Schedule hearing</h2>
                      <label className="block text-xs font-medium text-slate-600">Date<input type="date" required value={hearingDate} onChange={(event) => setHearingDate(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" /></label>
                      <label className="block text-xs font-medium text-slate-600">Time<input type="time" required value={hearingTime} onChange={(event) => setHearingTime(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" /></label>
                      <label className="block text-xs font-medium text-slate-600">Courtroom<input value={courtroom} onChange={(event) => setCourtroom(event.target.value)} maxLength={80} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" /></label>
                      <label className="block text-xs font-medium text-slate-600">Purpose<input required value={purpose} onChange={(event) => setPurpose(event.target.value)} maxLength={160} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" /></label>
                      <button className="rounded-lg bg-[#173b30] px-4 py-2 text-sm font-semibold text-white">Schedule hearing</button>
                    </form>
                  )}
                </section>
              )}
            </>
          )}
        </section>
      </div>
    </LawyerPageShell>
  );
}
