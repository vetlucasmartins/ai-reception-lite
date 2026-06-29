import { failure, success } from "@/lib/api/responses";
import { getCurrentUser } from "@/lib/auth/session";
import { getRepository } from "@/lib/data";
import {
  leadStatuses,
  leadTemperatures,
  type LeadStatus,
  type LeadTemperature
} from "@/lib/domain/types";

export async function GET(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return failure("UNAUTHORIZED", "Authentication is required.", 401);
  }

  const url = new URL(request.url);
  const temperature = normalizeFilter<LeadTemperature>(
    url.searchParams.get("temperature"),
    leadTemperatures
  );
  const status = normalizeFilter<LeadStatus>(url.searchParams.get("status"), leadStatuses);

  try {
    const data = await getRepository().listLeadsForUser(user.id, {
      temperature,
      status,
      q: url.searchParams.get("q") ?? undefined
    });

    return success({
      items: data.items,
      pagination: {
        page: 1,
        pageSize: data.items.length,
        total: data.total
      }
    });
  } catch {
    return failure("INTERNAL_ERROR", "Could not load leads.", 500);
  }
}

function normalizeFilter<T extends string>(
  value: string | null,
  allowed: readonly T[]
): T | undefined {
  return value && allowed.includes(value as T) ? (value as T) : undefined;
}
