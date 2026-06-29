import "server-only";

import { getAiModel } from "@/lib/config";
import {
  parseLeadClassification,
  type LeadClassifier,
  type LeadClassifierInput,
  type LeadClassifierResult
} from "@/lib/ai/schema";

const OPENAI_CHAT_COMPLETIONS_URL = "https://api.openai.com/v1/chat/completions";
const OPENAI_REQUEST_TIMEOUT_MS = 8_000;

export class OpenAILeadClassifier implements LeadClassifier {
  constructor(
    private readonly apiKey: string,
    private readonly model = getAiModel()
  ) {}

  async classify(input: LeadClassifierInput): Promise<LeadClassifierResult> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), OPENAI_REQUEST_TIMEOUT_MS);

    const response = await fetch(OPENAI_CHAT_COMPLETIONS_URL, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: this.model,
        response_format: { type: "json_object" },
        temperature: 0.2,
        messages: [
          {
            role: "system",
            content:
              "You are an AI front-desk assistant for a small service business. Classify the lead for commercial follow-up. Return only valid JSON matching the provided schema. Do not invent details. If a field is unknown, use \"unknown\"."
          },
          {
            role: "user",
            content: buildPrompt(input)
          }
        ]
      })
    }).finally(() => clearTimeout(timeout));

    if (!response.ok) {
      throw new Error("OpenAI classification request failed");
    }

    const payload = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = payload.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("OpenAI classification response was empty");
    }

    return {
      provider: "openai",
      model: this.model,
      classification: parseLeadClassification(JSON.parse(content))
    };
  }
}

function buildPrompt(input: LeadClassifierInput) {
  return JSON.stringify(
    {
      schema: {
        temperature: "hot | warm | cold",
        confidence: "number between 0 and 1",
        intent: "short commercial intent",
        urgency: "high | medium | low | unknown",
        budgetSignal: "known budget signal or unknown",
        requestedService: "service name or unknown",
        funnelStage: "new | qualified | proposal | negotiation | won | lost",
        summary: "one concise sentence",
        suggestedNextAction:
          "call | send_proposal | ask_more_information | schedule_meeting | send_pricing | nurture",
        responseDraft: "safe simulated response for the lead"
      },
      business: input.business,
      lead: input.lead
    },
    null,
    2
  );
}
