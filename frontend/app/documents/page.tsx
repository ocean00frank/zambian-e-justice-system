"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { API_BASE_URL, ApiDocument, PaginatedResponse, apiRequest, formatDate, getSessionToken } from "@/components/api";
import { LawyerPageShell } from "@/components/lawyer-page-shell";

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<ApiDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  const load = useCallback(async (signal: AbortSignal) => {
    const token = getSessionToken();
    if (!token) {
      setError("Sign in to view documents.");
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const response = await apiRequest<PaginatedResponse<ApiDocument>>("documents/", { signal }, token);
      setDocuments(response.results);
      setError(null);
    } catch (loadError) {
      if (!signal.aborted) setError(loadError instanceof Error ? loadError.message : "Could not load documents.");
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

  async function download(item: ApiDocument) {
    const token = getSessionToken();
    if (!token) {
      setError("Sign in to download documents.");
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/api/documents/${item.id}/download/`, {
        headers: { Authorization: `Token ${token}` },
        cache: "no-store",
      });
      if (!response.ok) throw new Error(response.status === 404
        ? "The document was not found or you do not have access."
        : `Document download failed (${response.status}).`);
      const url = URL.createObjectURL(await response.blob());
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = item.original_filename;
      anchor.click();
      URL.revokeObjectURL(url);
      setError(null);
    } catch (downloadError) {
      setError(downloadError instanceof Error ? downloadError.message : "Document download failed.");
    }
  }

  return (
    <LawyerPageShell title="Documents">
      <div className="bg-[#f8f8f4]">
        <section className="mx-auto max-w-6xl border border-[#173b30]/10 bg-white p-6 shadow-sm lg:p-8">
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Documents</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">Filed document register</h1>
            <p className="mt-2 text-sm text-slate-600">Documents are listed only for cases you are authorized to access.</p>
          </div>
          {error && (
            <div role="alert" className="mb-5 flex flex-wrap justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
              <p>{error}</p>
              {error.includes("sign in") || error.includes("session has expired")
                ? <Link href="/login" className="font-semibold underline">Sign in</Link>
                : <button onClick={() => setAttempt((value) => value + 1)} className="font-semibold underline">Try again</button>}
            </div>
          )}
          {loading ? <p className="py-8 text-sm text-slate-500">Loading documents…</p>
            : documents.length ? (
              <ul className="divide-y divide-slate-200">
                {documents.map((item) => (
                  <li key={item.id} className="flex flex-col gap-3 py-5 first:pt-0 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-slate-900">{item.original_filename}</p>
                      <p className="mt-1 text-sm text-slate-600">{item.document_type} · Case {item.case_number}</p>
                      <p className="mt-1 text-xs text-slate-500">Filed {formatDate(item.uploaded_at)} · {(item.size_bytes / 1024).toFixed(0)} KB</p>
                    </div>
                    <button type="button" onClick={() => void download(item)} className="min-h-10 self-start rounded-lg bg-[#173b30] px-4 text-sm font-semibold text-white sm:self-auto">Download PDF</button>
                  </li>
                ))}
              </ul>
            ) : !error && <p className="py-10 text-center text-sm text-slate-500">No documents are available for your account.</p>}
        </section>
      </div>
    </LawyerPageShell>
  );
}
