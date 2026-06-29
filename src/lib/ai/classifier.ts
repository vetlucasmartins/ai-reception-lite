import "server-only";

import {
  createSafeFailureClassification,
  FallbackLeadClassifier
} from "@/lib/ai/fallback-classifier";
import { OpenAILeadClassifier } from "@/lib/ai/openai-classifier";
import {
  parseLeadClassification,
  type LeadClassifier,
  type LeadClassifierInput,
  type LeadClassifierResult
} from "@/lib/ai/schema";
import { getAiProvider } from "@/lib/config";

export function getLeadClassifier(): LeadClassifier {
  const provider = getAiProvider();

  if (provider === "openai" && process.env.OPENAI_API_KEY) {
    return new OpenAILeadClassifier(process.env.OPENAI_API_KEY);
  }

  return new FallbackLeadClassifier();
}

export async function classifyLeadWithFallback(
  input: LeadClassifierInput,
  classifier: LeadClassifier = getLeadClassifier()
): Promise<LeadClassifierResult> {
  try {
    const result = await classifier.classify(input);

    return {
      provider: result.provider,
      model: result.model,
      classification: parseLeadClassification(result.classification)
    };
  } catch {
    return {
      provider: "fallback",
      model: "safe-failure-v1",
      classification: createSafeFailureClassification(input)
    };
  }
}
