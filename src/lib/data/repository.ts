import {
  type AiClassification,
  type AppUser,
  type Business,
  type Conversation,
  type FollowUpTask,
  type Lead,
  type LeadDetail,
  type LeadListItem,
  type LeadStatus,
  type LeadTemperature,
  type NextAction,
  type TaskStatus
} from "@/lib/domain/types";
import type { BusinessSettingsInput } from "@/lib/leads/validation";
import type { PersistedClassificationInput } from "@/lib/ai/schema";

export type LeadFilters = {
  temperature?: LeadTemperature;
  status?: LeadStatus;
  q?: string;
};

export type LeadListResult = {
  items: LeadListItem[];
  total: number;
};

export type CreateLeadRecordInput = {
  businessId: string;
  name: string;
  email?: string;
  phone?: string;
  source: Lead["source"];
  requestedService?: string;
};

export type CreateConversationInput = {
  leadId: string;
  direction: Conversation["direction"];
  channel: Conversation["channel"];
  body: string;
};

export type CreateFollowUpTaskInput = {
  leadId: string;
  action: NextAction;
  status: TaskStatus;
  dueAt?: string;
};

export type LeadUpdateFromClassification = {
  temperature: Exclude<LeadTemperature, "unclassified">;
  funnelStage: Lead["funnelStage"];
  summary: string;
  requestedService?: string;
};

export interface DataRepository {
  getPublicBusiness(businessId: string): Promise<Business | null>;
  ensureBusinessForUser(user: AppUser): Promise<Business>;
  updateBusinessForUser(userId: string, input: BusinessSettingsInput): Promise<Business>;
  listLeadsForUser(userId: string, filters: LeadFilters): Promise<LeadListResult>;
  getLeadDetailForUser(userId: string, leadId: string): Promise<LeadDetail | null>;
  createLead(input: CreateLeadRecordInput): Promise<Lead>;
  createConversation(input: CreateConversationInput): Promise<Conversation>;
  saveClassification(input: PersistedClassificationInput): Promise<AiClassification>;
  updateLeadFromClassification(
    leadId: string,
    input: LeadUpdateFromClassification
  ): Promise<Lead>;
  createFollowUpTask(input: CreateFollowUpTaskInput): Promise<FollowUpTask>;
  updateTaskStatusForUser(
    userId: string,
    taskId: string,
    status: TaskStatus
  ): Promise<FollowUpTask | null>;
}
