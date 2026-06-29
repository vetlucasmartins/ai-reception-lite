"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { getRepository } from "@/lib/data";
import {
  businessSettingsSchema,
  parseOpeningHours,
  parseServices
} from "@/lib/leads/validation";

export async function updateBusinessSettingsAction(formData: FormData) {
  const user = await requireUser();
  const parsed = businessSettingsSchema.safeParse({
    name: formData.get("name"),
    toneOfVoice: formData.get("toneOfVoice"),
    timezone: formData.get("timezone"),
    services: parseServices(formData.get("services")),
    openingHours: parseOpeningHours(formData.get("openingHours"))
  });

  if (!parsed.success) {
    redirect("/settings?error=Check+the+business+settings");
  }

  await getRepository().updateBusinessForUser(user.id, parsed.data);
  revalidatePath("/settings");
  revalidatePath("/dashboard");
  redirect("/settings?message=Settings+saved");
}
