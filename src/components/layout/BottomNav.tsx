"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SquaresFour, Briefcase, UsersThree, FileText, Sparkle } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", icon: SquaresFour, label: "Dashboard" },
  { href: "/leads", icon: Briefcase, label: "Leads" },
  { href: "/contacts", icon: UsersThree, label: "Contacts" },
  { href: "/invoices", icon: FileText, label: "Invoices" },
  { href: "/ai", icon: Sparkle, label: "Aria" },
];

export function BottomNav() {
  const pathname = usePathname();
  const isAria = pathname === "/ai";

  if (isAria) {
    return (
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 safe-area-inset-bottom"
        style={{
          background: "rgba(3,7,15,0.95)",
          borderTop: "1px solid rgba(36,99,255,0.12)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div className="flex items-center justify-around h-16">
          {NAV_ITEMS.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center gap-0.5 flex-1 py-2 touch-target transition-all"
                style={{
                  color: active ? "#93c5fd" : "rgba(147,197,253,0.3)",
                }}
              >
                {active && item.href === "/ai" ? (
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full bg-blue-500/30 animate-ping" style={{ animationDuration: "3s" }} />
                    <item.icon className="w-5 h-5 relative z-10" weight="fill" style={{ filter: "drop-shadow(0 0 6px rgba(36,99,255,0.8))" }} />
                  </div>
                ) : (
                  <item.icon className="w-5 h-5" weight={active ? "fill" : "regular"} />
                )}
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    );
  }

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t safe-area-inset-bottom">
      <div className="flex items-center justify-around h-16">
        {NAV_ITEMS.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 flex-1 py-2 touch-target",
                active ? "text-accent" : "text-muted-foreground"
              )}
            >
              <item.icon className="w-5 h-5" weight={active ? "fill" : "regular"} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
