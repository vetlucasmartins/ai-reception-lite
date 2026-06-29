"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getRepository } from "@/lib/data";
import {
  DEMO_USER_EMAIL,
  DEMO_USER_ID,
  hasSupabasePublicEnv,
  isDemoAuthEnabled
} from "@/lib/config";
import { demoAuthCookieName, requireUser } from "@/lib/auth/session";
import { createServerSupabaseClient } from "@/lib/supabase/server";

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

  if (isDemoAuthEnabled() && parsed.data.email === DEMO_USER_EMAIL) {
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
      fullName: "Demo User"
    });
    redirect("/dashboard");
  }

  if (!hasSupabasePublicEnv()) {
    redirect("/login?error=Supabase+is+not+configured");
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password
  });

  if (error || !data.user) {
    redirect("/login?error=Invalid+login+credentials");
  }

  await getRepository().ensureBusinessForUser({
    id: data.user.id,
    email: data.user.email ?? undefined
  });
  redirect("/dashboard");
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

  if (isDemoAuthEnabled() && parsed.data.email === DEMO_USER_EMAIL) {
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
      fullName: "Demo User"
    });
    redirect("/dashboard");
  }

  if (!hasSupabasePublicEnv()) {
    redirect("/signup?error=Supabase+is+not+configured");
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        full_name: parsed.data.fullName
      }
    }
  });

  if (error || !data.user) {
    redirect("/signup?error=Could+not+create+account");
  }

  if (!data.session) {
    redirect("/login?message=Check+your+email+to+confirm+the+account");
  }

  await getRepository().ensureBusinessForUser({
    id: data.user.id,
    email: data.user.email ?? undefined,
    fullName: parsed.data.fullName
  });
  redirect("/dashboard");
}

export async function logoutAction() {
  const cookieStore = await cookies();

  if (cookieStore.get(demoAuthCookieName)) {
    cookieStore.delete(demoAuthCookieName);
  }

  if (hasSupabasePublicEnv()) {
    const supabase = await createServerSupabaseClient();
    await supabase.auth.signOut();
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
