"use client";

import { getDaysAgo } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface LeadAgingBadgeProps {
  createdAt: string;
  className?: string;
}

export function LeadAgingBadge({ createdAt, className }: LeadAgingBadgeProps) {
  const days = getDaysAgo(createdAt);

  if (days < 7) return null; // No badge for fresh leads

  const isWarning = days < 30;
  const isCritical = days >= 30;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-xs font-medium px-1.5 py-0.5 rounded",
        isWarning && "text-amber-700 bg-amber-50",
        isCritical && "text-red-700 bg-red-50",
        className
      )}
      title={`${days} days old`}
    >
      <span
        className={cn(
          "w-1.5 h-1.5 rounded-full",
          isWarning && "bg-amber-400",
          isCritical && "bg-red-500 animate-pulse"
        )}
      />
      {days}d
    </span>
  );
}
