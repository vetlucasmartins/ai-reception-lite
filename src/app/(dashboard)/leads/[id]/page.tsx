import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, MessageSquareText, Phone } from "lucide-react";
import { updateTaskStatusAction } from "@/lib/auth/actions";
import { requireUser } from "@/lib/auth/session";
import { getRepository } from "@/lib/data";
import { TemperatureBadge, StatusBadge, TaskStatusBadge } from "@/components/status-badge";
import { formatDateTime, titleize } from "@/lib/utils";

type LeadDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function LeadDetailPage({ params }: LeadDetailPageProps) {
  const user = await requireUser();
  const { id } = await params;
  const detail = await getRepository().getLeadDetailForUser(user.id, id);

  if (!detail) {
    notFound();
  }

  const latestClassification = detail.classifications[0];

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        className="button-secondary w-fit"
        href="/dashboard"
      >
        <ArrowLeft aria-hidden="true" className="h-4 w-4" />
        Back to leads
      </Link>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        <section className="grid gap-6">
          <div className="neo-panel-strong p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="eyebrow">Lead</p>
                <h1 className="mt-2 text-3xl font-semibold text-ink">{detail.lead.name}</h1>
                <p className="mt-2 text-base text-slate-600">
                  {detail.lead.email ?? "No email"} / {detail.lead.phone ?? "No phone"}
                </p>
              </div>
              <TemperatureBadge value={detail.lead.temperature} />
            </div>

            <dl className="mt-6 grid gap-4 sm:grid-cols-2">
              <InfoTerm label="Requested service" value={detail.lead.requestedService} />
              <InfoTerm label="Status" value={titleize(detail.lead.status)} />
              <InfoTerm label="Funnel stage" value={titleize(detail.lead.funnelStage)} />
              <InfoTerm label="Created" value={formatDateTime(detail.lead.createdAt)} />
            </dl>

            {detail.lead.summary ? (
              <div className="neo-inset mt-6 p-4">
                <p className="text-sm font-semibold uppercase text-slate-500">Summary</p>
                <p className="mt-2 text-base leading-7 text-slate-700">{detail.lead.summary}</p>
              </div>
            ) : null}
          </div>

          <section className="neo-panel-strong p-5 sm:p-6">
            <div className="flex items-center gap-2">
              <MessageSquareText aria-hidden="true" className="h-5 w-5 text-teal-700" />
              <h2 className="text-xl font-semibold text-ink">Conversation</h2>
            </div>
            <div className="mt-5 grid gap-3">
              {detail.conversations.map((conversation) => (
                <article
                  className="neo-inset p-4"
                  key={conversation.id}
                >
                  <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase text-slate-500">
                    <span>{conversation.direction}</span>
                    <span>{conversation.channel}</span>
                    <span>{formatDateTime(conversation.createdAt)}</span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{conversation.body}</p>
                </article>
              ))}
            </div>
          </section>
        </section>

        <aside className="grid h-fit gap-6">
          <section className="neo-panel-strong p-5">
            <h2 className="text-xl font-semibold text-ink">AI classification</h2>
            {latestClassification ? (
              <div className="mt-4 grid gap-4">
                <div className="flex flex-wrap gap-2">
                  <TemperatureBadge value={latestClassification.temperature} />
                  <StatusBadge value={latestClassification.urgency} />
                  <StatusBadge value={`${Math.round(latestClassification.confidence * 100)}%`} />
                </div>
                <InfoTerm label="Intent" value={latestClassification.intent} />
                <InfoTerm
                  label="Suggested next action"
                  value={titleize(latestClassification.suggestedNextAction)}
                />
                <div className="status-callout-success">
                  <p className="text-sm font-semibold uppercase text-teal-800">
                    Simulated response
                  </p>
                  <p className="mt-2 text-sm leading-6 text-teal-900">
                    {latestClassification.responseDraft}
                  </p>
                </div>
              </div>
            ) : (
              <p className="mt-3 text-sm text-slate-600">Classification pending.</p>
            )}
          </section>

          <section className="neo-panel-strong p-5">
            <div className="flex items-center gap-2">
              <Phone aria-hidden="true" className="h-5 w-5 text-teal-700" />
              <h2 className="text-xl font-semibold text-ink">Follow-up tasks</h2>
            </div>
            <div className="mt-4 grid gap-3">
              {detail.tasks.map((task) => (
                <article className="neo-inset p-4" key={task.id}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-ink">{titleize(task.action)}</p>
                      <p className="mt-1 text-sm text-slate-600">
                        Due {task.dueAt ? formatDateTime(task.dueAt) : "not scheduled"}
                      </p>
                    </div>
                    <TaskStatusBadge value={task.status} />
                  </div>
                  {task.status !== "completed" ? (
                    <form action={updateTaskStatusAction} className="mt-4">
                      <input name="taskId" type="hidden" value={task.id} />
                      <input name="leadId" type="hidden" value={detail.lead.id} />
                      <input name="status" type="hidden" value="completed" />
                      <button
                        className="button-secondary min-h-10 px-3"
                        type="submit"
                      >
                        <CheckCircle2 aria-hidden="true" className="h-4 w-4" />
                        Mark complete
                      </button>
                    </form>
                  ) : null}
                </article>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </main>
  );
}

function InfoTerm({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
      <p className="mt-1 text-sm leading-6 text-slate-700">{value || "Unknown"}</p>
    </div>
  );
}
