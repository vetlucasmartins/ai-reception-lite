"use client";

export default function ErrorPage({
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col justify-center px-6 py-16">
      <p className="text-sm font-semibold uppercase text-signal-hot">Error</p>
      <h1 className="mt-3 text-3xl font-semibold text-ink">Something went wrong</h1>
      <p className="mt-3 text-base leading-7 text-slate-600">
        The app could not complete that request. Try again, or check the server logs
        if you are running locally.
      </p>
      <button
        className="button-primary mt-8 w-fit"
        type="button"
        onClick={reset}
      >
        Try again
      </button>
    </main>
  );
}
