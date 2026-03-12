import { cn } from "@/lib/utils";
import { LEAD_STATUSES, INVOICE_STATUSES } from "@/lib/constants";

interface StatusBadgeProps {
  status: string;
  type?: "lead" | "invoice";
  className?: string;
}

export function StatusBadge({ status, type = "lead", className }: StatusBadgeProps) {
  const statuses = type === "lead" ? LEAD_STATUSES : INVOICE_STATUSES;
  const match = statuses.find((s) => s.value === status);
  const colorClass = match?.color ?? "bg-gray-100 text-gray-600";

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap",
        colorClass,
        className
      )}
    >
      {status}
    </span>
  );
}
