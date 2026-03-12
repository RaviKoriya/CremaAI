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
      <div className="flex items-center justify-between px-4 sm:px-6 py-4 gap-3 border-b bg-white">
        <div>
          <h1 className="font-bold text-lg text-gray-900">Leads</h1>
          <p className="text-xs text-muted-foreground">{initialLeads.length} total leads</p>
        </div>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="hidden sm:flex rounded-lg border p-0.5 bg-gray-50">
            <button
              onClick={() => setView("kanban")}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${
                view === "kanban" ? "bg-white shadow-sm text-gray-900" : "text-muted-foreground hover:text-gray-700"
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              Board
            </button>
            <button
              onClick={() => setView("list")}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${
                view === "list" ? "bg-white shadow-sm text-gray-900" : "text-muted-foreground hover:text-gray-700"
              }`}
            >
              <List className="w-4 h-4" />
              List
            </button>
          </div>

          <Button
            onClick={() => setDrawerOpen(true)}
            className="bg-[#0F1E3C] hover:bg-[#1a2f5e] text-white h-9 gap-1.5"
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
        className="md:hidden fixed bottom-20 right-4 z-40 w-14 h-14 rounded-full bg-[#0F1E3C] text-white shadow-lg flex items-center justify-center hover:bg-[#1a2f5e] active:scale-95 transition-transform"
        aria-label="New lead"
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
}
