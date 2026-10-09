"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ApiFilingReceipt, apiRequest, formatDate, getSessionToken } from "@/components/api";
import { LawyerPageShell } from "@/components/lawyer-page-shell";

export default function FilingReceiptPage() {
  const params = useParams<{ id: string }>();
  const receiptNumber = decodeURIComponent(params.id);
  const [receipt, setReceipt] = useState<ApiFilingReceipt | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    const loadReceipt = async () => {
      const token = getSessionToken();
      if (!token) {
        setError("Sign in to view this filing receipt.");
        setLoading(false);
        return;
      }
      try {
        const result = await apiRequest<ApiFilingReceipt>(
          `filings/receipts/${encodeURIComponent(receiptNumber)}/`,
          { signal: controller.signal },
          token,
        );
        setReceipt(result);
      } catch (loadError) {
        if (!controller.signal.aborted) setError(loadError instanceof Error ? loadError.message : "Could not load receipt.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    void loadReceipt();
    return () => controller.abort();
  }, [receiptNumber]);

  return (
    <LawyerPageShell title="Filing receipt" requiredRole="lawyer">
      <div className="bg-[#f8f8f4]">
        <section className="mx-auto max-w-4xl border border-[#173b30]/10 bg-white p-7 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Filing receipt</p>
              <h1 className="mt-2 text-3xl font-semibold text-slate-900">Submission receipt</h1>
            </div>
            {receipt && <span className="w-fit rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">Submitted</span>}
          </div>

          {loading && <p className="mt-8 text-sm text-slate-600">Loading receipt…</p>}
          {error && <p role="alert" className="mt-8 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">{error}</p>}

          {receipt && (
            <>
              <dl className="mt-8 grid gap-5 rounded-xl border border-slate-200 bg-slate-50 p-6 sm:grid-cols-2">
                <div><dt className="text-xs uppercase tracking-[0.15em] text-slate-500">Receipt number</dt><dd className="mt-2 break-all font-semibold text-slate-900">{receipt.receipt_number}</dd></div>
                <div><dt className="text-xs uppercase tracking-[0.15em] text-slate-500">Case number</dt><dd className="mt-2 font-semibold text-slate-900">{receipt.case_number}</dd></div>
                <div><dt className="text-xs uppercase tracking-[0.15em] text-slate-500">Submitted</dt><dd className="mt-2 font-semibold text-slate-900">{new Intl.DateTimeFormat("en-ZM", { dateStyle: "medium", timeStyle: "short" }).format(new Date(receipt.submitted_at))}</dd></div>
                <div><dt className="text-xs uppercase tracking-[0.15em] text-slate-500">Court</dt><dd className="mt-2 font-semibold text-slate-900">{receipt.court}</dd></div>
                <div><dt className="text-xs uppercase tracking-[0.15em] text-slate-500">Court division or registry</dt><dd className="mt-2 font-semibold text-slate-900">{receipt.court_division}</dd></div>
                <div><dt className="text-xs uppercase tracking-[0.15em] text-slate-500">Document type</dt><dd className="mt-2 font-semibold text-slate-900">{receipt.document_type ?? "—"}</dd></div>
                <div><dt className="text-xs uppercase tracking-[0.15em] text-slate-500">Date</dt><dd className="mt-2 font-semibold text-slate-900">{formatDate(receipt.submitted_at)}</dd></div>
                <div><dt className="text-xs uppercase tracking-[0.15em] text-slate-500">Fee amount entered</dt><dd className="mt-2 font-semibold text-slate-900">{receipt.fee_amount ? `ZMW ${Number(receipt.fee_amount).toFixed(2)}` : "Not provided"}</dd></div>
                <div><dt className="text-xs uppercase tracking-[0.15em] text-slate-500">Payment reference</dt><dd className="mt-2 break-all font-semibold text-slate-900">{receipt.payment_reference}</dd></div>
                <div><dt className="text-xs uppercase tracking-[0.15em] text-slate-500">Payment review</dt><dd className="mt-2 font-semibold text-slate-900">{receipt.payment_status === "verified" ? "Verified by Registry" : "Awaiting Registry verification"}</dd></div>
              </dl>
              <p className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
                This confirms electronic submission only. The fee amount and proof must be checked by Registry; this receipt is not court acceptance or confirmation that the stated fee is correct.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <button type="button" onClick={() => window.print()} className="min-h-11 rounded-lg bg-[#173b30] px-5 text-sm font-semibold text-white">Print receipt</button>
                <Link href={`/cases/${receipt.case_id}`} className="inline-flex min-h-11 items-center rounded-lg border border-slate-200 px-5 text-sm font-semibold text-slate-700">View case</Link>
                <Link href="/e-filing" className="inline-flex min-h-11 items-center rounded-lg border border-slate-200 px-5 text-sm font-semibold text-slate-700">File another case</Link>
              </div>
            </>
          )}
        </section>
      </div>
    </LawyerPageShell>
  );
}
