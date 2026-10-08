"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ApiCase,
  ApiHearing,
  ApiNotification,
  ApiUser,
  DashboardSummary,
  PaginatedResponse,
  UserRole,
  apiRequest,
  dashboardPathByRole,
  getSessionToken,
} from "@/components/api";

export type RoleDashboardData = {
  user: ApiUser;
  summary: DashboardSummary;
  cases: ApiCase[];
  hearings: ApiHearing[];
  notifications: ApiNotification[];
};

export function useRoleDashboard(requiredRole: UserRole) {
  const router = useRouter();
  const [data, setData] = useState<RoleDashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(0);

  const load = useCallback(async (signal: AbortSignal) => {
    const token = getSessionToken();
    if (!token) {
      setError("Please sign in to continue.");
      setLoading(false);
      return;
    }

    try {
      const user = await apiRequest<ApiUser>("auth/me/", { signal }, token);
      if (user.role !== requiredRole) {
        router.replace(dashboardPathByRole[user.role]);
        return;
      }

      const [summary, cases, hearings, notifications] = await Promise.all([
        apiRequest<DashboardSummary>("dashboard/summary/", { signal }, token),
        apiRequest<PaginatedResponse<ApiCase>>(
          requiredRole === "court_registry" ? "cases/?status=Filed" : "cases/",
          { signal },
          token,
        ),
        apiRequest<PaginatedResponse<ApiHearing>>("hearings/?upcoming=true", { signal }, token),
        apiRequest<PaginatedResponse<ApiNotification>>("notifications/", { signal }, token),
      ]);

      setData({
        user,
        summary,
        cases: cases.results,
        hearings: hearings.results,
        notifications: notifications.results,
      });
      setError(null);
    } catch (requestError) {
      if (!signal.aborted) {
        setError(requestError instanceof Error ? requestError.message : "Could not load dashboard data.");
      }
    } finally {
      if (!signal.aborted) setLoading(false);
    }
  }, [requiredRole, router]);

  useEffect(() => {
    const controller = new AbortController();
    const start = async () => {
      await load(controller.signal);
    };
    void start();
    return () => controller.abort();
  }, [attempt, load]);

  const retry = useCallback(() => {
    setLoading(true);
    setAttempt((current) => current + 1);
  }, []);

  return { data, error, loading, retry };
}
