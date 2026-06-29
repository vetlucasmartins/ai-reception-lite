import Link from "next/link";
import { LogIn } from "lucide-react";
import { isDemoAuthEnabled, DEMO_USER_EMAIL } from "@/lib/config";
import { signInAction } from "@/lib/auth/actions";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
    message?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;

  return (
    <main className="mx-auto grid min-h-dvh w-full max-w-6xl items-center gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
      <section>
        <p className="text-sm font-semibold uppercase text-teal-700">AI Reception Lite</p>
        <h1 className="mt-3 max-w-xl text-4xl font-semibold leading-tight text-ink sm:text-5xl">
          Review qualified leads before they go cold.
        </h1>
        <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">
          Sign in to see lead temperature, summaries, suggested next actions, and
          follow-up tasks from the public contact form.
        </p>
      </section>

      <section className="rounded-md border border-line bg-white p-5 shadow-panel sm:p-8">
        <h2 className="text-2xl font-semibold text-ink">Login</h2>
        <form action={signInAction} className="mt-6 grid gap-4">
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Email
            <input
              className="focus-ring min-h-11 rounded-md border border-line px-3 text-base"
              name="email"
              type="email"
              required
              autoComplete="email"
              defaultValue={isDemoAuthEnabled() ? DEMO_USER_EMAIL : ""}
            />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Password
            <input
              className="focus-ring min-h-11 rounded-md border border-line px-3 text-base"
              name="password"
              type="password"
              required
              minLength={6}
              autoComplete="current-password"
              defaultValue={isDemoAuthEnabled() ? "demo-password" : ""}
            />
          </label>

          {params.error ? (
            <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              {params.error}
            </p>
          ) : null}
          {params.message ? (
            <p className="rounded-md border border-teal-200 bg-teal-50 p-3 text-sm text-teal-800">
              {params.message}
            </p>
          ) : null}

          <button
            className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-ink px-5 text-sm font-semibold text-white"
            type="submit"
          >
            <LogIn aria-hidden="true" className="h-4 w-4" />
            Login
          </button>
        </form>
        <p className="mt-5 text-sm text-slate-600">
          No account yet?{" "}
          <Link className="font-semibold text-teal-700 underline" href="/signup">
            Create one
          </Link>
        </p>
      </section>
    </main>
  );
}
