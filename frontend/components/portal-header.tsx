import Link from "next/link";

type PortalHeaderProps = {
  backHref?: string;
  backLabel?: string;
};

export function PortalHeader({
  backHref = "/",
  backLabel = "Home",
}: PortalHeaderProps) {
  return (
    <header className="border-b border-[#173b30]/10 bg-white">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
        <Link href="/" className="flex items-center gap-3" aria-label="Zambian Judiciary home">
          <span className="flex h-10 w-10 items-center justify-center border border-[#173b30] text-xs font-bold tracking-wide text-[#173b30]">
            ZJ
          </span>
          <span>
            <span className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-[#6a7972]">
              The Judiciary of Zambia
            </span>
            <span className="block text-sm font-semibold text-[#173b30]">E-Justice System</span>
          </span>
        </Link>

        <Link
          href={backHref}
          className="text-sm font-semibold text-[#315b4d] transition hover:text-[#173b30] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#173b30]"
        >
          {backLabel}
        </Link>
      </div>
    </header>
  );
}
