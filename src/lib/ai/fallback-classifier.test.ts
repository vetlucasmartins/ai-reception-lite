import { describe, expect, it } from "vitest";
import {
  createFallbackClassification,
  createSafeFailureClassification
} from "@/lib/ai/fallback-classifier";
import type { LeadClassifierInput } from "@/lib/ai/schema";

const input: LeadClassifierInput = {
  business: {
    name: "Demo Clinic",
    services: ["Dental implants", "Whitening"],
    toneOfVoice: "friendly and professional",
    openingHours: { Mon: "09:00-18:00" }
  },
  lead: {
    name: "Maria",
    email: "maria@example.com",
    source: "website",
    requestedService: "Dental implants",
    message: "I need an appointment this week and want to understand the price range."
  }
};

describe("fallback classifier", () => {
  it("classifies urgent commercial messages as hot in dev fallback mode", () => {
    const classification = createFallbackClassification(input);

    expect(classification.temperature).toBe("hot");
    expect(classification.suggestedNextAction).toBe("call");
  });

  it("uses safe warm fallback when a provider fails", () => {
    const classification = createSafeFailureClassification(input);

    expect(classification.temperature).toBe("warm");
    expect(classification.suggestedNextAction).toBe("ask_more_information");
    expect(classification.confidence).toBe(0);
  });
});
