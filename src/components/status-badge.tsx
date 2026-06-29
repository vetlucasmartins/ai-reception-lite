import { Flame, Snowflake, ThermometerSun } from "lucide-react";
import { cn, titleize } from "@/lib/utils";
import type { LeadTemperature, TaskStatus } from "@/lib/domain/types";

type BadgeTone = "hot" | "warm" | "cold" | "neutral" | "success";

const toneClasses: Record<BadgeTone, string> = {
  hot: "border-red-200 bg-red-50 text-red-800",
  warm: "border-amber-200 bg-amber-50 text-amber-800",
  cold: "border-blue-200 bg-blue-50 text-blue-800",
  neutral: "border-slate-200 bg-white text-slate-700",
  success: "border-teal-200 bg-teal-50 text-teal-800"
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
  const tone: BadgeTone = value === "completed" || value === "won" ? "success" : "neutral";

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
