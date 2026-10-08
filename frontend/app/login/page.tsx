"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { PortalHeader } from "@/components/portal-header";
import { ApiUser, apiRequest, dashboardPathByRole } from "@/components/api";

type LoginResponse = {
  token: string;
  user: ApiUser;
};

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const response = await apiRequest<LoginResponse>("auth/login/", {
        method: "POST",
        body: JSON.stringify({ username: identifier.trim(), password }),
      });
      window.sessionStorage.setItem("ejustice_token", response.token);
      router.replace(dashboardPathByRole[response.user.role]);
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Sign in failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f8f8f4] text-[#173b30]">
      <PortalHeader />
      <main className="mx-auto flex min-h-[calc(100vh-73px)] max-w-7xl items-center justify-center px-5 py-12 sm:px-8">
        <section className="w-full max-w-md">
          <div className="mb-7 text-center">
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

          <form
            onSubmit={handleSubmit}
            className="space-y-5 border border-[#173b30]/10 bg-white p-6 shadow-[0_12px_35px_rgba(23,59,48,0.06)] sm:p-8"
          >
            <div>
              <label htmlFor="identifier" className="mb-2 block text-sm font-medium text-[#314b40]">
                Email address or username
              </label>
              <input
                id="identifier"
                name="identifier"
                type="text"
                autoComplete="username"
                required
                value={identifier}
                onChange={(event) => setIdentifier(event.target.value)}
                placeholder="name@example.com"
                className="w-full rounded-md border border-[#173b30]/15 bg-[#fbfcfa] px-4 py-3 text-sm text-[#173b30] outline-none transition placeholder:text-[#98a39d] focus:border-[#173b30] focus:ring-2 focus:ring-[#173b30]/10"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-medium text-[#314b40]">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  className="w-full rounded-md border border-[#173b30]/15 bg-[#fbfcfa] px-4 py-3 pr-20 text-sm text-[#173b30] outline-none transition placeholder:text-[#98a39d] focus:border-[#173b30] focus:ring-2 focus:ring-[#173b30]/10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-controls="password"
                  aria-pressed={showPassword}
                  className="absolute inset-y-0 right-3 text-sm font-semibold text-[#173b30] underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#173b30]"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {error && (
              <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-[#173b30] px-4 text-sm font-semibold text-white transition hover:bg-[#0f2d23] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#173b30] disabled:cursor-wait disabled:opacity-70"
            >
              {submitting ? "Signing in…" : "Sign in"} <span aria-hidden="true">→</span>
            </button>

            <p className="text-center text-xs leading-5 text-[#78867f]">
              Access is limited to users with provisioned accounts.
            </p>
          </form>
        </section>
      </main>
    </div>
  );
}
