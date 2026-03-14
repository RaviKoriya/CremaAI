"use client";

import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { formatCurrency, getDaysAgo } from "@/lib/utils";
import { LEAD_STATUSES } from "@/lib/constants";
import { useCurrency } from "@/contexts/CurrencyContext";
import { PriorityBadge } from "@/components/shared/PriorityBadge";
import { TrendingUp, Trophy, XCircle, ArrowRight, Calendar } from "lucide-react";

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
  Qualified: "#2463FF",
  "Proposal Sent": "#8B5CF6",
  Negotiation: "#F97316",
  Won: "#22C55E",
  Lost: "#EF4444",
};

const ACTIVE_STAGES = ["New", "Contacted", "Qualified", "Proposal Sent", "Negotiation"];

export function PipelineClient({ funnel, leads }: PipelineClientProps) {
  const { currency } = useCurrency();

  const totalLeads = funnel.reduce((sum, s) => sum + s.lead_count, 0);
  const totalValue = funnel.reduce((sum, s) => sum + s.total_value, 0);
  const activeValue = funnel
    .filter((s) => ACTIVE_STAGES.includes(s.status))
    .reduce((sum, s) => sum + s.total_value, 0);
  const wonLeads = funnel.find((s) => s.status === "Won");
  const lostLeads = funnel.find((s) => s.status === "Lost");
  const closedTotal = (wonLeads?.lead_count ?? 0) + (lostLeads?.lead_count ?? 0);
  const winRate = closedTotal > 0 ? Math.round(((wonLeads?.lead_count ?? 0) / closedTotal) * 100) : null;

  const leadsByStatus = LEAD_STATUSES.reduce<Record<string, Lead[]>>((acc, status) => {
    acc[status.value] = leads.filter((l) => l.status === status.value);
    return acc;
  }, {});

  const activeLeads = ACTIVE_STAGES.flatMap((s) => leadsByStatus[s] ?? []);

  // For pipeline bar chart (compact)
  const chartData = LEAD_STATUSES.map((status) => {
    const found = funnel.find((f) => f.status === status.value);
    return {
      status: status.label.replace(" ", "\n"),
      leads: found?.lead_count ?? 0,
    };
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pipeline</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {totalLeads} total leads · {formatCurrency(totalValue, currency)} pipeline value
          </p>
        </div>
        <Link
          href="/leads"
          className="flex items-center gap-1.5 text-sm font-medium text-accent hover:text-accent/80 transition-colors flex-shrink-0 mt-1"
        >
          View in Board <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* ── KPI Strip ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: "Active Pipeline",
            value: formatCurrency(activeValue, currency),
            sub: `${activeLeads.length} active deals`,
            icon: TrendingUp,
            color: "text-blue-600",
            bg: "bg-blue-50 dark:bg-blue-950/40",
          },
          {
            label: "Won This Month",
            value: formatCurrency(wonLeads?.total_value ?? 0, currency),
            sub: `${wonLeads?.lead_count ?? 0} deals closed`,
            icon: Trophy,
            color: "text-green-600",
            bg: "bg-green-50 dark:bg-green-950/40",
          },
          {
            label: "Win Rate",
            value: winRate !== null ? `${winRate}%` : "—",
            sub: `${closedTotal} closed total`,
            icon: TrendingUp,
            color: "text-accent",
            bg: "bg-accent/10",
          },
          {
            label: "Avg Deal Size",
            value: activeLeads.length > 0
              ? formatCurrency(activeValue / activeLeads.length, currency)
              : "—",
            sub: "active deals",
            icon: TrendingUp,
            color: "text-purple-600",
            bg: "bg-purple-50 dark:bg-purple-950/40",
          },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-card border rounded-2xl p-4">
            <div className={`w-8 h-8 rounded-lg ${kpi.bg} flex items-center justify-center mb-3`}>
              <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
            </div>
            <p className="text-xs text-muted-foreground font-medium">{kpi.label}</p>
            <p className="text-xl font-bold text-foreground mt-0.5">{kpi.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* ── Pipeline Progress Bar ── */}
      <div className="bg-card border rounded-2xl p-5">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          Lead Distribution
        </p>
        {totalLeads > 0 ? (
          <>
            {/* Stacked bar */}
            <div className="flex h-3 rounded-full overflow-hidden gap-0.5 mb-5">
              {LEAD_STATUSES.map((status) => {
                const count = funnel.find((f) => f.status === status.value)?.lead_count ?? 0;
                const pct = totalLeads > 0 ? (count / totalLeads) * 100 : 0;
                if (pct === 0) return null;
                return (
                  <div
                    key={status.value}
                    style={{ width: `${pct}%`, backgroundColor: STATUS_COLORS[status.value] }}
                    className="transition-all"
                    title={`${status.label}: ${count}`}
                  />
                );
              })}
            </div>
            {/* Stage pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
              {LEAD_STATUSES.map((status) => {
                const stage = funnel.find((f) => f.status === status.value);
                const count = stage?.lead_count ?? 0;
                const value = stage?.total_value ?? 0;
                return (
                  <div key={status.value} className="text-center">
                    <div className="flex items-center justify-center gap-1.5 mb-1">
                      <div
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: STATUS_COLORS[status.value] }}
                      />
                      <span className="text-xs text-muted-foreground truncate">{status.label}</span>
                    </div>
                    <p className="text-base font-bold text-foreground">{count}</p>
                    <p className="text-[11px] text-muted-foreground">{formatCurrency(value, currency)}</p>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="h-20 flex items-center justify-center text-sm text-muted-foreground">
            No leads in pipeline yet
          </div>
        )}
      </div>

      {/* ── Main Content: Two-column ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* LEFT: Active leads by stage */}
        <div className="lg:col-span-2 space-y-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-0.5">
            Active Pipeline
          </p>
          {ACTIVE_STAGES.map((statusKey) => {
            const stageLeads = leadsByStatus[statusKey] ?? [];
            if (stageLeads.length === 0) return null;
            const stageTotal = stageLeads.reduce((s, l) => s + l.value, 0);
            return (
              <div key={statusKey} className="bg-card border rounded-2xl overflow-hidden">
                {/* Stage header */}
                <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: STATUS_COLORS[statusKey] }}
                    />
                    <span className="font-semibold text-sm text-foreground">{statusKey}</span>
                    <span className="text-xs bg-muted text-muted-foreground rounded-full px-1.5 py-0.5 font-medium">
                      {stageLeads.length}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-muted-foreground">
                    {formatCurrency(stageTotal, currency)}
                  </span>
                </div>
                {/* Lead rows */}
                <div className="divide-y">
                  {stageLeads.map((lead) => {
                    const days = getDaysAgo(lead.created_at);
                    const isOverdue =
                      lead.expected_close_date && new Date(lead.expected_close_date) < new Date();
                    return (
                      <Link key={lead.id} href={`/leads/${lead.id}`}>
                        <div className="flex items-center justify-between px-4 py-3 hover:bg-muted/40 transition-colors gap-3">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-foreground truncate">{lead.title}</p>
                            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                              <span className="text-xs text-muted-foreground">
                                {lead.contacts?.full_name ?? "No contact"}
                              </span>
                              <span className="text-xs text-muted-foreground">·</span>
                              <span className="text-xs text-muted-foreground">{days}d in stage</span>
                              {lead.expected_close_date && (
                                <>
                                  <span className="text-xs text-muted-foreground">·</span>
                                  <span className={`text-xs flex items-center gap-0.5 ${isOverdue ? "text-red-500 font-medium" : "text-muted-foreground"}`}>
                                    <Calendar className="w-3 h-3" />
                                    {new Date(lead.expected_close_date).toLocaleDateString("en", { month: "short", day: "numeric" })}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2.5 flex-shrink-0">
                            <span className="text-sm font-bold text-foreground">
                              {formatCurrency(lead.value, currency)}
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

          {activeLeads.length === 0 && (
            <div className="bg-card border rounded-2xl p-10 text-center">
              <p className="text-sm text-muted-foreground">No active leads in pipeline</p>
              <Link href="/leads" className="text-sm text-accent hover:underline mt-1 inline-block">
                Add your first lead →
              </Link>
            </div>
          )}
        </div>

        {/* RIGHT: Outcomes + Chart */}
        <div className="space-y-4">

          {/* Won */}
          <div className="bg-card border rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b bg-green-50/60 dark:bg-green-950/20">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-green-600" />
                <span className="font-semibold text-sm text-green-700 dark:text-green-400">Won</span>
                <span className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full px-1.5 py-0.5 font-medium">
                  {wonLeads?.lead_count ?? 0}
                </span>
              </div>
              <span className="text-xs font-semibold text-green-700 dark:text-green-400">
                {formatCurrency(wonLeads?.total_value ?? 0, currency)}
              </span>
            </div>
            <div className="p-4">
              {(leadsByStatus["Won"] ?? []).length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-3">No won deals yet</p>
              ) : (
                <div className="space-y-2">
                  {(leadsByStatus["Won"] ?? []).slice(0, 5).map((lead) => (
                    <Link key={lead.id} href={`/leads/${lead.id}`}>
                      <div className="flex items-center justify-between text-sm hover:text-accent transition-colors py-1">
                        <span className="truncate text-foreground">{lead.title}</span>
                        <span className="font-semibold ml-2 flex-shrink-0 text-green-600">
                          {formatCurrency(lead.value, currency)}
                        </span>
                      </div>
                    </Link>
                  ))}
                  {(leadsByStatus["Won"] ?? []).length > 5 && (
                    <p className="text-xs text-muted-foreground">+{(leadsByStatus["Won"] ?? []).length - 5} more</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Lost */}
          <div className="bg-card border rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b bg-red-50/60 dark:bg-red-950/20">
              <div className="flex items-center gap-2">
                <XCircle className="w-4 h-4 text-red-500" />
                <span className="font-semibold text-sm text-red-600 dark:text-red-400">Lost</span>
                <span className="text-xs bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 rounded-full px-1.5 py-0.5 font-medium">
                  {lostLeads?.lead_count ?? 0}
                </span>
              </div>
              <span className="text-xs font-semibold text-red-600 dark:text-red-400">
                {formatCurrency(lostLeads?.total_value ?? 0, currency)}
              </span>
            </div>
            <div className="p-4">
              {(leadsByStatus["Lost"] ?? []).length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-3">No lost deals</p>
              ) : (
                <div className="space-y-2">
                  {(leadsByStatus["Lost"] ?? []).slice(0, 5).map((lead) => (
                    <Link key={lead.id} href={`/leads/${lead.id}`}>
                      <div className="flex items-center justify-between text-sm hover:text-accent transition-colors py-1">
                        <span className="truncate text-foreground">{lead.title}</span>
                        <span className="font-semibold ml-2 flex-shrink-0 text-muted-foreground">
                          {formatCurrency(lead.value, currency)}
                        </span>
                      </div>
                    </Link>
                  ))}
                  {(leadsByStatus["Lost"] ?? []).length > 5 && (
                    <p className="text-xs text-muted-foreground">+{(leadsByStatus["Lost"] ?? []).length - 5} more</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Mini bar chart */}
          <div className="bg-card border rounded-2xl p-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Leads by Stage
            </p>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 2, right: 2, left: -30, bottom: 2 }}>
                  <XAxis dataKey="status" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 9 }} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip
                    formatter={(value) => [Number(value), "Leads"]}
                    contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid var(--border)" }}
                  />
                  <Bar dataKey="leads" radius={[3, 3, 0, 0]}>
                    {chartData.map((entry) => (
                      <Cell
                        key={entry.status}
                        fill={STATUS_COLORS[entry.status.replace("\n", " ")] ?? "#94A3B8"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
