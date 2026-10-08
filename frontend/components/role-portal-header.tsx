"use client";

import { useEffect, useState } from "react";
import { ApiUser, apiRequest, dashboardPathByRole, getSessionToken } from "@/components/api";
import { PortalHeader } from "@/components/portal-header";

type RolePortalHeaderProps = {
  backLabel?: string;
};

export function RolePortalHeader({ backLabel = "Dashboard" }: RolePortalHeaderProps) {
  const [destination, setDestination] = useState("/login");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const loadUser = async () => {
      const token = getSessionToken();
      if (!token) {
        setMessage("Sign in to return to your dashboard.");
        return;
      }
      try {
        const user = await apiRequest<ApiUser>("auth/me/", { signal: controller.signal }, token);
        setDestination(dashboardPathByRole[user.role]);
      } catch (requestError) {
        if (!controller.signal.aborted) {
          setDestination("/login");
          setMessage(
            requestError instanceof Error
              ? requestError.message
              : "Could not verify your account. Please sign in again.",
          );
        }
      }
    };
    void loadUser();
    return () => controller.abort();
  }, []);

  return (
    <>
      <PortalHeader
        backHref={destination}
        backLabel={destination === "/login" ? "Sign in" : backLabel}
      />
      {message && (
        <p role="alert" className="bg-amber-50 px-5 py-2 text-center text-sm text-amber-950">
          {message}
        </p>
      )}
    </>
  );
}
