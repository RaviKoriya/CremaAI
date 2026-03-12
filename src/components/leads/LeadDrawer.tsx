"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { LeadForm } from "./LeadForm";
import type { Lead } from "@/types/database";

interface LeadDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead?: Lead | null;
  companyId: string;
  onSuccess?: (lead: Lead) => void;
}

export function LeadDrawer({
  open,
  onOpenChange,
  lead,
  companyId,
  onSuccess,
}: LeadDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{lead ? "Edit Lead" : "New Lead"}</SheetTitle>
        </SheetHeader>
        <div className="mt-4">
          <LeadForm
            lead={lead}
            companyId={companyId}
            onSuccess={(l) => {
              onSuccess?.(l);
              onOpenChange(false);
            }}
            onCancel={() => onOpenChange(false)}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
