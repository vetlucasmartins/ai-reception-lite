import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/service-role";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  type AiClassification,
  type Business,
  type Conversation,
  type FollowUpTask,
  type Lead,
  type LeadDetail,
  type LeadListItem
} from "@/lib/domain/types";
import {
  type DataRepository
} from "@/lib/data/repository";

type BusinessRow = {
  id: string;
  name: string;
  tone_of_voice: string;
  timezone: string;
  services: unknown;
  opening_hours: unknown;
  created_at: string;
  updated_at?: string | null;
};

type LeadRow = {
  id: string;
  business_id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  source: Lead["source"];
  requested_service?: string | null;
  temperature: Lead["temperature"];
  funnel_stage: Lead["funnelStage"];
  summary?: string | null;
  status: Lead["status"];
  created_at: string;
  updated_at?: string | null;
};

type ConversationRow = {
  id: string;
  lead_id: string;
  direction: Conversation["direction"];
  channel: Conversation["channel"];
  body: string;
  created_at: string;
};

type ClassificationRow = {
  id: string;
  lead_id: string;
  provider: string;
  model: string;
  temperature: AiClassification["temperature"];
  urgency: AiClassification["urgency"];
  intent?: string | null;
  confidence: number | string;
  extracted_fields: Record<string, unknown>;
  suggested_next_action: AiClassification["suggestedNextAction"];
  response_draft?: string | null;
  created_at: string;
};

type TaskRow = {
  id: string;
  lead_id: string;
  action: FollowUpTask["action"];
  status: FollowUpTask["status"];
  due_at?: string | null;
  completed_at?: string | null;
  created_at: string;
  updated_at?: string | null;
};

