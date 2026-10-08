"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { ApiUser, apiRequest, dashboardPathByRole, getSessionToken } from "@/components/api";
import { DashboardShell, type NavItem } from "@/components/dashboard-shell";

const lawyerNavigation: NavItem[] = [
  { label: "Dashboard", href: "/dashboards/lawyer" },
  { label: "My Cases", href: "/cases" },
  { label: "E-Filing", href: "/e-filing" },
  { label: "Cause List", href: "/cause-list" },
  { label: "Documents", href: "/documents" },
  { label: "Notifications", href: "/notifications" },
];

type LawyerPageShellProps = {
  title: string;
  children: ReactNode;
};

export function LawyerPageShell({ title, children }: LawyerPageShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<ApiUser | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const token = getSessionToken();
    if (!token) {
      router.replace("/login");
      return () => controller.abort();
    }

    const loadUser = async () => {
      try {
        const currentUser = await apiRequest<ApiUser>("auth/me/", { signal: controller.signal }, token);
        if (currentUser.role !== "lawyer") {
          router.replace(dashboardPathByRole[currentUser.role]);
          return;
        }
        setUser(currentUser);
      } catch (requestError) {
        if (!controller.signal.aborted) {
          setError(requestError instanceof Error ? requestError.message : "Could not verify your account.");
        }
      }
    };
    void loadUser();

    return () => controller.abort();
  }, [router]);

  if (error) {
    return (
      <div role="alert" className="flex min-h-screen items-center justify-center bg-[#f8f8f4] p-6 text-sm text-amber-950">
        <div className="max-w-lg rounded-lg border border-amber-200 bg-amber-50 p-5">
          <p>{error}</p>
          <button type="button" onClick={() => router.replace("/login")} className="mt-3 font-semibold underline">
            Return to sign in
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return <div className="min-h-screen bg-[#f8f8f4]" aria-label="Loading account" />;
  }

  const navItems = lawyerNavigation.map((item) => ({
    ...item,
    active:
      pathname === item.href ||
      (item.href === "/cases" && pathname.startsWith("/cases/")) ||
      (item.href === "/e-filing" && pathname.startsWith("/e-filing/")),
  }));

  return (
    <DashboardShell
      title={title}
      subtitle="Your casework"
      role="Lawyer"
      userName={user.full_name || user.username}
      navItems={navItems}
    >
      {children}
    </DashboardShell>
  );
}
