import { DEMO_BUSINESS_ID, DEMO_USER_EMAIL, DEMO_USER_ID } from "@/lib/config";
import {
  type AiClassification,
  type Business,
  type Conversation,
  type FollowUpTask,
  type Lead,
  type LeadListItem
} from "@/lib/domain/types";
import { type DataRepository } from "@/lib/data/repository";

type Membership = {
  businessId: string;
  userId: string;
};

type MemoryState = {
  businesses: Business[];
  memberships: Membership[];
  leads: Lead[];
  conversations: Conversation[];
  classifications: AiClassification[];
  tasks: FollowUpTask[];
};

declare global {
  var __AI_RECEPTION_MEMORY_STATE__: MemoryState | undefined;
}

const nowIso = () => new Date().toISOString();

function initialState(): MemoryState {
  const createdAt = nowIso();

  return {
    businesses: [
      {
        id: DEMO_BUSINESS_ID,
        name: "Demo Clinic",
        toneOfVoice: "friendly and professional",
        timezone: "Europe/London",
        services: ["Dental implants", "Whitening", "Emergency dental care"],
        openingHours: {
          Mon: "09:00-18:00",
          Tue: "09:00-18:00",
          Wed: "09:00-18:00",
          Thu: "09:00-18:00",
          Fri: "09:00-17:00"
        },
        createdAt,
        updatedAt: createdAt
      }
    ],
    memberships: [{ businessId: DEMO_BUSINESS_ID, userId: DEMO_USER_ID }],
    leads: [],
    conversations: [],
    classifications: [],
    tasks: []
  };
}

function readState() {
  globalThis.__AI_RECEPTION_MEMORY_STATE__ ??= initialState();
  return globalThis.__AI_RECEPTION_MEMORY_STATE__;
}

function writeState(nextState: MemoryState) {
  globalThis.__AI_RECEPTION_MEMORY_STATE__ = nextState;
}

export function resetMemoryRepository() {
  writeState(initialState());
}