export const supabaseRepository: DataRepository = {
  async getPublicBusiness(businessId) {
    const client = createServiceRoleSupabaseClient();
    const { data, error } = await client
      .from("businesses")
      .select("*")
      .eq("id", businessId)
      .maybeSingle();

    if (error) {
      throw new Error("Could not load business");
    }

    return data ? mapBusiness(data as BusinessRow) : null;
  },

  async ensureBusinessForUser(user) {
    const client = createServiceRoleSupabaseClient();

    await client.from("profiles").upsert({
      id: user.id,
      full_name: user.fullName ?? user.email ?? null
    });

    const { data: membership, error: membershipError } = await client
      .from("business_members")
      .select("business_id")
      .eq("profile_id", user.id)
      .limit(1)
      .maybeSingle();

    if (membershipError) {
      throw new Error("Could not load business membership");
    }

    if (membership?.business_id) {
      const business = await getBusinessById(membership.business_id);

      if (business) {
        return business;
      }
    }

    const { data: business, error: businessError } = await client
      .from("businesses")
      .insert({
        name: "My Business",
        tone_of_voice: "friendly and professional",
        timezone: "Europe/London",
        services: ["Consultation", "Quote request", "Follow-up call"],
        opening_hours: {
          Mon: "09:00-17:00",
          Tue: "09:00-17:00",
          Wed: "09:00-17:00",
          Thu: "09:00-17:00",
          Fri: "09:00-17:00"
        }
      })
      .select("*")
      .single();

    if (businessError || !business) {
      throw new Error("Could not create business");
    }

    const mappedBusiness = mapBusiness(business as BusinessRow);
    const { error: memberError } = await client.from("business_members").insert({
      business_id: mappedBusiness.id,
      profile_id: user.id,
      role: "owner"
    });

    if (memberError) {
      throw new Error("Could not create business membership");
    }

    return mappedBusiness;
  },

  async updateBusinessForUser(userId, input) {
    const business = await this.ensureBusinessForUser({ id: userId });
    const client = await createServerSupabaseClient();
    const { data, error } = await client
      .from("businesses")
      .update({
        name: input.name,
        tone_of_voice: input.toneOfVoice,
        timezone: input.timezone,
        services: input.services,
        opening_hours: input.openingHours
      })
      .eq("id", business.id)
      .select("*")
      .single();

    if (error || !data) {
      throw new Error("Could not update business");
    }

    return mapBusiness(data as BusinessRow);
  },

  async listLeadsForUser(userId, filters) {
    const business = await this.ensureBusinessForUser({ id: userId });
    const client = await createServerSupabaseClient();
    const searchPattern = toLeadSearchPattern(filters.q);
    let query = client
      .from("leads")
      .select("*", { count: "exact" })
      .eq("business_id", business.id)
      .order("created_at", { ascending: false });

    if (filters.temperature) {
      query = query.eq("temperature", filters.temperature);
    }

    if (filters.status) {
      query = query.eq("status", filters.status);
    }

    if (searchPattern) {
      query = query.or(
        [
          `name.ilike.${searchPattern}`,
          `email.ilike.${searchPattern}`,
          `phone.ilike.${searchPattern}`,
          `summary.ilike.${searchPattern}`,
          `requested_service.ilike.${searchPattern}`
        ].join(",")
      );
    }

    const { data, error, count } = await query.limit(500);

    if (error) {
      throw new Error("Could not load leads");
    }

    const leads = ((data ?? []) as LeadRow[]).map(mapLead);
    const latestByLead = await getLatestClassificationsForLeads(
      client,
      leads.map((lead) => lead.id)
    );
    const items = leads.map<LeadListItem>((lead) => ({
      ...lead,
      suggestedNextAction: latestByLead.get(lead.id)?.suggestedNextAction
    }));

    return {
      items,
      total: count ?? items.length
    };
  },

  async getLeadDetailForUser(userId, leadId) {
    const business = await this.ensureBusinessForUser({ id: userId });
    const client = await createServerSupabaseClient();
    const { data: leadRow, error: leadError } = await client
      .from("leads")
      .select("*")
      .eq("id", leadId)
      .eq("business_id", business.id)
      .maybeSingle();

    if (leadError) {
      throw new Error("Could not load lead");
    }

    if (!leadRow) {
      return null;
    }

    const [conversations, classifications, tasks] = await Promise.all([
      client
        .from("conversations")
        .select("*")
        .eq("lead_id", leadId)
        .order("created_at", { ascending: true }),
      client
        .from("ai_classifications")
        .select("*")
        .eq("lead_id", leadId)
        .order("created_at", { ascending: false }),
      client
        .from("follow_up_tasks")
        .select("*")
        .eq("lead_id", leadId)
        .order("due_at", { ascending: true })
    ]);

    if (conversations.error || classifications.error || tasks.error) {
      throw new Error("Could not load lead detail");
    }

    return {
      lead: mapLead(leadRow as LeadRow),
      business,
      conversations: ((conversations.data ?? []) as ConversationRow[]).map(
        mapConversation
      ),
      classifications: ((classifications.data ?? []) as ClassificationRow[]).map(
        mapClassification
      ),
      tasks: ((tasks.data ?? []) as TaskRow[]).map(mapTask)
    } satisfies LeadDetail;
  },

  async createLead(input) {
    const client = createServiceRoleSupabaseClient();
    const { data, error } = await client
      .from("leads")
      .insert({
        business_id: input.businessId,
        name: input.name,
        email: input.email ?? null,
        phone: input.phone ?? null,
        source: input.source,
        requested_service: input.requestedService ?? null
      })
      .select("*")
      .single();

    if (error || !data) {
      throw new Error("Could not create lead");
    }

    return mapLead(data as LeadRow);
  },

  async createConversation(input) {
    const client = createServiceRoleSupabaseClient();
    const { data, error } = await client
      .from("conversations")
      .insert({
        lead_id: input.leadId,
        direction: input.direction,
        channel: input.channel,
        body: input.body
      })
      .select("*")
      .single();

    if (error || !data) {
      throw new Error("Could not create conversation");
    }

    return mapConversation(data as ConversationRow);
  },

  async saveClassification(input) {
    const client = createServiceRoleSupabaseClient();
    const { data, error } = await client
      .from("ai_classifications")
      .insert({
        lead_id: input.leadId,
        provider: input.provider,
        model: input.model,
        temperature: input.temperature,
        urgency: input.urgency,
        intent: input.intent,
        confidence: input.confidence,
        extracted_fields: input.extractedFields,
        suggested_next_action: input.suggestedNextAction,
        response_draft: input.responseDraft
      })
      .select("*")
      .single();

    if (error || !data) {
      throw new Error("Could not save classification");
    }

    return mapClassification(data as ClassificationRow);
  },

  async updateLeadFromClassification(leadId, input) {
    const client = createServiceRoleSupabaseClient();
    const { data, error } = await client
      .from("leads")
      .update({
        temperature: input.temperature,
        funnel_stage: input.funnelStage,
        summary: input.summary,
        requested_service:
          input.requestedService && input.requestedService !== "unknown"
            ? input.requestedService
            : undefined,
        status: "open"
      })
      .eq("id", leadId)
      .select("*")
      .single();

    if (error || !data) {
      throw new Error("Could not update lead classification");
    }

    return mapLead(data as LeadRow);
  },

  async createFollowUpTask(input) {
    const client = createServiceRoleSupabaseClient();
    const { data, error } = await client
      .from("follow_up_tasks")
      .insert({
        lead_id: input.leadId,
        action: input.action,
        status: input.status,
        due_at: input.dueAt ?? null
      })
      .select("*")
      .single();

    if (error || !data) {
      throw new Error("Could not create follow-up task");
    }

    return mapTask(data as TaskRow);
  },

  async updateTaskStatusForUser(userId, taskId, status) {
    const business = await this.ensureBusinessForUser({ id: userId });
    const client = await createServerSupabaseClient();
    const { data: taskRow, error: taskError } = await client
      .from("follow_up_tasks")
      .select("*")
      .eq("id", taskId)
      .maybeSingle();

    if (taskError || !taskRow) {
      return null;
    }

    const task = mapTask(taskRow as TaskRow);
    const { data: leadRow, error: leadError } = await client
      .from("leads")
      .select("*")
      .eq("id", task.leadId)
      .eq("business_id", business.id)
      .maybeSingle();

    if (leadError || !leadRow) {
      return null;
    }

    const { data, error } = await client
      .from("follow_up_tasks")
      .update({
        status,
        completed_at: status === "completed" ? new Date().toISOString() : null
      })
      .eq("id", taskId)
      .select("*")
      .single();

    if (error || !data) {
      throw new Error("Could not update task");
    }

    return mapTask(data as TaskRow);
  }
};

