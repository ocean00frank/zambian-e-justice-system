import Link from "next/link";
import type { ReactNode } from "react";

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
};

export function DashboardShell({
  title,
  subtitle,
  role,
  navItems,
  children,
}: DashboardShellProps) {
  return (
    <div className="min-h-screen bg-[#f8f8f4] text-[#173b30]">
      <div className="mx-auto flex max-w-[1600px]">
        <aside className="hidden min-h-screen w-72 border-r border-white/10 bg-[#173b30] p-6 text-white lg:block">
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
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between rounded-md px-3 py-2.5 text-sm font-medium transition ${
                  item.active
                    ? "bg-white text-[#173b30]"
                    : "text-emerald-50/80 hover:bg-white/10 hover:text-white"
                }`}
              >
                <span>{item.label}</span>
                {item.active ? <span className="h-2 w-2 rounded-full bg-[#b79a5a]" /> : null}
              </Link>
            ))}
          </nav>

          <div className="mt-10 border-t border-white/15 pt-4">
            <p className="text-xs uppercase tracking-[0.18em] text-emerald-100/70">Secure workspace</p>
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
                <div className="hidden border border-[#173b30]/10 bg-[#f8f8f4] px-3 py-1 text-xs font-medium text-[#68776f] md:block">
                  Secure session active
                </div>
                <div className="flex items-center gap-3 border border-[#173b30]/10 bg-white px-3 py-2">
                  <div className="flex h-9 w-9 items-center justify-center bg-[#173b30] text-sm font-semibold text-white">
                    EN
                  </div>
                  <div className="hidden text-left sm:block">
                    <p className="text-sm font-semibold text-[#173b30]">Evelyn N.</p>
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
