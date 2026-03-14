import { TrendUp, TrendDown, Minus } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

const VARIANT_STYLES: Record<string, { bg: string; text: string }> = {
  teal:   { bg: "bg-accent/10",   text: "text-accent" },
  navy:   { bg: "bg-primary/10",  text: "text-primary" },
  purple: { bg: "bg-purple-100 dark:bg-purple-500/10", text: "text-purple-600 dark:text-purple-400" },
  amber:  { bg: "bg-amber-100 dark:bg-amber-500/10",  text: "text-amber-600 dark:text-amber-400" },
  red:    { bg: "bg-red-100 dark:bg-red-500/10",    text: "text-red-600 dark:text-red-400" },
};

interface KpiCardProps {
  title: string;
  value: string;
  subtitle?: string;
  trendValue?: string;
  trendLabel?: string;
  icon?: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  className?: string;
  variant?: keyof typeof VARIANT_STYLES;
  accentColor?: string;
}

export function KpiCard({
  title,
  value,
  subtitle,
  trendValue,
  trendLabel,
  icon,
  trend,
  className,
  variant,
  accentColor,
}: KpiCardProps) {
  const variantStyle = variant ? VARIANT_STYLES[variant] : null;

  return (
    <div
      className={cn(
        "bg-card border rounded-xl p-5 sm:p-6 flex flex-col gap-3 shadow-sm",
        className
      )}
    >
      {/* Top row: title + icon */}
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{title}</p>
        {icon && (
          <div
            className={cn(
              "w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0",
              variantStyle?.bg
            )}
            style={!variantStyle && accentColor ? { backgroundColor: `${accentColor}20` } : undefined}
          >
            <div className={variantStyle?.text} style={!variantStyle && accentColor ? { color: accentColor } : undefined}>
              {icon}
            </div>
          </div>
        )}
      </div>

      {/* Value */}
      <p className="text-2xl sm:text-3xl font-bold text-foreground leading-none truncate">{value}</p>

      {/* Trend pill + comparison */}
      {(trendValue || subtitle || trend) && (
        <div className="flex items-center gap-2 flex-wrap">
          {trendValue && (
            <span className={cn(
              "inline-flex items-center gap-0.5 text-xs font-semibold px-1.5 py-0.5 rounded-md",
              trend === "up" && "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-500/10",
              trend === "down" && "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-500/10",
              (!trend || trend === "neutral") && "text-muted-foreground bg-muted"
            )}>
              {trend === "up" && <TrendUp className="w-3 h-3" weight="bold" />}
              {trend === "down" && <TrendDown className="w-3 h-3" weight="bold" />}
              {trend === "neutral" && <Minus className="w-3 h-3" weight="bold" />}
              {trendValue}
            </span>
          )}
          {(trendLabel || subtitle) && (
            <span className="text-xs text-muted-foreground">
              {trendLabel ?? subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
