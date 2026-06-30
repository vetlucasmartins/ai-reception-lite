import "server-only";

import type { Business, Lead, NextAction } from "@/lib/domain/types";

type HotLeadPayload = {
  lead: Lead;
  business: Business;
  suggestedNextAction: NextAction;
};

export async function notifyHotLead(payload: HotLeadPayload) {
  void payload;
  return { sent: false, mocked: true };
}
