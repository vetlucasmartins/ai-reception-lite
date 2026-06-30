import { Flame, Snowflake, ThermometerSun } from "lucide-react";
import { cn, titleize } from "@/lib/utils";
import type { LeadTemperature, TaskStatus } from "@/lib/domain/types";

type BadgeTone = "hot" | "warm" | "cold" | "neutral" | "success" | "danger";

const toneClasses: Record<BadgeTone, string> = {
  hot: "border-red-300 bg-red-100 text-red-950",
  warm: "border-amber-300 bg-amber-100 text-amber-950",
  cold: "border-blue-300 bg-blue-100 text-blue-950",
  neutral: "border-slate-300 bg-slate-100 text-slate-800",
  success: "border-teal-300 bg-teal-100 text-teal-950",
  danger: "border-red-300 bg-red-50 text-red-900"
};

export function TemperatureBadge({ value }: { value: LeadTemperature }) {
  const tone: BadgeTone = value === "hot" || value === "warm" || value === "cold" ? value : "neutral";
  const Icon = value === "hot" ? Flame : value === "cold" ? Snowflake : ThermometerSun;

  return (
    <span
      className={cn(
        "inline-flex min-h-7 items-center gap-1 rounded-md border px-2 text-xs font-semibold",
        toneClasses[tone]
      )}
    >
      <Icon aria-hidden="true" className="h-3.5 w-3.5" />
      {titleize(value)}
    </span>
  );
}

export function StatusBadge({ value }: { value: string }) {
  const tone = resolveStatusTone(value);

  return (
    <span
      className={cn(
        "inline-flex min-h-7 items-center rounded-md border px-2 text-xs font-semibold",
        toneClasses[tone]
      )}
    >
      {titleize(value)}
    </span>
  );
}

export function TaskStatusBadge({ value }: { value: TaskStatus }) {
  return <StatusBadge value={value} />;
}

function resolveStatusTone(value: string): BadgeTone {
  if (value === "completed" || value === "won") {
    return "success";
  }

  if (value === "high" || value === "lost" || value === "cancelled") {
    return "danger";
  }

  if (value === "medium" || value === "send_pricing" || value === "send_proposal") {
    return "warm";
  }

  if (value === "low" || value === "nurture" || value === "archived") {
    return "cold";
  }

  return "neutral";
}
