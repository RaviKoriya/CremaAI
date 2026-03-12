import { cn } from "@/lib/utils";

interface KpiCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  className?: string;
  accentColor?: string;
}

export function KpiCard({ title, value, subtitle, icon, trend, className, accentColor }: KpiCardProps) {
  return (
    <div
      className={cn(
        "bg-white border rounded-xl p-4 sm:p-5 flex items-start justify-between gap-3",
        className
      )}
    >
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{title}</p>
        <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1 truncate">{value}</p>
        {subtitle && (
          <p
            className={cn(
              "text-xs mt-1",
              trend === "up" && "text-green-600",
              trend === "down" && "text-red-600",
              trend === "neutral" && "text-muted-foreground",
              !trend && "text-muted-foreground"
            )}
          >
            {subtitle}
          </p>
        )}
      </div>
      {icon && (
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: accentColor ? `${accentColor}20` : "#0F1E3C20" }}
        >
          <div style={{ color: accentColor ?? "#0F1E3C" }}>{icon}</div>
        </div>
      )}
    </div>
  );
}
