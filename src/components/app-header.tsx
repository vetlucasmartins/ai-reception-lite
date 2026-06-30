import Link from "next/link";
import { Inbox, LogOut, Settings } from "lucide-react";
import { logoutAction } from "@/lib/auth/actions";
import type { Business } from "@/lib/domain/types";

export function AppHeader({ business }: { business: Business }) {
  return (
    <header className="sticky top-0 z-20 border-b border-white/70 bg-surface/88 shadow-soft-sm backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <Link className="focus-ring rounded-xl px-2 py-1" href="/dashboard">
          <p className="eyebrow">AI Reception Lite</p>
          <p className="text-lg font-semibold text-ink">{business.name}</p>
        </Link>
        <nav className="flex flex-wrap items-center gap-2">
          <Link
            className="button-secondary px-3"
            href="/dashboard"
          >
            <Inbox aria-hidden="true" className="h-4 w-4" />
            Leads
          </Link>
          <Link
            className="button-secondary px-3"
            href="/settings"
          >
            <Settings aria-hidden="true" className="h-4 w-4" />
            Settings
          </Link>
          <form action={logoutAction}>
            <button
              className="button-secondary px-3"
              type="submit"
            >
              <LogOut aria-hidden="true" className="h-4 w-4" />
              Logout
            </button>
          </form>
        </nav>
      </div>
    </header>
  );
}