export const memoryRepository: DataRepository = {
  async getPublicBusiness(businessId) {
    const state = readState();
    return state.businesses.find((business) => business.id === businessId) ?? null;
  },

  async ensureBusinessForUser(user) {
    const state = readState();
    const membership = state.memberships.find((item) => item.userId === user.id);
    const existingBusiness = membership
      ? state.businesses.find((business) => business.id === membership.businessId)
      : null;

    if (existingBusiness) {
      return existingBusiness;
    }

    const createdAt = nowIso();
    const business: Business = {
      id: crypto.randomUUID(),
      name: user.email === DEMO_USER_EMAIL ? "Demo Clinic" : "My Business",
      toneOfVoice: "friendly and professional",
      timezone: "Europe/London",
      services: ["Consultation", "Quote request", "Follow-up call"],
      openingHours: {
        Mon: "09:00-17:00",
        Tue: "09:00-17:00",
        Wed: "09:00-17:00",
        Thu: "09:00-17:00",
        Fri: "09:00-17:00"
      },
      createdAt,
      updatedAt: createdAt
    };

    writeState({
      ...state,
      businesses: [...state.businesses, business],
      memberships: [...state.memberships, { businessId: business.id, userId: user.id }]
    });

    return business;
  },

  async updateBusinessForUser(userId, input) {
    const business = await this.ensureBusinessForUser({ id: userId });
    const updatedBusiness: Business = {
      ...business,
      ...input,
      updatedAt: nowIso()
    };

    const state = readState();
    writeState({
      ...state,
      businesses: state.businesses.map((item) =>
        item.id === business.id ? updatedBusiness : item
      )
    });

    return updatedBusiness;
  },

  async listLeadsForUser(userId, filters) {
    const business = await this.ensureBusinessForUser({ id: userId });
    const state = readState();
    const normalizedQuery = filters.q?.toLowerCase().trim();
    const scopedLeads = state.leads.filter((lead) => lead.businessId === business.id);
    const filteredLeads = scopedLeads.filter((lead) => {
      const matchesTemperature =
        !filters.temperature || lead.temperature === filters.temperature;
      const matchesStatus = !filters.status || lead.status === filters.status;
      const haystack = `${lead.name} ${lead.email ?? ""} ${lead.phone ?? ""} ${
        lead.summary ?? ""
      } ${lead.requestedService ?? ""}`.toLowerCase();
      const matchesQuery = !normalizedQuery || haystack.includes(normalizedQuery);

      return matchesTemperature && matchesStatus && matchesQuery;
    });
    const items = [...filteredLeads]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map<LeadListItem>((lead) => ({
        ...lead,
        suggestedNextAction: latestClassificationForLead(lead.id)?.suggestedNextAction
      }));

    return {
      items,
      total: items.length
    };
  },

  async getLeadDetailForUser(userId, leadId) {
    const business = await this.ensureBusinessForUser({ id: userId });
    const state = readState();
    const lead = state.leads.find(
      (item) => item.id === leadId && item.businessId === business.id
    );

    if (!lead) {
      return null;
    }

    return {
      lead,
      business,
      conversations: state.conversations
        .filter((conversation) => conversation.leadId === lead.id)
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
      classifications: state.classifications
        .filter((classification) => classification.leadId === lead.id)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
      tasks: state.tasks
        .filter((task) => task.leadId === lead.id)
        .sort((a, b) => (a.dueAt ?? "").localeCompare(b.dueAt ?? ""))
    };
  },

  async createLead(input) {
    const state = readState();
    const createdAt = nowIso();
    const lead: Lead = {
      id: crypto.randomUUID(),
      businessId: input.businessId,
      name: input.name,
      email: input.email,
      phone: input.phone,
      source: input.source,
      requestedService: input.requestedService,
      temperature: "unclassified",
      funnelStage: "new",
      status: "new",
      createdAt,
      updatedAt: createdAt
    };

    writeState({
      ...state,
      leads: [...state.leads, lead]
    });

    return lead;
  },

  async createConversation(input) {
    const state = readState();
    const conversation: Conversation = {
      id: crypto.randomUUID(),
      ...input,
      createdAt: nowIso()
    };

    writeState({
      ...state,
      conversations: [...state.conversations, conversation]
    });

    return conversation;
  },

  async saveClassification(input) {
    const state = readState();
    const classification: AiClassification = {
      id: crypto.randomUUID(),
      ...input,
      createdAt: nowIso()
    };

    writeState({
      ...state,
      classifications: [...state.classifications, classification]
    });

    return classification;
  },

  async updateLeadFromClassification(leadId, input) {
    const state = readState();
    const existingLead = state.leads.find((lead) => lead.id === leadId);

    if (!existingLead) {
      throw new Error("Lead not found");
    }

    const updatedLead: Lead = {
      ...existingLead,
      requestedService:
        input.requestedService && input.requestedService !== "unknown"
          ? input.requestedService
          : existingLead.requestedService,
      temperature: input.temperature,
      funnelStage: input.funnelStage,
      summary: input.summary,
      status: existingLead.status === "new" ? "open" : existingLead.status,
      updatedAt: nowIso()
    };

    writeState({
      ...state,
      leads: state.leads.map((lead) => (lead.id === leadId ? updatedLead : lead))
    });

    return updatedLead;
  },

  async createFollowUpTask(input) {
    const state = readState();
    const task: FollowUpTask = {
      id: crypto.randomUUID(),
      ...input,
      createdAt: nowIso(),
      updatedAt: nowIso()
    };

    writeState({
      ...state,
      tasks: [...state.tasks, task]
    });

    return task;
  },

  async updateTaskStatusForUser(userId, taskId, status) {
    const business = await this.ensureBusinessForUser({ id: userId });
    const state = readState();
    const task = state.tasks.find((item) => item.id === taskId);
    const lead = task ? state.leads.find((item) => item.id === task.leadId) : null;

    if (!task || !lead || lead.businessId !== business.id) {
      return null;
    }

    const updatedTask: FollowUpTask = {
      ...task,
      status,
      completedAt: status === "completed" ? nowIso() : undefined,
      updatedAt: nowIso()
    };

    writeState({
      ...state,
      tasks: state.tasks.map((item) => (item.id === task.id ? updatedTask : item))
    });

    return updatedTask;
  }
};

function latestClassificationForLead(leadId: string) {
  const state = readState();
  return state.classifications
    .filter((classification) => classification.leadId === leadId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
}
