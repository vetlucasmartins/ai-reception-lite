import { describe, expect, it } from "vitest";
import { createFollowUpTaskDraft } from "@/lib/tasks/service";

describe("createFollowUpTaskDraft", () => {
  it("creates an urgent follow-up for hot call actions", () => {
    const now = new Date("2026-06-29T12:00:00.000Z");
    const task = createFollowUpTaskDraft("call", "hot", now);

    expect(task).toEqual({
      action: "call",
      status: "open",
      dueAt: "2026-06-29T12:15:00.000Z"
    });
  });

  it("gives cold nurture tasks a longer deadline", () => {
    const now = new Date("2026-06-29T12:00:00.000Z");
    const task = createFollowUpTaskDraft("nurture", "cold", now);

    expect(task.dueAt).toBe("2026-07-06T12:00:00.000Z");
  });
});
