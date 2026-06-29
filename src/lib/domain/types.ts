export const leadTemperatures = ["hot", "warm", "cold", "unclassified"] as const;
export const classifiedTemperatures = ["hot", "warm", "cold"] as const;
export const urgencyLevels = ["high", "medium", "low", "unknown"] as const;
export const funnelStages = [
  "new",
  "qualified",
  "proposal",
  "negotiation",
  "won",
  "lost"
] as const;
export const nextActions = [
  "call",
  "send_proposal",
  "ask_more_information",
  "schedule_meeting",
  "send_pricing",
  "nurture"
] as const;
export const leadStatuses = ["new", "open", "won", "lost", "archived"] as const;
export const taskStatuses = ["open", "in_progress", "completed", "cancelled"] as const;
export const leadSources = [
  "website",
  "whatsapp",
  "instagram",
  "email",
  "phone",
  "manual",
  "demo"
] as const;

export type LeadTemperature = (typeof leadTemperatures)[number];
export type ClassifiedTemperature = (typeof classifiedTemperatures)[number];
export type UrgencyLevel = (typeof urgencyLevels)[number];
export type FunnelStage = (typeof funnelStages)[number];
export type NextAction = (typeof nextActions)[number];
export type LeadStatus = (typeof leadStatuses)[number];
export type TaskStatus = (typeof taskStatuses)[number];
export type LeadSource = (typeof leadSources)[number];

export type Business = {
  id: string;
  name: string;
  toneOfVoice: string;
  timezone: string;
  services: string[];
  openingHours: Record<string, string>;
  createdAt: string;
  updatedAt?: string;
};

export type Lead = {
  id: string;
  businessId: string;
  name: string;
  email?: string;
  phone?: string;
  source: LeadSource;
  requestedService?: string;
  temperature: LeadTemperature;
  funnelStage: FunnelStage;
  summary?: string;
  status: LeadStatus;
  createdAt: string;
  updatedAt?: string;
};

export type Conversation = {
  id: string;
  leadId: string;
  direction: "inbound" | "outbound" | "internal";
  channel: Exclude<LeadSource, "demo"> | "manual";
  body: string;
  createdAt: string;
};

export type AiClassification = {
  id: string;
  leadId: string;
  provider: string;
  model: string;
  temperature: ClassifiedTemperature;
  urgency: UrgencyLevel;
  intent: string;
  confidence: number;
  extractedFields: Record<string, unknown>;
  suggestedNextAction: NextAction;
  responseDraft: string;
  createdAt: string;
};

export type FollowUpTask = {
  id: string;
  leadId: string;
  action: NextAction;
  status: TaskStatus;
  dueAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt?: string;
};

export type AppUser = {
  id: string;
  email?: string;
  fullName?: string;
};

export type LeadListItem = Lead & {
  suggestedNextAction?: NextAction;
};

export type LeadDetail = {
  lead: Lead;
  business: Business;
  conversations: Conversation[];
  classifications: AiClassification[];
  tasks: FollowUpTask[];
};
