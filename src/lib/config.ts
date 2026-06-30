export const DEMO_BUSINESS_ID = "00000000-0000-4000-8000-000000000001";
export const DEMO_USER_ID = "00000000-0000-4000-8000-000000000002";
export const DEMO_USER_EMAIL = "demo@aireception.local";

export function getDatabasePath() {
  return process.env.AI_RECEPTION_DB_PATH || ".data/ai-reception-lite.sqlite";
}

export function isDemoAuthEnabled() {
  return process.env.DEMO_AUTH_ENABLED !== "false";
}

export function getDefaultBusinessId() {
  return process.env.NEXT_PUBLIC_DEFAULT_BUSINESS_ID || DEMO_BUSINESS_ID;
}

export function getAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}
