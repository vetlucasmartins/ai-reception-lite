import "server-only";

import { getSqliteRepository } from "@/lib/data/sqlite-repository";

export function getRepository() {
  return getSqliteRepository();
}
