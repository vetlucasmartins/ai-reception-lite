import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  DEMO_USER_EMAIL,
  DEMO_USER_ID,
  hasSupabasePublicEnv,
  isDemoAuthEnabled
} from "@/lib/config";
import type { AppUser } from "@/lib/domain/types";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const demoAuthCookieName = "ai-reception-demo-auth";

export async function getCurrentUser(): Promise<AppUser | null> {
  if (isDemoAuthEnabled()) {
    const cookieStore = await cookies();
    const demoCookie = cookieStore.get(demoAuthCookieName);

    if (demoCookie?.value === "1") {
      return {
        id: DEMO_USER_ID,
        email: DEMO_USER_EMAIL,
        fullName: "Demo User"
      };
    }
  }

  if (!hasSupabasePublicEnv()) {
    return null;
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  return {
    id: user.id,
    email: user.email ?? undefined,
    fullName:
      typeof user.user_metadata?.full_name === "string"
        ? user.user_metadata.full_name
        : undefined
  };
}

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}
