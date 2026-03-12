"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
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

const STATUS_COLORS: Record<string, string> = {
  "New": "#94A3B8",
  "Contacted": "#3B82F6",
  "Qualified": "#00C9A7",
  "Proposal Sent": "#8B5CF6",
  "Negotiation": "#F97316",
  "Won": "#22C55E",
  "Lost": "#EF4444",
};

export function FunnelChart({ data, currency = "USD" }: FunnelChartProps) {
  // Merge with all statuses (fill zeros for missing)
  const chartData = LEAD_STATUSES.map((status) => {
    const found = data.find((d) => d.status === status.value);
    return {
      status: status.label,
      leads: found?.lead_count ?? 0,
      value: found?.total_value ?? 0,
    };
  });

  return (
    <div className="w-full h-48">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="status"
            tick={{ fontSize: 9 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
          <Tooltip
            formatter={(value, name) => [
              name === "leads" ? Number(value) : formatCurrency(Number(value), currency),
              name === "leads" ? "Leads" : "Value",
            ]}
            contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #e2e8f0" }}
          />
          <Bar dataKey="leads" radius={[4, 4, 0, 0]}>
            {chartData.map((entry) => (
              <Cell
                key={entry.status}
                fill={STATUS_COLORS[entry.status] ?? "#94A3B8"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
