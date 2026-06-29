import { z } from "zod";
import { failure, success } from "@/lib/api/responses";
import { getCurrentUser } from "@/lib/auth/session";
import { getRepository } from "@/lib/data";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();

  if (!user) {
    return failure("UNAUTHORIZED", "Authentication is required.", 401);
  }

  const { id } = await params;
  const parsedId = z.string().uuid().safeParse(id);

  if (!parsedId.success) {
    return failure("VALIDATION_ERROR", "Lead id must be a valid UUID.", 400);
  }

  try {
    const detail = await getRepository().getLeadDetailForUser(user.id, parsedId.data);

    if (!detail) {
      return failure("NOT_FOUND", "Lead not found.", 404);
    }

    return success(detail);
  } catch {
    return failure("INTERNAL_ERROR", "Could not load lead.", 500);
  }
}
