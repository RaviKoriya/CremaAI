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

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {/* Horizontal scroll container — snaps on mobile */}
      <div className="flex gap-4 overflow-x-auto pb-4 kanban-mobile-scroll px-4 sm:px-0 snap-x snap-mandatory">
        {LEAD_STATUSES.map((status) => (
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
