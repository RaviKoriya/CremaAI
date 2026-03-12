import { cn } from "@/lib/utils";
import { PRIORITIES } from "@/lib/constants";

interface PriorityBadgeProps {
  priority: string;
  className?: string;
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const match = PRIORITIES.find((p) => p.value === priority);
  const colorClass = match?.badgeColor ?? "bg-gray-100 text-gray-600";

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium",
        colorClass,
        className
      )}
    >
      {priority}
    </span>
  );
}
