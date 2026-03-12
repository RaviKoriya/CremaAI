"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { LeadCard } from "./LeadCard";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { LeadWithContact } from "@/types/database";

interface KanbanColumnProps {
  status: string;
  label: string;
  color: string;
  leads: LeadWithContact[];
  onStatusChange?: (leadId: string, status: string) => void;
}

export function KanbanColumn({ status, label, color, leads, onStatusChange }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  const totalValue = leads.reduce((sum, l) => sum + (l.value || 0), 0);
  const currency = leads[0]?.currency ?? "USD";

  return (
    <div
      className="kanban-column-snap flex-shrink-0 w-[280px] sm:w-[300px]"
    >
      {/* Column header */}
      <div className="flex items-center justify-between px-1 mb-3">
        <div className="flex items-center gap-2">
          <div
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: color }}
          />
          <span className="font-semibold text-sm text-gray-800">{label}</span>
          <span className="text-xs bg-gray-100 text-gray-500 rounded-full px-1.5 py-0.5 font-medium">
            {leads.length}
          </span>
        </div>
        {leads.length > 0 && (
          <span className="text-xs text-muted-foreground font-medium">
            {formatCurrency(totalValue, currency)}
          </span>
        )}
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className={cn(
          "min-h-[200px] space-y-2 rounded-xl p-2 transition-colors",
          isOver ? "bg-blue-50 border-2 border-dashed border-blue-300" : "bg-gray-50/80"
        )}
      >
        <SortableContext
          items={leads.map((l) => l.id)}
          strategy={verticalListSortingStrategy}
        >
          {leads.map((lead) => (
            <LeadCard
              key={lead.id}
              lead={lead}
              onStatusChange={onStatusChange}
            />
          ))}
        </SortableContext>

        {leads.length === 0 && (
          <div className="flex items-center justify-center h-24 text-xs text-muted-foreground">
            Drop leads here
          </div>
        )}
      </div>
    </div>
  );
}
