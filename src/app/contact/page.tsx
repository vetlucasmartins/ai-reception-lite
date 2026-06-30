import Link from "next/link";
import { Inbox } from "lucide-react";
import { z } from "zod";
import { LeadCaptureForm } from "@/components/lead-capture-form";
import { getDefaultBusinessId } from "@/lib/config";
import { getRepository } from "@/lib/data";

type ContactPageProps = {
  searchParams: Promise<{
    businessId?: string;
  }>;
};

export default async function ContactPage({ searchParams }: ContactPageProps) {
  const params = await searchParams;
  const businessId = resolveBusinessId(params.businessId);
  const business = await getRepository().getPublicBusiness(businessId).catch(() => null);

  if (!business) {
    return (
      <main className="mx-auto flex min-h-dvh max-w-2xl flex-col justify-center px-4 py-12 sm:px-6">
        <p className="text-sm font-semibold uppercase text-signal-hot">Contact form unavailable</p>
        <h1 className="mt-3 text-3xl font-semibold text-ink">Business profile not found</h1>
        <p className="mt-3 text-base leading-7 text-slate-600">
          Add a valid <code className="rounded bg-surface px-1">businessId</code> query
          parameter, or set <code className="rounded bg-surface px-1">NEXT_PUBLIC_DEFAULT_BUSINESS_ID</code>.
        </p>
        <Link
          className="button-primary mt-8 w-fit"
          href="/login"
        >
          <Inbox aria-hidden="true" className="h-4 w-4" />
          Open dashboard
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto grid min-h-dvh w-full max-w-7xl items-center gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
      <section className="neo-panel-strong p-5 sm:p-8">
        <LeadCaptureForm
          businessId={business.id}
          businessName={business.name}
          services={business.services}
        />
      </section>
      <aside className="grid gap-4">
        <div className="neo-panel p-5">
          <p className="eyebrow">Services</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {business.services.map((service) => (
              <span
                className="neo-inset px-3 py-2 text-sm font-semibold text-slate-700"
                key={service}
              >
                {service}
              </span>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-ink p-5 text-white shadow-panel">
          <p className="text-sm font-semibold uppercase text-teal-100">Opening hours</p>
          <dl className="mt-4 grid gap-2 text-sm text-slate-200">
            {Object.entries(business.openingHours).map(([day, hours]) => (
              <div className="flex items-center justify-between gap-3" key={day}>
                <dt className="font-semibold text-white">{day}</dt>
                <dd>{hours}</dd>
              </div>
            ))}
          </dl>
        </div>
      </aside>
    </main>
  );
}

function resolveBusinessId(value?: string) {
  if (!value) {
    return getDefaultBusinessId();
  }

  const parsed = z.string().uuid().safeParse(value);
  return parsed.success ? parsed.data : value;
}
