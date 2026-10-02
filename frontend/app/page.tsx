import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#f8f8f4] text-[#173b30]">
      <header className="border-b border-[#173b30]/10 bg-white">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <Link href="/" className="flex items-center gap-3" aria-label="Zambian Judiciary home">
            <span className="flex h-10 w-10 items-center justify-center border border-[#173b30] text-xs font-bold tracking-wide">
              ZJ
            </span>
            <span>
              <span className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-[#6a7972]">
                The Judiciary of Zambia
              </span>
              <span className="block text-sm font-semibold">E-Justice System</span>
            </span>
          </Link>

          <Link
            href="/login"
            className="rounded-md bg-[#173b30] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0f2d23] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#173b30]"
          >
            Sign in
          </Link>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-5 py-12 sm:px-8">
        <section className="flex w-full max-w-2xl flex-col items-center text-center">
          <Image
            src="/image.png"
            alt="Judge's gavel"
            width={220}
            height={220}
            priority
            className="mb-7 h-36 w-36 object-contain sm:h-44 sm:w-44"
          />
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#987a3e]">
            Digital court services
          </p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-[-0.04em] sm:text-5xl">
            Zambian E-Justice System
          </h1>
          <p className="mt-4 max-w-md text-base leading-7 text-[#5e7068]">
            File court documents and follow case progress online.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/login"
              className="inline-flex min-h-12 items-center gap-3 rounded-md bg-[#173b30] px-6 text-sm font-semibold text-white transition hover:bg-[#0f2d23] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#173b30]"
            >
              Enter the portal
              <span aria-hidden="true">→</span>
            </Link>
            <Link
              href="/dashboards/public"
              className="inline-flex min-h-12 items-center rounded-md border border-[#173b30]/20 bg-white px-6 text-sm font-semibold text-[#173b30] transition hover:border-[#173b30]/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#173b30]"
            >
              Track a case
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
