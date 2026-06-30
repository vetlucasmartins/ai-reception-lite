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
  const warmCount = result.items.filter((lead) => lead.temperature === "warm").length;
  const activeCount = result.items.filter((lead) =>
    lead.status === "new" || lead.status === "open"
  ).length;
  const classifiedCount = result.items.filter(
    (lead) => lead.temperature !== "unclassified"
  ).length;
  const summaryCards = [
    {
      label: "Visible leads",
      value: result.total,
      detail: "Current filtered pipeline"
    },
    {
      label: "Hot",
      value: hotCount,
      detail: "Needs fast follow-up",
      tone: "text-red-700"
    },
    {
      label: "Warm",
      value: warmCount,
      detail: "Pricing or timing signal",
      tone: "text-amber-700"
    },
    {
      label: "Active",
      value: activeCount,
      detail: `${classifiedCount} classified by the demo model`,
      tone: "text-teal-700"
    }
  ];

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="eyebrow">Dashboard</p>
          <h1 className="mt-2 text-3xl font-semibold text-ink">Lead pipeline</h1>
          <p className="mt-2 text-base text-slate-600">
            {result.total} visible leads, {hotCount} marked hot.
          </p>
        </div>
        <Link
          className="button-primary w-fit"
          href="/contact"
        >
          Public form
          <ArrowRight aria-hidden="true" className="h-4 w-4" />
        </Link>
      </div>

      <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((card) => (
          <article className="neo-panel p-4" key={card.label}>
            <p className="text-sm font-semibold text-slate-600">{card.label}</p>
            <p className={`mt-3 text-3xl font-semibold ${card.tone ?? "text-ink"}`}>
              {card.value}
            </p>
            <p className="mt-1 text-sm leading-6 text-slate-600">{card.detail}</p>
          </article>
        ))}
      </section>

      <form className="neo-panel-strong mt-6 grid gap-3 p-4 sm:grid-cols-[1fr_180px_180px_auto]">
        <label className="field-label">
          Search
          <div className="relative">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            />
            <input
              className="field-control py-2 pl-9 pr-3"
              name="q"
              defaultValue={params.q}
              placeholder="Name, service, summary"
            />
          </div>
        </label>
        <label className="field-label">
          Temperature
          <select
            className="field-control"
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
        <label className="field-label">
          Status
          <select
            className="field-control"
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
          className="button-accent mt-auto min-h-11 px-4"
          type="submit"
        >
          Filter
        </button>
      </form>

      <section className="mt-6 grid gap-3 lg:hidden">
        {result.items.map((lead) => (
          <Link
            className="focus-ring neo-panel p-4"
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

      <section className="neo-panel-strong mt-6 hidden overflow-x-auto lg:block">
        <table className="min-w-full divide-y divide-line text-left">
          <thead className="bg-paper/75">
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
                className={
                  lead.temperature === "hot"
                    ? "bg-red-50/70 hover:bg-red-50"
                    : "bg-surface-strong/80 hover:bg-white/85"
                }
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
        <div className="neo-panel mt-6 border-dashed p-8 text-center">
          <h2 className="text-lg font-semibold text-ink">No leads match these filters</h2>
          <p className="mt-2 text-sm text-slate-600">
            Adjust the filters or open the public form to create a fresh demo lead.
          </p>
          <Link className="button-secondary mt-5" href="/contact">
            Open public form
            <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </Link>
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
