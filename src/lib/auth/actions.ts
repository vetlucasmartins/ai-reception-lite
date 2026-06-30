"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getRepository } from "@/lib/data";
import {
  DEMO_USER_EMAIL,
  DEMO_USER_ID,
  isDemoAuthEnabled
} from "@/lib/config";
import { demoAuthCookieName, requireUser } from "@/lib/auth/session";

const authSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(6),
  fullName: z.string().trim().max(120).optional()
});

export async function signInAction(formData: FormData) {
  const parsed = authSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password")
  });

  if (!parsed.success) {
    redirect("/login?error=Enter+a+valid+email+and+password");
  }

  if (!isDemoAuthEnabled()) {
    redirect("/login?error=Demo+login+is+disabled");
  }

  await startDemoSession();
}

export async function signUpAction(formData: FormData) {
  const parsed = authSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    fullName: formData.get("fullName") || undefined
  });

  if (!parsed.success) {
    redirect("/signup?error=Enter+valid+signup+details");
  }

  if (!isDemoAuthEnabled()) {
    redirect("/signup?error=Demo+signup+is+disabled");
  }

  await startDemoSession(parsed.data.fullName);
}

export async function logoutAction() {
  const cookieStore = await cookies();

  if (cookieStore.get(demoAuthCookieName)) {
    cookieStore.delete(demoAuthCookieName);
  }

  redirect("/login");
}

export async function updateTaskStatusAction(formData: FormData) {
  const user = await requireUser();
  const taskId = String(formData.get("taskId") ?? "");
  const status = String(formData.get("status") ?? "");

  if (!taskId || !["open", "in_progress", "completed", "cancelled"].includes(status)) {
    redirect("/dashboard");
  }

  await getRepository().updateTaskStatusForUser(
    user.id,
    taskId,
    status as "open" | "in_progress" | "completed" | "cancelled"
  );

  const leadId = String(formData.get("leadId") ?? "");
  redirect(leadId ? `/leads/${leadId}` : "/dashboard");
}

async function startDemoSession(fullName = "Demo User") {
  const cookieStore = await cookies();
  cookieStore.set(demoAuthCookieName, "1", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/"
  });
  await getRepository().ensureBusinessForUser({
    id: DEMO_USER_ID,
    email: DEMO_USER_EMAIL,
    fullName
  });
  redirect("/dashboard");
}
