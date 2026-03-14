"use client";

import { useRouter, usePathname } from "next/navigation";
import { MagnifyingGlass, Bell, SignOut } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createClient } from "@/lib/supabase/client";
import { getInitials } from "@/lib/utils";
import type { Profile } from "@/types/database";

interface TopBarProps {
  title: string;
  profile?: Profile | null;
  onSearchOpen?: () => void;
}

export function TopBar({ title, profile, onSearchOpen }: TopBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const isAria = pathname === "/ai";

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  if (isAria) {
    return (
      <header
        className="sticky top-0 z-30 backdrop-blur-sm h-14 flex items-center px-4 sm:px-6 gap-3"
        style={{
          background: "rgba(3,7,15,0.85)",
          borderBottom: "1px solid rgba(36,99,255,0.12)",
        }}
      >
        {/* Page title */}
        <h1
          className="font-bold flex-1 text-base sm:text-lg tracking-widest uppercase"
          style={{
            background: "linear-gradient(135deg, #93c5fd, #ffffff 50%, #93c5fd)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          ARIA
        </h1>

        {/* Status indicator */}
        <div
          className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
          style={{
            background: "rgba(36,99,255,0.08)",
            border: "1px solid rgba(36,99,255,0.15)",
            color: "#34d399",
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          AI Online
        </div>

        {/* Notifications */}
        <button
          className="relative w-9 h-9 rounded-xl flex items-center justify-center transition-all"
          style={{ color: "rgba(147,197,253,0.5)", border: "1px solid rgba(36,99,255,0.12)" }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = "rgba(147,197,253,0.9)";
            (e.currentTarget as HTMLButtonElement).style.background = "rgba(36,99,255,0.1)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = "rgba(147,197,253,0.5)";
            (e.currentTarget as HTMLButtonElement).style.background = "transparent";
          }}
        >
          <Bell className="w-4 h-4" />
        </button>

        {/* Avatar dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger className="h-9 w-9 rounded-full flex items-center justify-center cursor-pointer focus:outline-none"
            style={{ border: "1px solid rgba(36,99,255,0.25)", boxShadow: "0 0 10px rgba(36,99,255,0.15)" }}
          >
            <Avatar className="w-8 h-8">
              <AvatarImage src={profile?.avatar_url ?? undefined} />
              <AvatarFallback
                className="text-xs font-bold"
                style={{ background: "linear-gradient(135deg, #3b82f6, #2463FF)", color: "white" }}
              >
                {profile?.name ? getInitials(profile.name) : "?"}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>
              <div className="font-medium">{profile?.name}</div>
              <div className="text-xs text-muted-foreground font-normal">{profile?.email}</div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/settings/company")}>
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive">
              <SignOut className="w-4 h-4 mr-2" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b h-14 flex items-center px-4 sm:px-6 gap-3">
      {/* Page title */}
      <h1 className="font-semibold text-foreground flex-1 text-base sm:text-lg">{title}</h1>

      {/* Search trigger */}
      <Button
        variant="outline"
        size="sm"
        className="hidden sm:flex items-center gap-2 text-muted-foreground w-48"
        onClick={onSearchOpen}
      >
        <MagnifyingGlass className="w-4 h-4" />
        <span className="text-sm">Search...</span>
        <kbd className="ml-auto text-xs bg-muted px-1.5 py-0.5 rounded">⌘K</kbd>
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="sm:hidden"
        onClick={onSearchOpen}
      >
        <MagnifyingGlass className="w-5 h-5" />
      </Button>

      {/* Notifications */}
      <Button variant="ghost" size="icon" className="relative">
        <Bell className="w-5 h-5" />
      </Button>

      {/* Theme toggle */}
      <ThemeToggle />

      {/* Avatar dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger className="h-9 w-9 rounded-full flex items-center justify-center bg-transparent border-0 cursor-pointer hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <Avatar className="w-8 h-8">
            <AvatarImage src={profile?.avatar_url ?? undefined} />
            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
              {profile?.name ? getInitials(profile.name) : "?"}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>
            <div className="font-medium">{profile?.name}</div>
            <div className="text-xs text-muted-foreground font-normal">{profile?.email}</div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => router.push("/settings/company")}>
            Settings
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} className="text-destructive">
            <SignOut className="w-4 h-4 mr-2" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
