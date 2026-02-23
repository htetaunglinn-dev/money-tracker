"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Receipt,
  Target,
  BarChart3,
  Settings,
  LogOut,
  Wallet,
} from "lucide-react";

const bottomTabs = [
  { name: "Home", href: "/dashboard", icon: LayoutDashboard },
  { name: "Transactions", href: "/dashboard/transactions", icon: Receipt },
  { name: "Budget", href: "/dashboard/budget", icon: Target },
  { name: "Reports", href: "/dashboard/reports", icon: BarChart3 },
];

const sidebarLinks = [
  ...bottomTabs,
  { name: "Wallets", href: "/dashboard/wallets", icon: Wallet },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function Navigation() {
  const { data: session } = useSession();
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href;

  return (
    <>
      {/* ── Mobile Top Header ───────────────────────────────── */}
      <header className="lg:hidden fixed top-0 inset-x-0 z-40 h-14 flex items-center justify-between px-4 bg-money-black border-b border-money-green/10">
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className="absolute inset-0 bg-money-green blur-md opacity-40 rounded-full" />
            <Wallet className="relative h-6 w-6 text-money-green" />
          </div>
          <span className="text-lg font-bold tracking-tight text-money-light">
            Money<span className="text-money-green">Tracker</span>
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Link
            href="/dashboard/settings"
            className="p-2 rounded-full text-[#A0A0A0] hover:text-money-green transition-colors"
            aria-label="Settings"
          >
            <Settings className="h-5 w-5" />
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="p-2 rounded-full text-[#A0A0A0] hover:text-money-green transition-colors"
            aria-label="Sign out"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* ── Mobile Bottom Nav ────────────────────────────────── */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 h-16 bg-money-black border-t border-money-green/10 flex items-stretch">
        {bottomTabs.map((tab) => {
          const active = isActive(tab.href);
          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={cn(
                "flex-1 flex flex-col items-center justify-center gap-1 py-2 relative transition-colors",
                active ? "text-money-green" : "text-[#A0A0A0] hover:text-money-light"
              )}
            >
              {active && (
                <span className="absolute top-0 left-3 right-3 h-0.5 bg-money-green rounded-full" />
              )}
              <tab.icon className="h-5 w-5" />
              <span className="text-[10px] font-medium leading-none">{tab.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* ── Desktop Sidebar ──────────────────────────────────── */}
      <aside className="hidden lg:flex lg:flex-col lg:w-60 lg:fixed lg:inset-y-0 z-40 bg-money-black border-r border-money-green/10">
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-6 border-b border-money-green/10">
          <div className="relative">
            <div className="absolute inset-0 bg-money-green blur-lg opacity-50 rounded-full" />
            <Wallet className="relative h-7 w-7 text-money-green" />
          </div>
          <span className="text-xl font-bold text-money-light tracking-tight">
            Money<span className="text-money-green">Tracker</span>
          </span>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {sidebarLinks.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.name}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                  active
                    ? "bg-money-green/10 text-money-green shadow-[inset_0_0_0_1px_rgba(93,214,44,0.15)]"
                    : "text-[#A0A0A0] hover:text-money-light hover:bg-white/5"
                )}
              >
                <link.icon className="h-5 w-5 shrink-0" />
                {link.name}
                {active && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-money-green" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User info + sign out */}
        <div className="p-4 border-t border-money-green/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-money-green/20 flex items-center justify-center shrink-0 ring-1 ring-money-green/30">
              <span className="text-sm font-bold text-money-green">
                {session?.user?.name?.[0]?.toUpperCase() ?? "U"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-money-light truncate">
                {session?.user?.name}
              </p>
              <p className="text-xs text-[#A0A0A0] truncate">
                {session?.user?.email}
              </p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="p-1.5 rounded-lg text-[#A0A0A0] hover:text-money-green hover:bg-money-green/10 transition-colors"
              aria-label="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
