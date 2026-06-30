import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  DEMO_USER_EMAIL,
  DEMO_USER_ID,
  isDemoAuthEnabled
} from "@/lib/config";
import type { AppUser } from "@/lib/domain/types";

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

  return null;
}

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}
