"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { BottomNav } from "./BottomNav";
import { TopBar } from "./TopBar";
import { GlobalSearch } from "./GlobalSearch";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import type { Profile } from "@/types/database";

interface AppShellProps {
  children: React.ReactNode;
  title?: string;
  profile?: Profile | null;
  companyCurrency?: string;
}

export function AppShell({ children, title = "LeadFlow", profile, companyCurrency = "USD" }: AppShellProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const pathname = usePathname();
  const isAria = pathname === "/ai";

  return (
    <CurrencyProvider initialCurrency={companyCurrency}>
      <div
        className="flex h-screen overflow-hidden"
        style={isAria ? { background: "#03070f" } : { background: "var(--background)" }}
      >
        {/* Desktop sidebar */}
        <Sidebar />

        {/* Main content area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <TopBar
            title={title}
            profile={profile}
            onSearchOpen={() => setSearchOpen(true)}
          />

          {/* Page content */}
          <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
            {children}
          </main>
        </div>

        {/* Mobile bottom navigation */}
        <BottomNav />

        {/* Global search dialog */}
        <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
      </div>
    </CurrencyProvider>
  );
}
