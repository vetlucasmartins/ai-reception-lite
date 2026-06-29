import {
  type LeadClassification,
  type LeadClassifier,
  type LeadClassifierInput,
  type LeadClassifierResult
} from "@/lib/ai/schema";

const urgentPattern = /\b(today|tomorrow|this week|urgent|asap|immediately|now|emergency|soon)\b/i;
const buyingPattern = /\b(book|appointment|quote|price|pricing|cost|proposal|start|available|availability|call|consultation)\b/i;
const budgetPattern = /\b(budget|£|\$|eur|price|cost|range|afford|deposit|payment)\b/i;
const vaguePattern = /\b(info|information|learn|curious|maybe|just checking)\b/i;

export function createFallbackClassification(input: LeadClassifierInput): LeadClassification {
  const message = input.lead.message;
  const requestedService = input.lead.requestedService || inferRequestedService(input);
  const hasUrgency = urgentPattern.test(message);
  const hasBuyingIntent = buyingPattern.test(message);
  const hasBudgetSignal = budgetPattern.test(message);
  const isVague = vaguePattern.test(message) && !hasUrgency && !hasBudgetSignal;

  const temperature = hasUrgency && hasBuyingIntent ? "hot" : isVague ? "cold" : "warm";
  const urgency = hasUrgency ? "high" : isVague ? "low" : "medium";
  const suggestedNextAction =
    temperature === "hot"
      ? "call"
      : hasBudgetSignal
        ? "send_pricing"
        : isVague
          ? "nurture"
          : "ask_more_information";
  const funnelStage = temperature === "hot" ? "qualified" : "new";
  const intent = hasBuyingIntent
    ? "Discuss a service request and next step"
    : "Request general information";

  return {
    temperature,
    confidence: temperature === "hot" ? 0.66 : 0.48,
    intent,
    urgency,
    budgetSignal: hasBudgetSignal ? "mentioned" : "unknown",
    requestedService,
    funnelStage,
    summary: `${input.lead.name} asked about ${requestedService}. ${summarizeMessage(message)}`,
    suggestedNextAction,
    responseDraft: buildResponseDraft(input.lead.name, requestedService, suggestedNextAction)
  };
}

export function createSafeFailureClassification(input: LeadClassifierInput): LeadClassification {
  const requestedService = input.lead.requestedService || inferRequestedService(input);

  return {
    temperature: "warm",
    confidence: 0,
    intent: "unknown",
    urgency: "unknown",
    budgetSignal: "unknown",
    requestedService,
    funnelStage: "new",
    summary: `${input.lead.name} submitted a new request about ${requestedService}.`,
    suggestedNextAction: "ask_more_information",
    responseDraft: `Thanks, ${input.lead.name}. We received your request about ${requestedService}. Our team will review it and follow up shortly.`
  };
}

function inferRequestedService(input: LeadClassifierInput) {
  const normalizedMessage = input.lead.message.toLowerCase();
  const matchedService = input.business.services.find((service) =>
    normalizedMessage.includes(service.toLowerCase())
  );

  return matchedService || "requested service";
}

function summarizeMessage(message: string) {
  const compact = message.replace(/\s+/g, " ").trim();
  return compact.length > 180 ? `${compact.slice(0, 177)}...` : compact;
}

function buildResponseDraft(name: string, requestedService: string, action: string) {
  if (action === "call") {
    return `Thanks, ${name}. We received your request about ${requestedService}. Our team will review the details and follow up shortly to confirm the best next step.`;
  }

  if (action === "send_pricing") {
    return `Thanks, ${name}. We received your pricing question about ${requestedService}. Our team will follow up with guidance and any details needed for an accurate estimate.`;
  }

  return `Thanks, ${name}. We received your message about ${requestedService}. Our team will follow up shortly with the next useful information.`;
}

export class FallbackLeadClassifier implements LeadClassifier {
  async classify(input: LeadClassifierInput): Promise<LeadClassifierResult> {
    return {
      provider: "fallback",
      model: "heuristic-v1",
      classification: createFallbackClassification(input)
    };
  }
}
