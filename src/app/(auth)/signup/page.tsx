import Link from "next/link";
import { UserPlus } from "lucide-react";
import { signUpAction } from "@/lib/auth/actions";

type SignupPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const params = await searchParams;

  return (
    <main className="mx-auto grid min-h-dvh w-full max-w-6xl items-center gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
      <section>
        <p className="text-sm font-semibold uppercase text-teal-700">AI Reception Lite</p>
        <h1 className="mt-3 max-w-xl text-4xl font-semibold leading-tight text-ink sm:text-5xl">
          Create the workspace for your AI receptionist.
        </h1>
        <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">
          Each account gets one business profile in the MVP. You can configure
          services, tone of voice, and opening hours after signup.
        </p>
      </section>

      <section className="rounded-md border border-line bg-white p-5 shadow-panel sm:p-8">
        <h2 className="text-2xl font-semibold text-ink">Sign up</h2>
        <form action={signUpAction} className="mt-6 grid gap-4">
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Full name
            <input
              className="focus-ring min-h-11 rounded-md border border-line px-3 text-base"
              name="fullName"
              autoComplete="name"
            />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Email
            <input
              className="focus-ring min-h-11 rounded-md border border-line px-3 text-base"
              name="email"
              type="email"
              required
              autoComplete="email"
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
              autoComplete="new-password"
            />
          </label>

          {params.error ? (
            <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              {params.error}
            </p>
          ) : null}

          <button
            className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-ink px-5 text-sm font-semibold text-white"
            type="submit"
          >
            <UserPlus aria-hidden="true" className="h-4 w-4" />
            Create account
          </button>
        </form>
        <p className="mt-5 text-sm text-slate-600">
          Already have an account?{" "}
          <Link className="font-semibold text-teal-700 underline" href="/login">
            Login
          </Link>
        </p>
      </section>
    </main>
  );
}
