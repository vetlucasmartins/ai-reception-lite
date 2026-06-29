import { describe, expect, it } from "vitest";
import { DEMO_BUSINESS_ID } from "@/lib/config";
import { publicLeadSchema } from "@/lib/leads/validation";

describe("publicLeadSchema", () => {
  it("accepts a valid website lead", () => {
    const result = publicLeadSchema.safeParse({
      businessId: DEMO_BUSINESS_ID,
      name: "Maria Silva",
      email: "maria@example.com",
      requestedService: "Dental implants",
      message: "I need an appointment this week and want to understand pricing.",
      source: "website"
    });

    expect(result.success).toBe(true);
  });

  it("requires email or phone", () => {
    const result = publicLeadSchema.safeParse({
      businessId: DEMO_BUSINESS_ID,
      name: "Maria Silva",
      message: "I need an appointment this week.",
      source: "website"
    });

    expect(result.success).toBe(false);
  });

  it("rejects non-website sources on the public endpoint", () => {
    const result = publicLeadSchema.safeParse({
      businessId: DEMO_BUSINESS_ID,
      name: "Maria Silva",
      email: "maria@example.com",
      message: "Please call me about an appointment.",
      source: "manual"
    });

    expect(result.success).toBe(false);
  });
});
