import "server-only";

import { classifyLeadWithFallback } from "@/lib/ai/classifier";
import {
  toPersistedClassification,
  type LeadClassifier,
  type LeadClassifierInput
} from "@/lib/ai/schema";
import { getRepository } from "@/lib/data";
import type { DataRepository } from "@/lib/data/repository";
import type { Conversation } from "@/lib/domain/types";
import { publicLeadSchema, type PublicLeadInput } from "@/lib/leads/validation";
import { createFollowUpTaskDraft } from "@/lib/tasks/service";
import { notifyHotLead } from "@/lib/webhooks/hot-lead";

export class LeadWorkflowError extends Error {
  constructor(
    public readonly code: string,
    message: string
  ) {
    super(message);
    this.name = "LeadWorkflowError";
  }
}

type CreateLeadWorkflowDeps = {
  repository?: DataRepository;
  classifier?: LeadClassifier;
};

export async function createLeadFromPublicInput(
  rawInput: unknown,
  deps: CreateLeadWorkflowDeps = {}
): Promise<{
  leadId: string;
  status: "received";
  simulatedResponse: string;
}> {
  const input = publicLeadSchema.parse(rawInput);
  const repository = deps.repository ?? getRepository();
  const business = await repository.getPublicBusiness(input.businessId);

  if (!business) {
    throw new LeadWorkflowError("BUSINESS_NOT_FOUND", "Business not found");
  }

  const lead = await repository.createLead({
    businessId: business.id,
    name: input.name,
    email: input.email,
    phone: input.phone,
    source: input.source,
    requestedService: input.requestedService
  });

  await repository.createConversation({
    leadId: lead.id,
    direction: "inbound",
    channel: toConversationChannel(input.source),
    body: input.message
  });

  const classifierInput = toClassifierInput(input, business);
  const result = await classifyLeadWithFallback(classifierInput, deps.classifier);
  const classification = await repository.saveClassification(
    toPersistedClassification(lead.id, result)
  );
  const updatedLead = await repository.updateLeadFromClassification(lead.id, {
    temperature: result.classification.temperature,
    funnelStage: result.classification.funnelStage,
    summary: result.classification.summary,
    requestedService: result.classification.requestedService
  });
  const taskDraft = createFollowUpTaskDraft(
    result.classification.suggestedNextAction,
    result.classification.temperature
  );

  await repository.createFollowUpTask({
    leadId: lead.id,
    action: taskDraft.action,
    status: taskDraft.status,
    dueAt: taskDraft.dueAt
  });

  if (updatedLead.temperature === "hot") {
    await notifyHotLead({
      lead: updatedLead,
      business,
      suggestedNextAction: classification.suggestedNextAction
    }).catch(() => ({ sent: false }));
  }

  return {
    leadId: lead.id,
    status: "received",
    simulatedResponse: classification.responseDraft
  };
}

function toClassifierInput(
  input: PublicLeadInput,
  business: Awaited<ReturnType<DataRepository["getPublicBusiness"]>>
): LeadClassifierInput {
  if (!business) {
    throw new LeadWorkflowError("BUSINESS_NOT_FOUND", "Business not found");
  }

  return {
    business: {
      name: business.name,
      services: business.services,
      toneOfVoice: business.toneOfVoice,
      openingHours: business.openingHours
    },
    lead: {
      name: input.name,
      email: input.email,
      phone: input.phone,
      source: input.source,
      requestedService: input.requestedService,
      message: input.message
    }
  };
}

function toConversationChannel(source: PublicLeadInput["source"]): Conversation["channel"] {
  return source;
}
