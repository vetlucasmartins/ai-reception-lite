import "server-only";

import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { DEMO_BUSINESS_ID, DEMO_USER_EMAIL, DEMO_USER_ID, getDatabasePath } from "@/lib/config";
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

type DemoState = {
  businesses: Business[];
  memberships: Membership[];
  leads: Lead[];
  conversations: Conversation[];
  classifications: AiClassification[];
  tasks: FollowUpTask[];
};

type SqliteRepositoryOptions = {
  databasePath?: string;
};

type StateRow = {
  payload: string;
};

const stateId = "default";

let singleton:
  | {
      databasePath: string;
      repository: DataRepository;
    }
  | undefined;

const nowIso = () => new Date().toISOString();

const relativeIso = (minutesOffset: number) =>
  new Date(Date.now() + minutesOffset * 60_000).toISOString();

export function getSqliteRepository() {
  const databasePath = getDatabasePath();

  if (!singleton || singleton.databasePath !== databasePath) {
    singleton = {
      databasePath,
      repository: createSqliteRepository({ databasePath })
    };
  }

  return singleton.repository;
}

export function createSqliteRepository(options: SqliteRepositoryOptions = {}): DataRepository {
  const databasePath = options.databasePath ?? ":memory:";
  const database = openDatabase(databasePath);

  return {
    async getPublicBusiness(businessId) {
      const state = readState(database);
      return state.businesses.find((business) => business.id === businessId) ?? null;
    },

    async ensureBusinessForUser(user) {
      const state = readState(database);
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

      writeState(database, {
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

      const state = readState(database);
      writeState(database, {
        ...state,
        businesses: state.businesses.map((item) =>
          item.id === business.id ? updatedBusiness : item
        )
      });

      return updatedBusiness;
    },

    async listLeadsForUser(userId, filters) {
      const business = await this.ensureBusinessForUser({ id: userId });
      const state = readState(database);
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
          suggestedNextAction: latestClassificationForLead(state, lead.id)?.suggestedNextAction
        }));

      return {
        items,
        total: items.length
      };
    },

    async getLeadDetailForUser(userId, leadId) {
      const business = await this.ensureBusinessForUser({ id: userId });
      const state = readState(database);
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
      const state = readState(database);
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

      writeState(database, {
        ...state,
        leads: [...state.leads, lead]
      });

      return lead;
    },

    async createConversation(input) {
      const state = readState(database);
      const conversation: Conversation = {
        id: crypto.randomUUID(),
        ...input,
        createdAt: nowIso()
      };

      writeState(database, {
        ...state,
        conversations: [...state.conversations, conversation]
      });

      return conversation;
    },

    async saveClassification(input) {
      const state = readState(database);
      const classification: AiClassification = {
        id: crypto.randomUUID(),
        ...input,
        createdAt: nowIso()
      };

      writeState(database, {
        ...state,
        classifications: [...state.classifications, classification]
      });

      return classification;
    },

    async updateLeadFromClassification(leadId, input) {
      const state = readState(database);
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

      writeState(database, {
        ...state,
        leads: state.leads.map((lead) => (lead.id === leadId ? updatedLead : lead))
      });

      return updatedLead;
    },

    async createFollowUpTask(input) {
      const state = readState(database);
      const createdAt = nowIso();
      const task: FollowUpTask = {
        id: crypto.randomUUID(),
        ...input,
        createdAt,
        updatedAt: createdAt
      };

      writeState(database, {
        ...state,
        tasks: [...state.tasks, task]
      });

      return task;
    },

    async updateTaskStatusForUser(userId, taskId, status) {
      const business = await this.ensureBusinessForUser({ id: userId });
      const state = readState(database);
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

      writeState(database, {
        ...state,
        tasks: state.tasks.map((item) => (item.id === task.id ? updatedTask : item))
      });

      return updatedTask;
    }
  };
}

function openDatabase(databasePath: string) {
  if (databasePath !== ":memory:") {
    mkdirSync(dirname(resolve(databasePath)), { recursive: true });
  }

  const database = new DatabaseSync(databasePath);
  database.exec(`
    create table if not exists demo_state (
      id text primary key,
      payload text not null,
      updated_at text not null default current_timestamp
    )
  `);

  return database;
}

function readState(database: DatabaseSync): DemoState {
  const row = database
    .prepare("select payload from demo_state where id = ?")
    .get(stateId) as StateRow | undefined;

  if (row) {
    return JSON.parse(row.payload) as DemoState;
  }

  const state = initialState();
  writeState(database, state);
  return state;
}

function writeState(database: DatabaseSync, state: DemoState) {
  database
    .prepare(
      `
        insert into demo_state (id, payload, updated_at)
        values (?, ?, current_timestamp)
        on conflict(id) do update set
          payload = excluded.payload,
          updated_at = current_timestamp
      `
    )
    .run(stateId, JSON.stringify(state));
}

