import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col justify-center px-6 py-16">
      <p className="eyebrow">404</p>
      <h1 className="mt-3 text-3xl font-semibold text-ink">Page not found</h1>
      <p className="mt-3 text-base leading-7 text-slate-600">
        The page you requested does not exist or is not available in this demo.
      </p>
      <Link
        className="button-primary mt-8 w-fit"
        href="/contact"
      >
        Back to contact form
      </Link>
    </main>
  );
}
