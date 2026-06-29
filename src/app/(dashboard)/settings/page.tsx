import Link from "next/link";
import { ExternalLink, Save } from "lucide-react";
import { updateBusinessSettingsAction } from "@/lib/business/actions";
import { requireUser } from "@/lib/auth/session";
import { getAppUrl } from "@/lib/config";
import { getRepository } from "@/lib/data";

type SettingsPageProps = {
  searchParams: Promise<{
    error?: string;
    message?: string;
  }>;
};

export default async function SettingsPage({ searchParams }: SettingsPageProps) {
  const user = await requireUser();
  const params = await searchParams;
  const business = await getRepository().ensureBusinessForUser(user);
  const publicFormUrl = `${getAppUrl()}/contact?businessId=${business.id}`;
  const services = business.services.join("\n");
  const openingHours = Object.entries(business.openingHours)
    .map(([day, hours]) => `${day}: ${hours}`)
    .join("\n");

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div>
        <p className="text-sm font-semibold uppercase text-teal-700">Settings</p>
        <h1 className="mt-2 text-3xl font-semibold text-ink">Business configuration</h1>
      </div>

      <section className="mt-6 rounded-md border border-line bg-white p-5 shadow-sm sm:p-6">
        <p className="text-sm font-semibold uppercase text-slate-500">Public form</p>
        <div className="mt-3 flex flex-col gap-3 rounded-md border border-line bg-paper p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="break-all text-sm text-slate-700">{publicFormUrl}</p>
          <Link
            className="focus-ring inline-flex min-h-10 w-fit items-center gap-2 rounded-md bg-ink px-3 text-sm font-semibold text-white"
            href={publicFormUrl}
          >
            <ExternalLink aria-hidden="true" className="h-4 w-4" />
            Open
          </Link>
        </div>
      </section>

      <form
        action={updateBusinessSettingsAction}
        className="mt-6 grid gap-5 rounded-md border border-line bg-white p-5 shadow-sm sm:p-6"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Business name
            <input
              className="focus-ring min-h-11 rounded-md border border-line px-3 text-base"
              name="name"
              required
              defaultValue={business.name}
            />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Timezone
            <input
              className="focus-ring min-h-11 rounded-md border border-line px-3 text-base"
              name="timezone"
              required
              defaultValue={business.timezone}
            />
          </label>
        </div>

        <label className="grid gap-2 text-sm font-semibold text-slate-700">
          Tone of voice
          <input
            className="focus-ring min-h-11 rounded-md border border-line px-3 text-base"
            name="toneOfVoice"
            required
            defaultValue={business.toneOfVoice}
          />
        </label>

        <label className="grid gap-2 text-sm font-semibold text-slate-700">
          Services
          <textarea
            className="focus-ring min-h-36 rounded-md border border-line px-3 py-3 text-base leading-7"
            name="services"
            required
            defaultValue={services}
          />
        </label>

        <label className="grid gap-2 text-sm font-semibold text-slate-700">
          Opening hours
          <textarea
            className="focus-ring min-h-36 rounded-md border border-line px-3 py-3 text-base leading-7"
            name="openingHours"
            required
            defaultValue={openingHours}
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
          className="focus-ring inline-flex min-h-12 w-fit items-center gap-2 rounded-md bg-teal-700 px-5 text-sm font-semibold text-white"
          type="submit"
        >
          <Save aria-hidden="true" className="h-4 w-4" />
          Save settings
        </button>
      </form>
    </main>
  );
}
