import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";
import { TemperatureBadge, StatusBadge } from "@/components/status-badge";
import { requireUser } from "@/lib/auth/session";
import { getRepository } from "@/lib/data";
import {
  leadStatuses,
  leadTemperatures,
  type LeadStatus,
  type LeadTemperature
} from "@/lib/domain/types";
import { formatDateTime, titleize } from "@/lib/utils";

type DashboardPageProps = {
  searchParams: Promise<{
    temperature?: string;
    status?: string;
    q?: string;
  }>;
};

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const user = await requireUser();
  const params = await searchParams;
  const temperature = normalizeFilter<LeadTemperature>(params.temperature, leadTemperatures);
  const status = normalizeFilter<LeadStatus>(params.status, leadStatuses);
  const result = await getRepository().listLeadsForUser(user.id, {
    temperature,
    status,
    q: params.q
  });
  const hotCount = result.items.filter((lead) => lead.temperature === "hot").length;

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase text-teal-700">Dashboard</p>
          <h1 className="mt-2 text-3xl font-semibold text-ink">Leads</h1>
          <p className="mt-2 text-base text-slate-600">
            {result.total} total leads, {hotCount} marked hot.
          </p>
        </div>
        <Link
          className="focus-ring inline-flex min-h-11 w-fit items-center gap-2 rounded-md bg-ink px-4 text-sm font-semibold text-white"
          href="/contact"
        >
          Public form
          <ArrowRight aria-hidden="true" className="h-4 w-4" />
        </Link>
      </div>

      <form className="mt-6 grid gap-3 rounded-md border border-line bg-white p-4 sm:grid-cols-[1fr_180px_180px_auto]">
        <label className="grid gap-2 text-sm font-semibold text-slate-700">
          Search
          <div className="relative">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            />
            <input
              className="focus-ring min-h-11 w-full rounded-md border border-line bg-white py-2 pl-9 pr-3 text-base"
              name="q"
              defaultValue={params.q}
              placeholder="Name, service, summary"
            />
          </div>
        </label>
        <label className="grid gap-2 text-sm font-semibold text-slate-700">
          Temperature
          <select
            className="focus-ring min-h-11 rounded-md border border-line bg-white px-3 text-base"
            name="temperature"
            defaultValue={temperature ?? ""}
          >
            <option value="">All</option>
            {leadTemperatures.map((value) => (
              <option key={value} value={value}>
                {titleize(value)}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-semibold text-slate-700">
          Status
          <select
            className="focus-ring min-h-11 rounded-md border border-line bg-white px-3 text-base"
            name="status"
            defaultValue={status ?? ""}
          >
            <option value="">All</option>
            {leadStatuses.map((value) => (
              <option key={value} value={value}>
                {titleize(value)}
              </option>
            ))}
          </select>
        </label>
        <button
          className="focus-ring mt-auto inline-flex min-h-11 items-center justify-center rounded-md bg-teal-700 px-4 text-sm font-semibold text-white"
          type="submit"
        >
          Filter
        </button>
      </form>

      <section className="mt-6 grid gap-3 lg:hidden">
        {result.items.map((lead) => (
          <Link
            className="focus-ring rounded-md border border-line bg-white p-4 shadow-sm"
            data-testid="lead-link"
            href={`/leads/${lead.id}`}
            key={lead.id}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-ink">{lead.name}</h2>
                <p className="mt-1 text-sm text-slate-600">
                  {lead.requestedService ?? "Service not specified"}
                </p>
              </div>
              <TemperatureBadge value={lead.temperature} />
            </div>
            <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
              {lead.summary ?? "Classification pending."}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <StatusBadge value={lead.status} />
              {lead.suggestedNextAction ? (
                <StatusBadge value={lead.suggestedNextAction} />
              ) : null}
            </div>
          </Link>
        ))}
      </section>

      <section className="mt-6 hidden overflow-x-auto rounded-md border border-line bg-white lg:block">
        <table className="min-w-full divide-y divide-line text-left">
          <thead className="bg-paper">
            <tr>
              <th className="px-4 py-3 text-xs font-semibold uppercase text-slate-600">
                Lead
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase text-slate-600">
                Temperature
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase text-slate-600">
                Service
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase text-slate-600">
                Summary
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase text-slate-600">
                Created
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase text-slate-600">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {result.items.map((lead) => (
              <tr
                className={lead.temperature === "hot" ? "bg-red-50/55" : "bg-white"}
                data-testid="lead-row"
                key={lead.id}
              >
                <td className="px-4 py-4">
                  <Link className="focus-ring rounded-sm font-semibold text-ink" href={`/leads/${lead.id}`}>
                    <span data-testid="lead-link">
                      {lead.name}
                    </span>
                  </Link>
                  <p className="mt-1 text-xs text-slate-500">{lead.email ?? lead.phone}</p>
                </td>
                <td className="px-4 py-4">
                  <TemperatureBadge value={lead.temperature} />
                </td>
                <td className="max-w-52 px-4 py-4 text-sm text-slate-700">
                  {lead.requestedService ?? "Not specified"}
                </td>
                <td className="max-w-md px-4 py-4 text-sm leading-6 text-slate-600">
                  {lead.summary ?? "Classification pending."}
                </td>
                <td className="px-4 py-4 text-sm text-slate-600">
                  {formatDateTime(lead.createdAt)}
                </td>
                <td className="px-4 py-4">
                  {lead.suggestedNextAction ? (
                    <StatusBadge value={lead.suggestedNextAction} />
                  ) : (
                    <StatusBadge value={lead.status} />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {result.items.length === 0 ? (
        <div className="mt-6 rounded-md border border-dashed border-line bg-white p-8 text-center">
          <h2 className="text-lg font-semibold text-ink">No leads match these filters</h2>
          <p className="mt-2 text-sm text-slate-600">
            New submissions from the public form will appear here.
          </p>
        </div>
      ) : null}
    </main>
  );
}

function normalizeFilter<T extends string>(
  value: string | undefined,
  allowed: readonly T[]
): T | undefined {
  return value && allowed.includes(value as T) ? (value as T) : undefined;
}
