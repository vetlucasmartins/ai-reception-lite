import {
  type ClassifiedTemperature,
  type FollowUpTask,
  type NextAction
} from "@/lib/domain/types";

const dueMinutesByTemperature: Record<ClassifiedTemperature, number> = {
  hot: 15,
  warm: 24 * 60,
  cold: 7 * 24 * 60
};

export type FollowUpTaskDraft = Pick<FollowUpTask, "action" | "status" | "dueAt">;

export function createFollowUpTaskDraft(
  action: NextAction,
  temperature: ClassifiedTemperature,
  now = new Date()
): FollowUpTaskDraft {
  const dueAt = new Date(now.getTime() + dueMinutesByTemperature[temperature] * 60_000);

  return {
    action,
    status: "open",
    dueAt: dueAt.toISOString()
  };
}
