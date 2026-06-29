import "server-only";

import { getStorageMode } from "@/lib/config";
import { memoryRepository } from "@/lib/data/memory-repository";
import { supabaseRepository } from "@/lib/data/supabase-repository";

export function getRepository() {
  return getStorageMode() === "memory" ? memoryRepository : supabaseRepository;
}
