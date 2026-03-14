"use client";

import { formatCurrency } from "@/lib/utils";
import { LEAD_STATUSES } from "@/lib/constants";

interface FunnelData {
  status: string;
  lead_count: number;
  total_value: number;
}

interface FunnelChartProps {
  data: FunnelData[];
  currency?: string;
}

const STATUS_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  "New":           { color: "#94A3B8", bg: "rgba(148,163,184,0.12)", label: "New" },
  "Contacted":     { color: "#3B82F6", bg: "rgba(59,130,246,0.12)",  label: "Contacted" },
  "Qualified":     { color: "#2463FF", bg: "rgba(36,99,255,0.12)",   label: "Qualified" },
  "Proposal Sent": { color: "#8B5CF6", bg: "rgba(139,92,246,0.12)",  label: "Proposal" },
  "Negotiation":   { color: "#F97316", bg: "rgba(249,115,22,0.12)",  label: "Negotiation" },
  "Won":           { color: "#22C55E", bg: "rgba(34,197,94,0.12)",   label: "Won" },
  "Lost":          { color: "#EF4444", bg: "rgba(239,68,68,0.12)",   label: "Lost" },
};

export function FunnelChart({ data, currency = "USD" }: FunnelChartProps) {
  const chartData = LEAD_STATUSES.map((status) => {
    const found = data.find((d) => d.status === status.value);
    return {
      status: status.value,
      leads: found?.lead_count ?? 0,
      value: found?.total_value ?? 0,
    };
  });

  const totalLeads = chartData.reduce((s, d) => s + d.leads, 0);
  const maxLeads = Math.max(...chartData.map((d) => d.leads), 1);

  if (totalLeads === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-40 gap-2 text-muted-foreground">
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M3 6h18M7 12h10M10 18h4" strokeLinecap="round" />
          </svg>
        </div>
        <p className="text-sm">No leads in pipeline yet</p>
      </div>
    );
  }

  // Active stages only (exclude empty Lost/Won for cleaner view, but show Won/Lost if they have leads)
  const visibleStages = chartData.filter((d, i) => {
    const isClosing = ["Won", "Lost"].includes(d.status);
    return !isClosing || d.leads > 0;
  });

  return (
    <div className="space-y-2">
      {visibleStages.map((stage, i) => {
        const cfg = STATUS_CONFIG[stage.status] ?? STATUS_CONFIG["New"];
        const widthPct = maxLeads > 0 ? (stage.leads / maxLeads) * 100 : 0;

        // Conversion from previous active stage
        const prev = visibleStages[i - 1];
        const convRate =
          i > 0 && prev && prev.leads > 0 && stage.leads > 0
            ? Math.round((stage.leads / prev.leads) * 100)
            : null;

        return (
          <div key={stage.status}>
            {/* Conversion indicator between stages */}
            {convRate !== null && (
              <div className="flex items-center gap-1.5 py-0.5 pl-[72px]">
                <svg width="8" height="10" viewBox="0 0 8 10" fill="none">
                  <path d="M4 0v8M1 6l3 4 3-4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground/40" />
                </svg>
                <span className="text-[10px] font-medium text-muted-foreground/60">
                  {convRate}% converted
                </span>
              </div>
            )}

            <div className="flex items-center gap-3 group">
              {/* Stage label */}
              <div className="w-[68px] flex-shrink-0 text-right">
                <span className="text-[11px] font-medium text-muted-foreground leading-none">
                  {cfg.label}
                </span>
              </div>

              {/* Bar track */}
              <div className="flex-1 relative h-7">
                {/* Track background */}
                <div className="absolute inset-0 rounded-full bg-muted/40" />

                {/* Filled bar */}
                <div
                  className="absolute left-0 top-0 h-full rounded-full transition-all duration-500 ease-out flex items-center"
                  style={{
                    width: stage.leads > 0 ? `max(${widthPct}%, 32px)` : "0%",
                    backgroundColor: cfg.color,
                    opacity: stage.leads > 0 ? 1 : 0,
                  }}
                >
                  {stage.leads > 0 && (
                    <span className="pl-3 text-[11px] font-bold text-white leading-none select-none">
                      {stage.leads}
                    </span>
                  )}
                </div>

                {/* Zero state */}
                {stage.leads === 0 && (
                  <div className="absolute inset-0 flex items-center pl-3">
                    <span className="text-[10px] text-muted-foreground/40 leading-none">—</span>
                  </div>
                )}
              </div>

              {/* Value */}
              <div className="w-20 flex-shrink-0 text-right">
                {stage.leads > 0 ? (
                  <span className="text-[11px] font-semibold text-foreground leading-none">
                    {formatCurrency(stage.value, currency)}
                  </span>
                ) : (
                  <span className="text-[10px] text-muted-foreground/40">—</span>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {/* Summary footer */}
      <div className="flex items-center justify-between pt-3 mt-1 border-t">
        <div className="flex items-center gap-1.5 pl-[80px]">
          {visibleStages.filter(s => s.leads > 0).map((stage) => (
            <div
              key={stage.status}
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: STATUS_CONFIG[stage.status]?.color ?? "#94A3B8" }}
              title={stage.status}
            />
          ))}
          <span className="text-[11px] text-muted-foreground ml-1">{totalLeads} total leads</span>
        </div>
        <span className="text-[11px] text-muted-foreground">
          {formatCurrency(chartData.reduce((s, d) => s + d.value, 0), currency)} pipeline
        </span>
      </div>
    </div>
  );
}
