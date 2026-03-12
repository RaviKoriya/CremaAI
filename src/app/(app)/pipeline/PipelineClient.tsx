"use client";

import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { formatCurrency, getDaysAgo } from "@/lib/utils";
import { LEAD_STATUSES } from "@/lib/constants";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PriorityBadge } from "@/components/shared/PriorityBadge";

interface FunnelStage {
  status: string;
  lead_count: number;
  total_value: number;
}

interface Lead {
  id: string;
  title: string;
  value: number;
  currency: string;
  status: string;
  priority: string;
  created_at: string;
  expected_close_date: string | null;
  contacts: { full_name: string } | null;
}

interface PipelineClientProps {
  funnel: FunnelStage[];
  leads: Lead[];
}

const STATUS_COLORS: Record<string, string> = {
  New: "#94A3B8",
  Contacted: "#3B82F6",
  Qualified: "#00C9A7",
  "Proposal Sent": "#8B5CF6",
  Negotiation: "#F97316",
  Won: "#22C55E",
  Lost: "#EF4444",
};

function getConversionRate(current: number, previous: number): string {
  if (previous === 0) return "—";
  return `${Math.round((current / previous) * 100)}%`;
}

export function PipelineClient({ funnel, leads }: PipelineClientProps) {
  const chartData = LEAD_STATUSES.map((status) => {
    const found = funnel.find((f) => f.status === status.value);
    return {
      status: status.label,
      leads: found?.lead_count ?? 0,
      value: found?.total_value ?? 0,
    };
  });

  const totalLeads = funnel.reduce((sum, s) => sum + s.lead_count, 0);
  const totalValue = funnel.reduce((sum, s) => sum + s.total_value, 0);

  // Group leads by status
  const leadsByStatus = LEAD_STATUSES.reduce<Record<string, Lead[]>>((acc, status) => {
    acc[status.value] = leads.filter((l) => l.status === status.value);
    return acc;
  }, {});

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Pipeline</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {totalLeads} total leads · {formatCurrency(totalValue, "USD")} pipeline value
        </p>
      </div>

      {/* Funnel Chart */}
      <div className="bg-white border rounded-xl p-4">
        <h2 className="font-semibold text-sm mb-4">Lead Distribution by Stage</h2>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="status" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
              <Tooltip
                formatter={(value, name) => [
                  name === "leads" ? Number(value) : formatCurrency(Number(value), "USD"),
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
      </div>

      {/* Stage Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2">
        {LEAD_STATUSES.map((status, index) => {
          const stage = funnel.find((f) => f.status === status.value);
          const count = stage?.lead_count ?? 0;
          const value = stage?.total_value ?? 0;
          const prevStatus = index > 0 ? LEAD_STATUSES[index - 1] : null;
          const prevCount = prevStatus
            ? (funnel.find((f) => f.status === prevStatus.value)?.lead_count ?? 0)
            : null;

          return (
            <div key={status.value} className="bg-white border rounded-xl p-3 text-center">
              <div
                className="w-3 h-3 rounded-full mx-auto mb-2"
                style={{ backgroundColor: STATUS_COLORS[status.value] ?? "#94A3B8" }}
              />
              <p className="text-xs text-muted-foreground truncate">{status.label}</p>
              <p className="text-lg font-bold text-gray-900">{count}</p>
              <p className="text-xs text-muted-foreground">{formatCurrency(value, "USD")}</p>
              {prevCount !== null && (
                <p className="text-xs text-muted-foreground mt-1">
                  Conv: {getConversionRate(count, prevCount)}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Leads by Stage */}
      <div className="space-y-4">
        {LEAD_STATUSES.filter((s) => s.value !== "Won" && s.value !== "Lost").map((status) => {
          const stageLeads = leadsByStatus[status.value] ?? [];
          if (stageLeads.length === 0) return null;

          return (
            <div key={status.value} className="bg-white border rounded-xl overflow-hidden">
              <div
                className="px-4 py-3 flex items-center justify-between"
                style={{ borderLeft: `4px solid ${STATUS_COLORS[status.value] ?? "#94A3B8"}` }}
              >
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">{status.label}</span>
                  <span className="text-xs text-muted-foreground">({stageLeads.length})</span>
                </div>
                <span className="text-xs font-medium text-muted-foreground">
                  {formatCurrency(
                    stageLeads.reduce((sum, l) => sum + l.value, 0),
                    stageLeads[0]?.currency ?? "USD"
                  )}
                </span>
              </div>
              <div className="divide-y">
                {stageLeads.map((lead) => {
                  const daysInStage = getDaysAgo(lead.created_at);
                  return (
                    <Link key={lead.id} href={`/leads/${lead.id}`}>
                      <div className="px-4 py-3 flex items-center justify-between hover:bg-gray-50 gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{lead.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {lead.contacts?.full_name ?? "No contact"} · {daysInStage}d in stage
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-sm font-bold text-[#0F1E3C]">
                            {formatCurrency(lead.value, lead.currency)}
                          </span>
                          <PriorityBadge priority={lead.priority} />
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Won & Lost Summary */}
      <div className="grid grid-cols-2 gap-4">
        {["Won", "Lost"].map((statusKey) => {
          const stageLeads = leadsByStatus[statusKey] ?? [];
          return (
            <div key={statusKey} className="bg-white border rounded-xl p-4">
              <h3
                className="font-semibold text-sm mb-3"
                style={{ color: STATUS_COLORS[statusKey] }}
              >
                {statusKey} ({stageLeads.length})
              </h3>
              {stageLeads.length === 0 ? (
                <p className="text-xs text-muted-foreground">None yet</p>
              ) : (
                <div className="space-y-2">
                  {stageLeads.slice(0, 5).map((lead) => (
                    <Link key={lead.id} href={`/leads/${lead.id}`}>
                      <div className="flex justify-between items-center text-sm hover:text-[#00C9A7]">
                        <span className="truncate">{lead.title}</span>
                        <span className="font-medium ml-2 flex-shrink-0">
                          {formatCurrency(lead.value, lead.currency)}
                        </span>
                      </div>
                    </Link>
                  ))}
                  {stageLeads.length > 5 && (
                    <p className="text-xs text-muted-foreground">+{stageLeads.length - 5} more</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
