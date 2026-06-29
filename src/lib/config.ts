export const DEMO_BUSINESS_ID = "00000000-0000-4000-8000-000000000001";
export const DEMO_USER_ID = "00000000-0000-4000-8000-000000000002";
export const DEMO_USER_EMAIL = "demo@aireception.local";

export type StorageMode = "memory" | "supabase";

export function hasSupabasePublicEnv() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export function hasSupabaseServiceEnv() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

export function getStorageMode(): StorageMode {
  if (process.env.NODE_ENV === "production") {
    return "supabase";
  }

  if (process.env.AI_RECEPTION_STORAGE === "memory") {
    return "memory";
  }

  if (process.env.AI_RECEPTION_STORAGE === "supabase") {
    return "supabase";
  }

  return hasSupabaseServiceEnv() ? "supabase" : "memory";
}

export function isDemoAuthEnabled() {
  if (process.env.NODE_ENV === "production") {
    return false;
  }

  if (process.env.DEMO_AUTH_ENABLED === "true") {
    return true;
  }

  return getStorageMode() === "memory";
}

export function getDefaultBusinessId() {
  return process.env.NEXT_PUBLIC_DEFAULT_BUSINESS_ID || DEMO_BUSINESS_ID;
}

export function getAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

export function getAiProvider() {
  return process.env.AI_PROVIDER || "openai";
}

export function getAiModel() {
  return process.env.AI_MODEL || "gpt-4.1-mini";
}
