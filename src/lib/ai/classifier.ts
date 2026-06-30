import "server-only";

import {
  createFallbackClassification,
  createSafeFailureClassification
} from "@/lib/ai/fallback-classifier";
import {
  parseLeadClassification,
  type LeadClassifier,
  type LeadClassifierInput,
  type LeadClassifierResult
} from "@/lib/ai/schema";

const fallbackClassifier: LeadClassifier = {
  async classify(input) {
    return {
      provider: "fallback",
      model: "heuristic-v1",
      classification: createFallbackClassification(input)
    };
  }
};

export async function classifyLeadWithFallback(
  input: LeadClassifierInput,
  classifier: LeadClassifier = fallbackClassifier
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
