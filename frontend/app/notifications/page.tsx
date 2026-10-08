"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ApiNotification, PaginatedResponse, apiRequest, formatDate, getSessionToken } from "@/components/api";
import { LawyerPageShell } from "@/components/lawyer-page-shell";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<ApiNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  const load = useCallback(async (signal: AbortSignal) => {
    const token = getSessionToken();
    if (!token) {
      setError("Sign in to view notifications.");
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const response = await apiRequest<PaginatedResponse<ApiNotification>>("notifications/", { signal }, token);
      setNotifications(response.results);
      setError(null);
    } catch (loadError) {
      if (!signal.aborted) setError(loadError instanceof Error ? loadError.message : "Could not load notifications.");
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

  async function toggleRead(item: ApiNotification) {
    const token = getSessionToken();
    if (!token) {
      setError("Sign in to update notifications.");
      return;
    }
    setError(null);
    try {
      const updated = await apiRequest<ApiNotification>(`notifications/${item.id}/`, {
        method: "PATCH",
        body: JSON.stringify({ is_read: !item.is_read }),
      }, token);
      setNotifications((current) => current.map((notification) => notification.id === updated.id ? updated : notification));
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Could not update notification.");
    }
  }

  return (
    <LawyerPageShell title="Notifications">
      <div className="bg-[#f8f8f4]">
        <section className="mx-auto max-w-5xl border border-[#173b30]/10 bg-white p-6 shadow-sm lg:p-8">
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Notifications</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">Updates and alerts</h1>
          </div>
          {error && (
            <div role="alert" className="mb-5 flex flex-wrap justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
              <p>{error}</p>
              {error.includes("sign in") || error.includes("session has expired")
                ? <Link href="/login" className="font-semibold underline">Sign in</Link>
                : <button onClick={() => setAttempt((value) => value + 1)} className="font-semibold underline">Try again</button>}
            </div>
          )}
          {loading ? <p className="py-8 text-sm text-slate-500">Loading notifications…</p>
            : notifications.length ? (
              <ul className="divide-y divide-slate-200">
                {notifications.map((item) => (
                  <li key={item.id} className="flex flex-col gap-4 py-5 first:pt-0 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex gap-3">
                      <span aria-hidden="true" className={`mt-2 h-2.5 w-2.5 shrink-0 rounded-full ${item.is_read ? "bg-slate-300" : "bg-emerald-600"}`} />
                      <div>
                        <p className="font-semibold text-slate-900">{item.title}</p>
                        <p className="mt-1 text-sm text-slate-600">{item.message}</p>
                        <p className="mt-2 text-xs text-slate-500">
                          {item.case_number ? `${item.case_number} · ` : ""}{formatDate(item.created_at)}
                        </p>
                      </div>
                    </div>
                    <button type="button" onClick={() => void toggleRead(item)} className="self-start text-sm font-semibold text-emerald-700 hover:text-emerald-900">
                      Mark as {item.is_read ? "unread" : "read"}
                    </button>
                  </li>
                ))}
              </ul>
            ) : !error && <p className="py-10 text-center text-sm text-slate-500">You have no notifications yet.</p>}
        </section>
      </div>
    </LawyerPageShell>
  );
}
