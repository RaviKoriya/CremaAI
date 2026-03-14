"use client";

import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { KanbanColumn } from "./KanbanColumn";
import { LeadCard } from "./LeadCard";
import { LEAD_STATUSES } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";
import { useRealtimeLeads } from "@/lib/hooks/useRealtimeLeads";
import type { LeadWithContact } from "@/types/database";

interface KanbanBoardProps {
  initialLeads: LeadWithContact[];
  companyId: string;
}

export function KanbanBoard({ initialLeads, companyId }: KanbanBoardProps) {
  const { leads, setLeads } = useRealtimeLeads(
    initialLeads as unknown as import("@/types/database").Lead[],
    companyId
  );
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activePipelineOpen, setActivePipelineOpen] = useState(true);
  const [closingOpen, setClosingOpen] = useState(true);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 5 },
    })
  );

  const activeLead = leads.find((l) => l.id === activeId) as LeadWithContact | undefined;

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id) return;

    const lead = leads.find((l) => l.id === active.id);
    if (!lead) return;

    // If dropped on a column (over.id is a status string)
    const newStatus = LEAD_STATUSES.find((s) => s.value === over.id)?.value;
    if (!newStatus || newStatus === lead.status) return;

    // Optimistic update
    setLeads((prev) =>
      prev.map((l) =>
        l.id === active.id ? { ...l, status: newStatus } : l
      )
    );

    const supabase = createClient();
    const { error } = await supabase
      .from("leads")
      .update({ status: newStatus })
      .eq("id", String(active.id));

    if (error) {
      toast.error("Failed to update status");
      // Revert
      setLeads((prev) =>
        prev.map((l) =>
          l.id === active.id ? { ...l, status: lead.status } : l
        )
      );
    } else {
      toast.success(`Moved to ${newStatus}`);
    }
  }

  async function handleStatusChange(leadId: string, newStatus: string) {
    const lead = leads.find((l) => l.id === leadId);
    if (!lead) return;

    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l))
    );

    const supabase = createClient();
    const { error } = await supabase
      .from("leads")
      .update({ status: newStatus })
      .eq("id", leadId);

    if (error) {
      toast.error("Failed to update status");
    }
  }

  const leadsByStatus = LEAD_STATUSES.reduce(
    (acc, status) => {
      acc[status.value] = (leads as LeadWithContact[]).filter((l) => l.status === status.value);
      return acc;
    },
    {} as Record<string, LeadWithContact[]>
  );

  const activeStages = LEAD_STATUSES.filter((s) =>
    ["New", "Contacted", "Qualified", "Proposal Sent"].includes(s.value)
  );
  const closingStages = LEAD_STATUSES.filter((s) =>
    ["Negotiation", "Won", "Lost"].includes(s.value)
  );

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-3 px-4 sm:px-0">
        {/* Row 1: Active pipeline */}
        <div className="rounded-xl border bg-card overflow-hidden">
          <button
            onClick={() => setActivePipelineOpen((v) => !v)}
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/40 transition-colors"
          >
            <div className="flex items-center gap-2">
              {activePipelineOpen ? (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              )}
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Active Pipeline
              </span>
              <span className="text-xs bg-muted text-muted-foreground rounded-full px-1.5 py-0.5 font-medium">
                {activeStages.reduce((n, s) => n + (leadsByStatus[s.value]?.length ?? 0), 0)}
              </span>
            </div>
          </button>
          {activePipelineOpen && (
            <div className="px-4 pb-4 pt-1">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {activeStages.map((status) => (
                  <KanbanColumn
                    key={status.value}
                    status={status.value}
                    label={status.label}
                    color={status.dotColor.replace("bg-", "#").replace("-500", "")}
                    leads={leadsByStatus[status.value] ?? []}
                    onStatusChange={handleStatusChange}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Row 2: Closing stages */}
        <div className="rounded-xl border bg-card overflow-hidden">
          <button
            onClick={() => setClosingOpen((v) => !v)}
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/40 transition-colors"
          >
            <div className="flex items-center gap-2">
              {closingOpen ? (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              )}
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Closing
              </span>
              <span className="text-xs bg-muted text-muted-foreground rounded-full px-1.5 py-0.5 font-medium">
                {closingStages.reduce((n, s) => n + (leadsByStatus[s.value]?.length ?? 0), 0)}
              </span>
            </div>
          </button>
          {closingOpen && (
            <div className="px-4 pb-4 pt-1">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {closingStages.map((status) => (
                  <KanbanColumn
                    key={status.value}
                    status={status.value}
                    label={status.label}
                    color={status.dotColor.replace("bg-", "#").replace("-500", "")}
                    leads={leadsByStatus[status.value] ?? []}
                    onStatusChange={handleStatusChange}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <DragOverlay>
        {activeLead ? (
          <div className="opacity-90 rotate-2">
            <LeadCard lead={activeLead} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
