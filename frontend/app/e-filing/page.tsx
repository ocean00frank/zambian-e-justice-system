"use client";

import { ChangeEvent, FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiFilingReceipt, apiRequest, getSessionToken } from "@/components/api";
import { LawyerPageShell } from "@/components/lawyer-page-shell";

const documentTypes = [
  "Writ of Summons",
  "Statement of Claim",
  "Originating Summons",
  "Other permitted legal document",
];

export default function EFilingPage() {
  const router = useRouter();
  const [court, setCourt] = useState("High Court");
  const [documentType, setDocumentType] = useState(documentTypes[0]);
  const [title, setTitle] = useState("");
  const [caseType, setCaseType] = useState("");
  const [partyNames, setPartyNames] = useState("");
  const [document, setDocument] = useState<File | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function selectFile(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0] ?? null;
    setDocument(selected);
    setError(null);
    if (selected && (
      !selected.name.toLowerCase().endsWith(".pdf")
      || (selected.type !== "" && selected.type !== "application/pdf")
    )) {
      setError("Choose a PDF document.");
      setDocument(null);
    } else if (selected && selected.size > 10 * 1024 * 1024) {
      setError("The PDF must be 10 MB or smaller.");
      setDocument(null);
    }
  }

  async function submitFiling(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const token = getSessionToken();
    if (!token) {
      setError("Please sign in with a Lawyer account to submit a filing.");
      return;
    }
    if (!document) {
      setError("Select a PDF document before submitting.");
      return;
    }
    if (!confirmed) {
      setError("Confirm that the filing details and document are correct.");
      return;
    }
    const parties = partyNames.split(/\r?\n/).map((party) => party.trim()).filter(Boolean);
    if (!parties.length) {
      setError("Enter at least one party name.");
      return;
    }

    const form = new FormData();
    form.set("court", court);
    form.set("title", title.trim());
    form.set("case_type", caseType.trim());
    form.set("document_type", documentType);
    form.set("parties", JSON.stringify(parties));
    form.set("document", document);

    setSubmitting(true);
    try {
      const receipt = await apiRequest<ApiFilingReceipt>("filings/", {
        method: "POST",
        body: form,
      }, token);
      router.push(`/e-filing/receipt/${encodeURIComponent(receipt.receipt_number)}`);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Filing could not be submitted.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <LawyerPageShell title="E-Filing">
      <div className="bg-[#f8f8f4]">
        <section className="mx-auto max-w-5xl border border-[#173b30]/10 bg-white p-6 shadow-sm lg:p-8">
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Electronic filing</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">Submit a court document</h1>
            <p className="mt-2 text-sm text-slate-600">Complete the filing details and upload a PDF of up to 10 MB.</p>
          </div>

          {error && <p role="alert" className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">{error}</p>}

          <form onSubmit={submitFiling} className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-5">
              <div>
                <label htmlFor="court" className="mb-2 block text-sm font-medium text-slate-700">Court</label>
                <select id="court" value={court} onChange={(event) => setCourt(event.target.value)} className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-slate-800">
                  <option>High Court</option>
                  <option>Subordinate Court</option>
                </select>
              </div>
              <div>
                <label htmlFor="document-type" className="mb-2 block text-sm font-medium text-slate-700">Document type</label>
                <select id="document-type" value={documentType} onChange={(event) => setDocumentType(event.target.value)} className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-slate-800">
                  {documentTypes.map((type) => <option key={type}>{type}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="case-title" className="mb-2 block text-sm font-medium text-slate-700">Case title</label>
                <input id="case-title" required maxLength={255} value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Applicant v Respondent" className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-slate-800" />
              </div>
              <div>
                <label htmlFor="case-type" className="mb-2 block text-sm font-medium text-slate-700">Case type</label>
                <input id="case-type" required maxLength={120} value={caseType} onChange={(event) => setCaseType(event.target.value)} placeholder="Enter case type" className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-slate-800" />
              </div>
              <div>
                <label htmlFor="parties" className="mb-2 block text-sm font-medium text-slate-700">Parties</label>
                <textarea id="parties" required rows={4} value={partyNames} onChange={(event) => setPartyNames(event.target.value)} placeholder={"Enter one party per line"} className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-slate-800" />
                <p className="mt-1 text-xs text-slate-500">Enter up to 20 party names, one per line.</p>
              </div>
              <div>
                <label htmlFor="document" className="mb-2 block text-sm font-medium text-slate-700">PDF document</label>
                <input id="document" type="file" accept="application/pdf,.pdf" required onChange={selectFile} className="block w-full rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-700 file:mr-4 file:rounded-md file:border-0 file:bg-emerald-800 file:px-4 file:py-2 file:font-semibold file:text-white" />
                {document && <p className="mt-2 text-sm text-slate-600">{document.name} · {(document.size / (1024 * 1024)).toFixed(2)} MB</p>}
              </div>
            </div>

            <aside className="flex flex-col gap-5">
              <section className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                <h2 className="font-semibold text-slate-900">Review submission</h2>
                <dl className="mt-4 space-y-3 text-sm">
                  <div><dt className="text-slate-500">Court</dt><dd className="font-medium text-slate-800">{court}</dd></div>
                  <div><dt className="text-slate-500">Document</dt><dd className="font-medium text-slate-800">{documentType}</dd></div>
                  <div><dt className="text-slate-500">Case title</dt><dd className="font-medium text-slate-800">{title || "Not entered"}</dd></div>
                  <div><dt className="text-slate-500">Case type</dt><dd className="font-medium text-slate-800">{caseType || "Not entered"}</dd></div>
                  <div><dt className="text-slate-500">Parties entered</dt><dd className="font-medium text-slate-800">{partyNames.split(/\r?\n/).filter((party) => party.trim()).length}</dd></div>
                </dl>
              </section>
              <label className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
                <input type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} className="mt-1 h-4 w-4 accent-emerald-700" />
                I confirm that the filing details and uploaded document are correct.
              </label>
              <button type="submit" disabled={submitting} className="min-h-12 rounded-lg bg-[#173b30] px-5 text-sm font-semibold text-white hover:bg-[#0f2d23] disabled:cursor-wait disabled:opacity-60">
                {submitting ? "Submitting filing…" : "Submit filing"}
              </button>
              <p className="text-xs leading-5 text-slate-500">On successful submission, the system generates a case number and timestamped receipt.</p>
            </aside>
          </form>
        </section>
      </div>
    </LawyerPageShell>
  );
}
