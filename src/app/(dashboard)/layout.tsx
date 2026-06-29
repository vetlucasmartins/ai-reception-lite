import { AppHeader } from "@/components/app-header";
import { requireUser } from "@/lib/auth/session";
import { getRepository } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  const business = await getRepository().ensureBusinessForUser(user);

  return (
    <div className="min-h-dvh">
      <AppHeader business={business} />
      {children}
    </div>
  );
}
