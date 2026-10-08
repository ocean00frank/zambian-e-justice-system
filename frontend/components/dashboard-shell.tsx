"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ReactNode } from "react";
import { apiRequest, getSessionToken } from "@/components/api";

export type NavItem = {
  label: string;
  href: string;
  active?: boolean;
};

type DashboardShellProps = {
  title: string;
  subtitle: string;
  role: string;
  navItems: NavItem[];
  children: ReactNode;
  userName: string;
};

function NavIcon({ label }: { label: string }) {
  const common = {
    "aria-hidden": true as const,
    className: "h-5 w-5 shrink-0",
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    strokeWidth: 1.7,
    viewBox: "0 0 24 24",
  };

  switch (label) {
    case "Dashboard":
      return <svg {...common}><rect x="3.5" y="3.5" width="7" height="7" rx="1" /><rect x="13.5" y="3.5" width="7" height="7" rx="1" /><rect x="3.5" y="13.5" width="7" height="7" rx="1" /><rect x="13.5" y="13.5" width="7" height="7" rx="1" /></svg>;
    case "My Cases":
      return <svg {...common}><path d="M6 3.5h8l4 4v13H6z" /><path d="M14 3.5v5h5M9 13h6M9 16.5h6" /></svg>;
    case "E-Filing":
      return <svg {...common}><path d="M12 15V3.5m0 0L8 7.5m4-4 4 4" /><path d="M5 13v6.5h14V13" /></svg>;
    case "Cause List":
      return <svg {...common}><rect x="3.5" y="5" width="17" height="15.5" rx="2" /><path d="M7.5 3.5v3M16.5 3.5v3M3.5 9.5h17M8 13h2m4 0h2M8 16.5h2" /></svg>;
    case "Documents":
      return <svg {...common}><path d="M6 3.5h8l4 4v13H6z" /><path d="M14 3.5v5h5M9 13h6M9 16.5h6" /></svg>;
    case "Notifications":
      return <svg {...common}><path d="M18 9a6 6 0 0 0-12 0c0 7-2.5 7-2.5 9h17C20.5 16 18 16 18 9ZM10 21h4" /></svg>;
    default:
      return <svg {...common}><circle cx="12" cy="12" r="8.5" /><path d="M12 11v5m0-8h.01" /></svg>;
  }
}

export function DashboardShell({
  title,
  subtitle,
  role,
  navItems,
  children,
  userName,
}: DashboardShellProps) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);
  const initials = userName
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");

  async function handleLogout() {
    setLoggingOut(true);
    setLogoutError(null);
    try {
      await apiRequest<void>("auth/logout/", { method: "POST" }, getSessionToken());
      window.sessionStorage.removeItem("ejustice_token");
      router.replace("/login");
    } catch (error) {
      setLogoutError(error instanceof Error ? error.message : "Could not sign out. Please try again.");
      setLoggingOut(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f8f8f4] text-[#173b30]">
      <div className="mx-auto flex max-w-[1600px]">
        <aside className={`hidden w-72 shrink-0 flex-col border-r border-white/10 bg-[#173b30] p-6 text-white lg:flex ${role === "Lawyer" ? "sticky top-0 h-screen" : "min-h-screen"}`}>
          <div className="mb-8">
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center border border-white/40 text-xs font-bold">
                ZJ
              </span>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-100/70">
                  The Judiciary of Zambia
                </p>
                <p className="text-sm font-semibold text-white">E-Justice System</p>
              </div>
            </div>
            <p className="border-t border-white/15 pt-5 text-lg font-semibold">{role} portal</p>
          </div>

          <nav aria-label="Dashboard navigation" className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={`${item.href}-${item.label}`}
                href={item.href}
                className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition ${
                  item.active
                    ? "bg-white text-[#173b30]"
                    : "text-emerald-50/80 hover:bg-white/10 hover:text-white"
                }`}
              >
                <NavIcon label={item.label} />
                <span className="flex-1">{item.label}</span>
                {item.active ? <span className="h-2 w-2 rounded-full bg-[#b79a5a]" /> : null}
              </Link>
            ))}
          </nav>

          <div className="mt-auto border-t border-white/15 pt-4">
            <p className="mb-4 text-xs uppercase tracking-[0.18em] text-emerald-100/70">Secure workspace</p>
            {logoutError && <p role="alert" className="mb-3 text-xs leading-5 text-red-200">{logoutError}</p>}
            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm font-medium text-emerald-50/80 transition hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-wait disabled:opacity-60"
            >
              <svg aria-hidden="true" className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" viewBox="0 0 24 24">
                <path d="M10 17l5-5-5-5m5 5H3.5M13 3.5h5a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2h-5" />
              </svg>
              <span>{loggingOut ? "Signing out?" : "Sign out"}</span>
            </button>
          </div>
        </aside>

        <div className="flex-1">
          <header className="border-b border-[#173b30]/10 bg-white">
            <div className="flex items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#987a3e]">
                  {role}
                </p>
                <h2 className="text-xl font-semibold text-[#173b30]">{title}</h2>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-3 border border-[#173b30]/10 bg-white px-3 py-2">
                  <div className="flex h-9 w-9 items-center justify-center bg-[#173b30] text-sm font-semibold text-white">
                    {initials || "U"}
                  </div>
                  <div className="hidden text-left sm:block">
                    <p className="text-sm font-semibold text-[#173b30]">{userName}</p>
                    <p className="text-xs text-[#78867f]">{subtitle}</p>
                  </div>
                </div>
              </div>
            </div>
          </header>

          <main className="p-4 sm:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
