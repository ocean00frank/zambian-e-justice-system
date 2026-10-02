import Image from "next/image";
import Link from "next/link";
import { PortalHeader } from "@/components/portal-header";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#f8f8f4] text-[#173b30]">
      <PortalHeader />
      <main className="mx-auto flex min-h-[calc(100vh-73px)] max-w-7xl items-center justify-center px-5 py-12 sm:px-8">
        <section className="w-full max-w-md">
          <div className="mb-7 text-center">
            <Image
              src="/image.png"
              alt=""
              width={96}
              height={96}
              className="mx-auto mb-5 h-20 w-20 object-contain"
            />
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#987a3e]">
              Secure access
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#173b30]">
              Sign in to your account
            </h1>
            <p className="mt-2 text-sm text-[#68776f]">
              Use the credentials provided by your administrator.
            </p>
          </div>

          <form className="space-y-5 border border-[#173b30]/10 bg-white p-6 shadow-[0_12px_35px_rgba(23,59,48,0.06)] sm:p-8">
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-[#314b40]">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="username"
                placeholder="name@example.com"
                className="w-full rounded-md border border-[#173b30]/15 bg-[#fbfcfa] px-4 py-3 text-sm text-[#173b30] outline-none transition placeholder:text-[#98a39d] focus:border-[#173b30] focus:ring-2 focus:ring-[#173b30]/10"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-medium text-[#314b40]">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                className="w-full rounded-md border border-[#173b30]/15 bg-[#fbfcfa] px-4 py-3 text-sm text-[#173b30] outline-none transition placeholder:text-[#98a39d] focus:border-[#173b30] focus:ring-2 focus:ring-[#173b30]/10"
              />
            </div>

            <div>
              <label htmlFor="role" className="mb-2 block text-sm font-medium text-[#314b40]">
                Account type
              </label>
              <select
                id="role"
                name="role"
                defaultValue="Legal Practitioner"
                className="w-full rounded-md border border-[#173b30]/15 bg-[#fbfcfa] px-4 py-3 text-sm text-[#173b30] outline-none transition focus:border-[#173b30] focus:ring-2 focus:ring-[#173b30]/10"
              >
                <option>Legal Practitioner</option>
                <option>Judicial Officer</option>
                <option>Court Registry</option>
                <option>Administrator</option>
              </select>
            </div>

            <Link
              href="/dashboards/lawyer"
              className="flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-[#173b30] px-4 text-sm font-semibold text-white transition hover:bg-[#0f2d23] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#173b30]"
            >
              Sign in <span aria-hidden="true">→</span>
            </Link>

            <p className="text-center text-xs leading-5 text-[#78867f]">
              Access is limited to users with provisioned accounts.
            </p>
          </form>
        </section>
      </main>
    </div>
  );
}
