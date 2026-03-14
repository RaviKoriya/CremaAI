"use client";

import { useState } from "react";
import { Plus, LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { KanbanBoard } from "@/components/leads/KanbanBoard";
import { LeadList } from "@/components/leads/LeadList";
import { LeadDrawer } from "@/components/leads/LeadDrawer";
import type { LeadWithContact, Profile } from "@/types/database";

interface LeadsPageClientProps {
  initialLeads: LeadWithContact[];
  companyId: string;
  teamMembers: Pick<Profile, "id" | "name">[];
  userRole: string;
}

export function LeadsPageClient({
  initialLeads,
  companyId,
  userRole,
}: LeadsPageClientProps) {
  const [view, setView] = useState<"kanban" | "list">("kanban");
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="h-full flex flex-col">
      {/* Page header */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-4 gap-3 border-b bg-card">
        <div>
          <h1 className="font-bold text-lg text-foreground">Leads</h1>
          <p className="text-xs text-muted-foreground">{initialLeads.length} total leads</p>
        </div>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="hidden sm:flex rounded-lg border p-0.5 bg-muted/50">
            <button
              onClick={() => setView("kanban")}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${
                view === "kanban" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              Board
            </button>
            <button
              onClick={() => setView("list")}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${
                view === "list" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <List className="w-4 h-4" />
              List
            </button>
          </div>

          <Button
            onClick={() => setDrawerOpen(true)}
            className="bg-primary hover:bg-primary/80 text-white h-9 gap-1.5"
            size="sm"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Lead</span>
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto py-4 sm:px-6">
        {view === "kanban" ? (
          <KanbanBoard initialLeads={initialLeads} companyId={companyId} />
        ) : (
          <div className="px-4 sm:px-0">
            <LeadList leads={initialLeads} onNewLead={() => setDrawerOpen(true)} />
          </div>
        )}
      </div>

      {/* New lead drawer */}
      <LeadDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        companyId={companyId}
      />

      {/* Floating action button (mobile) */}
      <button
        onClick={() => setDrawerOpen(true)}
        className="md:hidden fixed bottom-20 right-4 z-40 w-14 h-14 rounded-full bg-primary text-white shadow-lg flex items-center justify-center hover:bg-primary/80 active:scale-95 transition-transform"
        aria-label="New lead"
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
}
