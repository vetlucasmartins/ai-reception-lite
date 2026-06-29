import { z } from "zod";
import { failure, success } from "@/lib/api/responses";
import { createLeadFromPublicInput, LeadWorkflowError } from "@/lib/leads/service";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const clientIp =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "local";
  const rateLimit = checkRateLimit(`public-leads:${clientIp}`, 20, 60_000);

  if (!rateLimit.allowed) {
    return failure("RATE_LIMITED", "Too many submissions. Please try again shortly.", 429);
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return failure("VALIDATION_ERROR", "Request body must be valid JSON.", 400);
  }

  try {
    const data = await createLeadFromPublicInput(body);
    return success(data, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return failure("VALIDATION_ERROR", "Check the contact form fields.", 400);
    }

    if (error instanceof LeadWorkflowError) {
      return failure(error.code, error.message, error.code === "BUSINESS_NOT_FOUND" ? 404 : 400);
    }

    return failure("INTERNAL_ERROR", "The lead could not be created.", 500);
  }
}
