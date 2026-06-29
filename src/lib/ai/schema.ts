import { z } from "zod";
import {
  classifiedTemperatures,
  funnelStages,
  nextActions,
  urgencyLevels,
  type ClassifiedTemperature,
  type FunnelStage,
  type NextAction,
  type UrgencyLevel
} from "@/lib/domain/types";

export const leadClassificationSchema = z.object({
  temperature: z.enum(classifiedTemperatures),
  confidence: z.coerce.number().min(0).max(1).default(0),
  intent: z.string().trim().min(1).max(300).default("unknown"),
  urgency: z.enum(urgencyLevels).default("unknown"),
  budgetSignal: z.string().trim().max(160).default("unknown"),
  requestedService: z.string().trim().max(160).default("unknown"),
  funnelStage: z.enum(funnelStages).default("new"),
  summary: z.string().trim().min(1).max(500),
  suggestedNextAction: z.enum(nextActions).default("ask_more_information"),
  responseDraft: z.string().trim().min(1).max(800)
});

export type LeadClassification = z.infer<typeof leadClassificationSchema>;

export type LeadClassifierInput = {
  business: {
    name: string;
    services: string[];
    toneOfVoice: string;
    openingHours: Record<string, string>;
  };
  lead: {
    name: string;
    email?: string;
    phone?: string;
    source: string;
    requestedService?: string;
    message: string;
  };
};

export type LeadClassifierResult = {
  provider: string;
  model: string;
  classification: LeadClassification;
};

export type LeadClassifier = {
  classify(input: LeadClassifierInput): Promise<LeadClassifierResult>;
};

export type PersistedClassificationInput = {
  leadId: string;
  provider: string;
  model: string;
  temperature: ClassifiedTemperature;
  urgency: UrgencyLevel;
  intent: string;
  confidence: number;
  extractedFields: {
    budgetSignal: string;
    requestedService: string;
    funnelStage: FunnelStage;
    summary: string;
  };
  suggestedNextAction: NextAction;
  responseDraft: string;
};

export function parseLeadClassification(value: unknown) {
  return leadClassificationSchema.parse(value);
}

export function toPersistedClassification(
  leadId: string,
  result: LeadClassifierResult
): PersistedClassificationInput {
  const { classification } = result;

  return {
    leadId,
    provider: result.provider,
    model: result.model,
    temperature: classification.temperature,
    urgency: classification.urgency,
    intent: classification.intent,
    confidence: classification.confidence,
    extractedFields: {
      budgetSignal: classification.budgetSignal,
      requestedService: classification.requestedService,
      funnelStage: classification.funnelStage,
      summary: classification.summary
    },
    suggestedNextAction: classification.suggestedNextAction,
    responseDraft: classification.responseDraft
  };
}
