// @vitest-environment node

import { beforeEach, describe, expect, it } from "vitest";
import { DEMO_BUSINESS_ID, DEMO_USER_ID } from "@/lib/config";
import type { LeadClassifier } from "@/lib/ai/schema";
import { createSqliteRepository } from "@/lib/data/sqlite-repository";
import type { DataRepository } from "@/lib/data/repository";
import { createLeadFromPublicInput } from "@/lib/leads/service";

const throwingClassifier: LeadClassifier = {
  async classify() {
    throw new Error("provider unavailable");
  }
};

const invalidClassifier: LeadClassifier = {
  async classify() {
    return {
      provider: "custom",
      model: "invalid",
      classification: {
        temperature: "lava"
      }
    } as unknown as Awaited<ReturnType<LeadClassifier["classify"]>>;
  }
};

describe("createLeadFromPublicInput", () => {
  let repository: DataRepository;

  beforeEach(() => {
    repository = createSqliteRepository({ databasePath: ":memory:" });
  });

  it("saves the lead, conversation, safe classification, and task when AI fails", async () => {
    const result = await createLeadFromPublicInput(
      {
        businessId: DEMO_BUSINESS_ID,
        name: "Alex Morgan",
        email: "alex@example.com",
        requestedService: "Emergency dental care",
        message: "Can someone contact me today about emergency dental care?",
        source: "website"
      },
      {
        repository,
        classifier: throwingClassifier
      }
    );

    expect(result.status).toBe("received");
    expect(result.simulatedResponse).toContain("Thanks, Alex Morgan");

    const leads = await repository.listLeadsForUser(DEMO_USER_ID, {});
    const createdLead = leads.items.find((lead) => lead.id === result.leadId);
    expect(createdLead?.temperature).toBe("warm");

    const detail = await repository.getLeadDetailForUser(DEMO_USER_ID, result.leadId);
    expect(detail?.conversations).toHaveLength(1);
    expect(detail?.classifications[0]?.model).toBe("safe-failure-v1");
    expect(detail?.tasks[0]?.action).toBe("ask_more_information");
  });

  it("falls back safely when a classifier resolves invalid output", async () => {
    const result = await createLeadFromPublicInput(
      {
        businessId: DEMO_BUSINESS_ID,
        name: "Jamie Lee",
        phone: "+447700900123",
        requestedService: "Whitening",
        message: "Please send information about whitening.",
        source: "website"
      },
      {
        repository,
        classifier: invalidClassifier
      }
    );

    const detail = await repository.getLeadDetailForUser(DEMO_USER_ID, result.leadId);

    expect(detail?.classifications[0]?.provider).toBe("fallback");
    expect(detail?.classifications[0]?.model).toBe("safe-failure-v1");
    expect(detail?.lead.temperature).toBe("warm");
  });
});
