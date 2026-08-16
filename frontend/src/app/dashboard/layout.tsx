"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileCode2,
  GitFork,
  Terminal,
  LogOut,
  ChevronRight,
  Shield,
  Layers,
} from "lucide-react";

const NAV_ITEMS = [
  {
    label: "THE COCKPIT",
    href: "/dashboard",
    icon: LayoutDashboard,
    badge: "LIVE",
  },
  {
    label: "RESUME INGESTION",
    href: "/dashboard/profile",
    icon: FileCode2,
    badge: null,
  },
  {
    label: "EXECUTION ROADMAP",
    href: "/dashboard/roadmap",
    icon: GitFork,
    badge: "9 STEPS",
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen bg-[#0a0a0a] text-neutral-200 overflow-hidden font-sans">
      {/* Persistent Left Sidebar */}
      <aside className="w-64 border-r border-white/10 flex flex-col justify-between bg-[#0d0d0d] select-none z-20 shrink-0">
        <div>
          {/* Brand header */}
          <div className="h-14 border-b border-white/10 px-5 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-2.5 h-2.5 bg-blue-500 group-hover:shadow-[0_0_8px_rgba(59,130,246,0.8)] transition-shadow duration-150" />
              <span className="font-mono text-sm font-bold tracking-wider text-white">
                SKILLGAP
              </span>
            </Link>
            <span className="font-mono text-[10px] text-emerald-400 border border-emerald-500/30 bg-emerald-950/20 px-1.5 py-0.2">
              ACTIVE
            </span>
          </div>

          {/* Target Role Indicator */}
          <div className="p-4 border-b border-white/5 bg-white/[0.01]">
            <span className="font-mono text-[10px] text-neutral-500 uppercase block tracking-wider mb-1">
              TARGET ARCHITECTURE
            </span>
            <p className="font-mono text-xs font-semibold text-neutral-200 truncate">
              Full Stack AI Engineer
            </p>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2 text-xs font-mono tracking-wide transition-[colors,border-color] duration-150 border ${
                    isActive
                      ? "border-blue-500/50 bg-blue-950/20 text-white font-semibold"
                      : "border-transparent text-neutral-400 hover:text-white hover:bg-white/[0.03]"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon
                      className={`w-4 h-4 ${
                        isActive ? "text-blue-400" : "text-neutral-500"
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[9px] px-1.5 py-0.5 border ${
                        isActive
                          ? "border-blue-500/30 bg-blue-900/40 text-blue-300"
                          : "border-white/10 bg-white/[0.02] text-neutral-400"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Profile Hook */}
        <div className="border-t border-white/10 p-3 bg-[#0a0a0a]">
          <div className="flex items-center justify-between p-2 border border-white/5 bg-white/[0.01]">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 border border-white/10 bg-neutral-900 flex items-center justify-center font-mono text-xs text-neutral-300 shrink-0 font-bold">
                SE
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-white truncate">
                  staff.engineer
                </p>
                <p className="font-mono text-[10px] text-neutral-500 truncate">
                  eng@skillgap.dev
                </p>
              </div>
            </div>
            <Link
              href="/"
              title="Logout"
              className="p-1 text-neutral-500 hover:text-rose-400 transition-colors duration-150"
            >
              <LogOut className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top telemetry breadcrumb bar */}
        <header className="h-14 border-b border-white/10 px-8 flex items-center justify-between shrink-0 bg-[#0a0a0a]">
          <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
            <span>PLATFORM</span>
            <ChevronRight className="w-3.5 h-3.5 text-neutral-600" />
            <span className="text-white uppercase font-medium">
              {pathname === "/dashboard"
                ? "COCKPIT OVERVIEW"
                : pathname.replace("/dashboard/", "").replace("/", " // ")}
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono text-neutral-500">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-none bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
              <span className="text-neutral-400">DAG ENGINE: ONLINE</span>
            </div>
            <span className="text-neutral-700">|</span>
            <span>ENV: PRODUCTION</span>
          </div>
        </header>

        {/* Scrollable Dashboard View */}
        <main className="flex-1 overflow-y-auto p-8">{children}</main>
      </div>
    </div>
  );
}