async function getBusinessById(id: string) {
  const client = createServiceRoleSupabaseClient();
  const { data, error } = await client
    .from("businesses")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error("Could not load business");
  }

  return data ? mapBusiness(data as BusinessRow) : null;
}

async function getLatestClassificationsForLeads(
  client: SupabaseClient,
  leadIds: string[]
) {
  const latestByLead = new Map<string, AiClassification>();

  if (leadIds.length === 0) {
    return latestByLead;
  }

  const { data, error } = await client
    .from("ai_classifications")
    .select("*")
    .in("lead_id", leadIds)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("Could not load classifications");
  }

  ((data ?? []) as ClassificationRow[]).forEach((row) => {
    if (!latestByLead.has(row.lead_id)) {
      latestByLead.set(row.lead_id, mapClassification(row));
    }
  });

  return latestByLead;
}

function toLeadSearchPattern(value?: string) {
  const normalized = value
    ?.trim()
    .slice(0, 80)
    .replace(/[^\p{L}\p{N}@.+\-\s]/gu, " ")
    .replace(/\s+/g, " ");

  return normalized ? `%${normalized}%` : undefined;
}

function mapBusiness(row: BusinessRow): Business {
  return {
    id: row.id,
    name: row.name,
    toneOfVoice: row.tone_of_voice,
    timezone: row.timezone,
    services: Array.isArray(row.services)
      ? row.services.filter((service): service is string => typeof service === "string")
      : [],
    openingHours: toOpeningHours(row.opening_hours),
    createdAt: row.created_at,
    updatedAt: row.updated_at ?? undefined
  };
}

function mapLead(row: LeadRow): Lead {
  return {
    id: row.id,
    businessId: row.business_id,
    name: row.name,
    email: row.email ?? undefined,
    phone: row.phone ?? undefined,
    source: row.source,
    requestedService: row.requested_service ?? undefined,
    temperature: row.temperature,
    funnelStage: row.funnel_stage,
    summary: row.summary ?? undefined,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at ?? undefined
  };
}

function mapConversation(row: ConversationRow): Conversation {
  return {
    id: row.id,
    leadId: row.lead_id,
    direction: row.direction,
    channel: row.channel,
    body: row.body,
    createdAt: row.created_at
  };
}

function mapClassification(row: ClassificationRow): AiClassification {
  return {
    id: row.id,
    leadId: row.lead_id,
    provider: row.provider,
    model: row.model,
    temperature: row.temperature,
    urgency: row.urgency,
    intent: row.intent ?? "unknown",
    confidence: Number(row.confidence),
    extractedFields: row.extracted_fields ?? {},
    suggestedNextAction: row.suggested_next_action,
    responseDraft: row.response_draft ?? "",
    createdAt: row.created_at
  };
}

function mapTask(row: TaskRow): FollowUpTask {
  return {
    id: row.id,
    leadId: row.lead_id,
    action: row.action,
    status: row.status,
    dueAt: row.due_at ?? undefined,
    completedAt: row.completed_at ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at ?? undefined
  };
}

function toOpeningHours(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value).filter(
      (entry): entry is [string, string] =>
        typeof entry[0] === "string" && typeof entry[1] === "string"
    )
  );
}
