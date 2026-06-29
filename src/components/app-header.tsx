import Link from "next/link";
import { Inbox, LogOut, Settings } from "lucide-react";
import { logoutAction } from "@/lib/auth/actions";
import type { Business } from "@/lib/domain/types";

export function AppHeader({ business }: { business: Business }) {
  return (
    <header className="border-b border-line bg-white/85 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <Link className="focus-ring rounded-md" href="/dashboard">
          <p className="text-xs font-semibold uppercase text-teal-700">AI Reception Lite</p>
          <p className="text-lg font-semibold text-ink">{business.name}</p>
        </Link>
        <nav className="flex flex-wrap items-center gap-2">
          <Link
            className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-md border border-line bg-white px-3 text-sm font-semibold text-slate-700"
            href="/dashboard"
          >
            <Inbox aria-hidden="true" className="h-4 w-4" />
            Leads
          </Link>
          <Link
            className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-md border border-line bg-white px-3 text-sm font-semibold text-slate-700"
            href="/settings"
          >
            <Settings aria-hidden="true" className="h-4 w-4" />
            Settings
          </Link>
          <form action={logoutAction}>
            <button
              className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-md border border-line bg-white px-3 text-sm font-semibold text-slate-700"
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
