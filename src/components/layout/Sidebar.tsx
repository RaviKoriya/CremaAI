"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SquaresFour,
  Briefcase,
  UsersThree,
  TrendUp,
  FileText,
  ChartBar,
  Sparkle,
  Gear,
  CaretLeft,
  CaretRight,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const NAV_ITEMS = [
  { href: "/dashboard", icon: SquaresFour, label: "Dashboard" },
  { href: "/leads", icon: Briefcase, label: "Leads" },
  { href: "/contacts", icon: UsersThree, label: "Contacts" },
  { href: "/pipeline", icon: TrendUp, label: "Pipeline" },
  { href: "/invoices", icon: FileText, label: "Invoices" },
  { href: "/reports", icon: ChartBar, label: "Reports" },
  { href: "/ai", icon: Sparkle, label: "Ask Aria" },
];

const BOTTOM_ITEMS = [
  { href: "/settings", icon: Gear, label: "Settings" },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const isAria = pathname === "/ai";

  if (isAria) {
    // Futuristic dark sidebar for Aria page
    return (
      <aside
        className={cn(
          "hidden md:flex flex-col h-screen sticky top-0 transition-all duration-300 z-40",
          collapsed ? "w-16" : "w-60"
        )}
        style={{
          background: "linear-gradient(180deg, #060c1a 0%, #030711 100%)",
          borderRight: "1px solid rgba(36,99,255,0.12)",
        }}
      >
        {/* Logo */}
        <div
          className={cn("flex items-center h-16 px-4", collapsed ? "justify-center" : "gap-3")}
          style={{ borderBottom: "1px solid rgba(36,99,255,0.1)" }}
        >
          {/* Glowing orb logo */}
          <div className="relative w-8 h-8 flex-shrink-0">
            <div className="absolute inset-0 rounded-lg bg-blue-500/20 animate-ping" style={{ animationDuration: "3s" }} />
            <div
              className="relative w-8 h-8 rounded-lg flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #3b82f6, #2463FF)",
                boxShadow: "0 0 16px rgba(36,99,255,0.5)",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M3 3h8v8H3V3zm10 0h8v8h-8V3zm-10 10h8v8H3v-8zm13 4a4 4 0 100-8 4 4 0 000 8z" fill="white" />
              </svg>
            </div>
          </div>
          {!collapsed && (
            <span
              className="font-bold text-lg tracking-tight"
              style={{
                background: "linear-gradient(135deg, #93c5fd, #ffffff)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              LeadFlow
            </span>
          )}
        </div>

        {/* Nav Items */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
          {NAV_ITEMS.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all touch-target",
                )}
                style={
                  active
                    ? {
                        background: "linear-gradient(135deg, rgba(36,99,255,0.25), rgba(36,99,255,0.15))",
                        border: "1px solid rgba(36,99,255,0.3)",
                        color: "#93c5fd",
                        boxShadow: "0 0 12px rgba(36,99,255,0.15)",
                      }
                    : {
                        color: "rgba(147,197,253,0.4)",
                        border: "1px solid transparent",
                      }
                }
                title={collapsed ? item.label : undefined}
                onMouseEnter={(e) => {
                  if (!active) {
                    (e.currentTarget as HTMLAnchorElement).style.color = "rgba(147,197,253,0.8)";
                    (e.currentTarget as HTMLAnchorElement).style.background = "rgba(36,99,255,0.08)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    (e.currentTarget as HTMLAnchorElement).style.color = "rgba(147,197,253,0.4)";
                    (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
                  }
                }}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" weight={active ? "fill" : "regular"} />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Items */}
        <div className="px-2 py-4 space-y-1" style={{ borderTop: "1px solid rgba(36,99,255,0.1)" }}>
          {BOTTOM_ITEMS.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all touch-target"
                style={{
                  color: active ? "#93c5fd" : "rgba(147,197,253,0.4)",
                  border: "1px solid transparent",
                }}
                title={collapsed ? item.label : undefined}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.color = "rgba(147,197,253,0.8)";
                  (e.currentTarget as HTMLAnchorElement).style.background = "rgba(36,99,255,0.08)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.color = active ? "#93c5fd" : "rgba(147,197,253,0.4)";
                  (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
                }}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" weight={active ? "fill" : "regular"} />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm w-full transition-all touch-target"
            style={{ color: "rgba(147,197,253,0.3)", border: "1px solid transparent" }}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = "rgba(147,197,253,0.7)";
              (e.currentTarget as HTMLButtonElement).style.background = "rgba(36,99,255,0.08)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = "rgba(147,197,253,0.3)";
              (e.currentTarget as HTMLButtonElement).style.background = "transparent";
            }}
          >
            {collapsed ? (
              <CaretRight className="w-5 h-5 flex-shrink-0" />
            ) : (
              <>
                <CaretLeft className="w-5 h-5 flex-shrink-0" />
                <span>Collapse</span>
              </>
            )}
          </button>
        </div>
      </aside>
    );
  }

  // Default sidebar
  return (
    <aside
      className={cn(
        "hidden md:flex flex-col h-screen sticky top-0 bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-all duration-300 z-40",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {/* Logo */}
      <div className={cn("flex items-center h-16 px-4 border-b border-sidebar-border", collapsed ? "justify-center" : "gap-3")}>
        <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M3 3h8v8H3V3zm10 0h8v8h-8V3zm-10 10h8v8H3v-8zm13 4a4 4 0 100-8 4 4 0 000 8z" fill="white" />
          </svg>
        </div>
        {!collapsed && (
          <span className="font-bold text-lg tracking-tight">LeadFlow</span>
        )}
      </div>

      {/* Nav Items */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {NAV_ITEMS.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors touch-target",
                active
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" weight={active ? "fill" : "regular"} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Items */}
      <div className="px-2 py-4 border-t border-sidebar-border space-y-1">
        {BOTTOM_ITEMS.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors touch-target",
                active
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" weight={active ? "fill" : "regular"} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground w-full transition-colors touch-target"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <CaretRight className="w-5 h-5 flex-shrink-0" />
          ) : (
            <>
              <CaretLeft className="w-5 h-5 flex-shrink-0" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