function initialState(): DemoState {
  const createdAt = relativeIso(-240);
  const warmCreatedAt = relativeIso(-90);
  const coldCreatedAt = relativeIso(-30);
  const hotLeadId = "00000000-0000-4000-8000-000000000101";
  const warmLeadId = "00000000-0000-4000-8000-000000000102";
  const coldLeadId = "00000000-0000-4000-8000-000000000103";

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
    leads: [
      {
        id: hotLeadId,
        businessId: DEMO_BUSINESS_ID,
        name: "Maya Patel",
        email: "maya@example.com",
        phone: "+44 7000 000101",
        source: "website",
        requestedService: "Dental implants",
        temperature: "hot",
        funnelStage: "qualified",
        summary:
          "Maya asked for an appointment this week and mentioned budget for dental implants.",
        status: "open",
        createdAt,
        updatedAt: createdAt
      },
      {
        id: warmLeadId,
        businessId: DEMO_BUSINESS_ID,
        name: "Jon Edwards",
        email: "jon@example.com",
        source: "website",
        requestedService: "Whitening",
        temperature: "warm",
        funnelStage: "new",
        summary: "Jon wants whitening options and pricing before booking.",
        status: "open",
        createdAt: warmCreatedAt,
        updatedAt: warmCreatedAt
      },
      {
        id: coldLeadId,
        businessId: DEMO_BUSINESS_ID,
        name: "Priya Shah",
        email: "priya@example.com",
        phone: "+44 7000 000103",
        source: "instagram",
        requestedService: "Whitening",
        temperature: "cold",
        funnelStage: "new",
        summary: "Priya is researching whitening options for later in the year.",
        status: "new",
        createdAt: coldCreatedAt,
        updatedAt: coldCreatedAt
      }
    ],
    conversations: [
      {
        id: "00000000-0000-4000-8000-000000000201",
        leadId: hotLeadId,
        direction: "inbound",
        channel: "website",
        body: "I need an appointment this week for dental implants and want to understand the price range.",
        createdAt
      },
      {
        id: "00000000-0000-4000-8000-000000000202",
        leadId: warmLeadId,
        direction: "inbound",
        channel: "website",
        body: "Can you send me options and pricing for whitening?",
        createdAt: warmCreatedAt
      },
      {
        id: "00000000-0000-4000-8000-000000000203",
        leadId: coldLeadId,
        direction: "inbound",
        channel: "instagram",
        body: "I'm comparing whitening options for later this year. Could you send the basics?",
        createdAt: coldCreatedAt
      }
    ],
    classifications: [
      {
        id: "00000000-0000-4000-8000-000000000301",
        leadId: hotLeadId,
        provider: "mock",
        model: "heuristic-demo-v1",
        temperature: "hot",
        urgency: "high",
        intent: "Book an urgent consultation",
        confidence: 0.76,
        extractedFields: {
          budgetSignal: "mentioned",
          requestedService: "Dental implants",
          funnelStage: "qualified",
          summary:
            "Maya asked for an appointment this week and mentioned budget for dental implants."
        },
        suggestedNextAction: "call",
        responseDraft:
          "Thanks, Maya. We received your request about dental implants. Our team will review the details and follow up shortly to confirm the best next step.",
        createdAt
      },
      {
        id: "00000000-0000-4000-8000-000000000302",
        leadId: warmLeadId,
        provider: "mock",
        model: "heuristic-demo-v1",
        temperature: "warm",
        urgency: "medium",
        intent: "Compare service options",
        confidence: 0.54,
        extractedFields: {
          budgetSignal: "mentioned",
          requestedService: "Whitening",
          funnelStage: "new",
          summary: "Jon wants whitening options and pricing before booking."
        },
        suggestedNextAction: "send_pricing",
        responseDraft:
          "Thanks, Jon. We received your pricing question about whitening. Our team will follow up with guidance and any details needed for an accurate estimate.",
        createdAt: warmCreatedAt
      },
      {
        id: "00000000-0000-4000-8000-000000000303",
        leadId: coldLeadId,
        provider: "mock",
        model: "heuristic-demo-v1",
        temperature: "cold",
        urgency: "low",
        intent: "Research future treatment options",
        confidence: 0.62,
        extractedFields: {
          requestedService: "Whitening",
          funnelStage: "new",
          summary: "Priya is researching whitening options for later in the year."
        },
        suggestedNextAction: "nurture",
        responseDraft:
          "Thanks, Priya. We can share whitening options and help you compare what fits your timing when you are closer to booking.",
        createdAt: coldCreatedAt
      }
    ],
    tasks: [
      {
        id: "00000000-0000-4000-8000-000000000401",
        leadId: hotLeadId,
        action: "call",
        status: "open",
        dueAt: relativeIso(15),
        createdAt,
        updatedAt: createdAt
      },
      {
        id: "00000000-0000-4000-8000-000000000402",
        leadId: warmLeadId,
        action: "send_pricing",
        status: "open",
        dueAt: relativeIso(240),
        createdAt: warmCreatedAt,
        updatedAt: warmCreatedAt
      },
      {
        id: "00000000-0000-4000-8000-000000000403",
        leadId: coldLeadId,
        action: "nurture",
        status: "open",
        dueAt: relativeIso(1440),
        createdAt: coldCreatedAt,
        updatedAt: coldCreatedAt
      }
    ]
  };
}

function latestClassificationForLead(state: DemoState, leadId: string) {
  return state.classifications
    .filter((classification) => classification.leadId === leadId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
}
