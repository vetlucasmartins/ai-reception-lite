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
        <p className="eyebrow">Settings</p>
        <h1 className="mt-2 text-3xl font-semibold text-ink">Business configuration</h1>
      </div>

      <section className="neo-panel-strong mt-6 p-5 sm:p-6">
        <p className="text-sm font-semibold uppercase text-slate-500">Public form</p>
        <div className="neo-inset mt-3 flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="break-all text-sm text-slate-700">{publicFormUrl}</p>
          <Link
            className="button-primary min-h-10 w-fit px-3"
            href={publicFormUrl}
          >
            <ExternalLink aria-hidden="true" className="h-4 w-4" />
            Open
          </Link>
        </div>
      </section>

      <form
        action={updateBusinessSettingsAction}
        className="neo-panel-strong mt-6 grid gap-5 p-5 sm:p-6"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="field-label">
            Business name
            <input
              className="field-control"
              name="name"
              required
              defaultValue={business.name}
            />
          </label>
          <label className="field-label">
            Timezone
            <input
              className="field-control"
              name="timezone"
              required
              defaultValue={business.timezone}
            />
          </label>
        </div>

        <label className="field-label">
          Tone of voice
          <input
            className="field-control"
            name="toneOfVoice"
            required
            defaultValue={business.toneOfVoice}
          />
        </label>

        <label className="field-label">
          Services
          <textarea
            className="field-control min-h-36 py-3 leading-7"
            name="services"
            required
            defaultValue={services}
          />
        </label>

        <label className="field-label">
          Opening hours
          <textarea
            className="field-control min-h-36 py-3 leading-7"
            name="openingHours"
            required
            defaultValue={openingHours}
          />
        </label>

        {params.error ? (
          <p className="status-callout-error">
            {params.error}
          </p>
        ) : null}
        {params.message ? (
          <p className="status-callout-success">
            {params.message}
          </p>
        ) : null}

        <button
          className="button-accent w-fit"
          type="submit"
        >
          <Save aria-hidden="true" className="h-4 w-4" />
          Save settings
        </button>
      </form>
    </main>
  );
}
