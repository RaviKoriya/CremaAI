"use client";

import { useState } from "react";
import { toast } from "sonner";
import { GripVertical, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LEAD_STATUSES } from "@/lib/constants";

// Pipeline stages are currently fixed from constants.
// This page shows the current stages and explains the structure.
// In a future iteration, stages can be stored in the companies table as JSONB.

interface Stage {
  id: string;
  label: string;
  color: string;
  isDefault: boolean;
}

const DEFAULT_STAGES: Stage[] = LEAD_STATUSES.map((s) => ({
  id: s.value,
  label: s.label,
  color: s.color,
  isDefault: true,
}));

export default function PipelineStagesPage() {
  const [stages] = useState<Stage[]>(DEFAULT_STAGES);

  return (
    <div className="space-y-6">
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
        Pipeline stages are currently configured via your database schema. Custom stage ordering
        and renaming will be available in a future update.
      </div>

      <div className="bg-white border rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b">
          <h2 className="font-semibold text-sm">Current Pipeline Stages</h2>
        </div>
        <div className="divide-y">
          {stages.map((stage, i) => (
            <div key={stage.id} className="flex items-center gap-3 px-5 py-3">
              <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab opacity-50" />
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: stage.color }}
              />
              <span className="text-sm flex-1">{stage.label}</span>
              <span className="text-xs text-muted-foreground">Stage {i + 1}</span>
            </div>
          ))}
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Default stages: New → Contacted → Qualified → Proposal Sent → Negotiation → Won / Lost
      </p>
    </div>
  );
}
