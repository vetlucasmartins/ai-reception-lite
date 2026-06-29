import "server-only";

import type { Business, Lead, NextAction } from "@/lib/domain/types";

type HotLeadPayload = {
  lead: Lead;
  business: Business;
  suggestedNextAction: NextAction;
};

export async function notifyHotLead({
  lead,
  business,
  suggestedNextAction
}: HotLeadPayload) {
  const webhookUrl = process.env.N8N_HOT_LEAD_WEBHOOK_URL;

  if (!webhookUrl) {
    return { sent: false };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3500);

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "content-type": "application/json",
        ...(process.env.N8N_WEBHOOK_SECRET
          ? { "x-ai-reception-secret": process.env.N8N_WEBHOOK_SECRET }
          : {})
      },
      body: JSON.stringify({
        event: "lead.hot",
        lead: {
          id: lead.id,
          name: lead.name,
          email: lead.email,
          phone: lead.phone,
          requestedService: lead.requestedService,
          summary: lead.summary,
          suggestedNextAction
        },
        business: {
          id: business.id,
          name: business.name
        },
        createdAt: new Date().toISOString()
      })
    });

    return { sent: response.ok };
  } finally {
    clearTimeout(timeout);
  }
}
