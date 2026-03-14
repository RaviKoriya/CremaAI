"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { formatCurrency } from "@/lib/utils";
import {
  Download,
  TrendingUp,
  Users,
  AlertTriangle,
  Trophy,
  Minus,
} from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";
import { Button } from "@/components/ui/button";

interface RevenueMonth {
  month: string;
  revenue: number;
  lead_count: number;
}

interface WinRateUser {
  user_name: string;
  total: number;
  won: number;
  win_rate: number;
}

interface Lead {
  source: string | null;
  value: number;
  status: string;
}

interface Invoice {
  id: string;
  total: number;
  due_date: string | null;
  status: string;
  currency: string;
}

interface ReportsClientProps {
  revenueData: RevenueMonth[];
  winRateData: WinRateUser[];
  leads: Lead[];
  invoices: Invoice[];
}

// Keep hex for Recharts SVG fills
const COLORS = ["#2463FF", "#6366F1", "#F97316", "#3B82F6", "#F59E0B", "#8B5CF6", "#EF4444"];

function getDaysPastDue(dueDate: string): number {
  const due = new Date(dueDate);
  const now = new Date();
  return Math.floor((now.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
}

function exportCSV(data: Record<string, unknown>[], filename: string) {
  if (data.length === 0) return;
  const headers = Object.keys(data[0]);
  const rows = data.map((row) => headers.map((h) => JSON.stringify(row[h] ?? "")).join(","));
  const csv = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function SectionHeader({
  title,
  subtitle,
  onExport,
}: {
  title: string;
  subtitle?: string;
  onExport?: () => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h2 className="text-sm font-bold text-foreground">{title}</h2>
        {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
      {onExport && (
        <Button variant="outline" size="sm" className="gap-1.5 flex-shrink-0" onClick={onExport}>
          <Download className="w-3.5 h-3.5" />
          CSV
        </Button>
      )}
    </div>
  );
}

function EmptyChart() {
  return (
    <div className="flex flex-col items-center justify-center h-40 text-muted-foreground gap-2">
      <Minus className="w-8 h-8 opacity-30" />
      <p className="text-sm">No data yet</p>
    </div>
  );
}

export function ReportsClient({ revenueData, winRateData, leads, invoices }: ReportsClientProps) {
  const { currency } = useCurrency();

  // Source breakdown
  const sourceMap: Record<string, { count: number; value: number; won: number }> = {};
  for (const lead of leads) {
    const src = lead.source ?? "Unknown";
    if (!sourceMap[src]) sourceMap[src] = { count: 0, value: 0, won: 0 };
    sourceMap[src].count++;
    sourceMap[src].value += lead.value;
    if (lead.status === "Won") sourceMap[src].won++;
  }
  const sourceData = Object.entries(sourceMap).map(([name, data]) => ({
    name,
    count: data.count,
    value: data.value,
    won: data.won,
    winRate: data.count > 0 ? Math.round((data.won / data.count) * 100) : 0,
  }));

  // Invoice aging buckets
  const agingBuckets = { current: 0, "1-30": 0, "31-60": 0, "60+": 0 };
  for (const inv of invoices) {
    if (!inv.due_date) { agingBuckets.current += inv.total; continue; }
    const days = getDaysPastDue(inv.due_date);
    if (days <= 0) agingBuckets.current += inv.total;
    else if (days <= 30) agingBuckets["1-30"] += inv.total;
    else if (days <= 60) agingBuckets["31-60"] += inv.total;
    else agingBuckets["60+"] += inv.total;
  }
  const agingData = [
    { bucket: "Current", label: "On track", amount: agingBuckets.current, color: "#22C55E", bg: "bg-emerald-50 dark:bg-emerald-950/40", text: "text-emerald-700 dark:text-emerald-400", border: "border-emerald-200 dark:border-emerald-800" },
    { bucket: "1–30d Overdue", label: "Mild risk", amount: agingBuckets["1-30"], color: "#F59E0B", bg: "bg-amber-50 dark:bg-amber-950/40", text: "text-amber-700 dark:text-amber-400", border: "border-amber-200 dark:border-amber-800" },
    { bucket: "31–60d Overdue", label: "At risk", amount: agingBuckets["31-60"], color: "#F97316", bg: "bg-orange-50 dark:bg-orange-950/40", text: "text-orange-700 dark:text-orange-400", border: "border-orange-200 dark:border-orange-800" },
    { bucket: "60d+ Overdue", label: "Critical", amount: agingBuckets["60+"], color: "#EF4444", bg: "bg-red-50 dark:bg-red-950/40", text: "text-red-700 dark:text-red-400", border: "border-red-200 dark:border-red-800" },
  ];
  const agingTotal = agingData.reduce((s, b) => s + b.amount, 0);

  // Summary stats
  const totalRevenue = revenueData.reduce((sum, d) => sum + (d.revenue ?? 0), 0);
  const totalLeads = leads.length;
  const overallWinRate =
    winRateData.length > 0
      ? Math.round(
          (winRateData.reduce((s, r) => s + r.won, 0) /
            Math.max(winRateData.reduce((s, r) => s + r.total, 0), 1)) *
            100
        )
      : 0;
  const overdueAmount = agingBuckets["1-30"] + agingBuckets["31-60"] + agingBuckets["60+"];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">Reports</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Performance analytics for your sales team
          </p>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-2xl border bg-card p-4 space-y-3">
          <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <p className="text-lg font-bold text-foreground">
              {formatCurrency(totalRevenue, currency)}
            </p>
            <p className="text-xs text-muted-foreground">Revenue (6 months)</p>
          </div>
        </div>
        <div className="rounded-2xl border bg-card p-4 space-y-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <p className="text-lg font-bold text-foreground">{totalLeads}</p>
            <p className="text-xs text-muted-foreground">Total leads</p>
          </div>
        </div>
        <div className="rounded-2xl border bg-card p-4 space-y-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <Trophy className="w-4 h-4" />
          </div>
          <div>
            <p className="text-lg font-bold text-foreground">{overallWinRate}%</p>
            <p className="text-xs text-muted-foreground">Overall win rate</p>
          </div>
        </div>
        <div className="rounded-2xl border bg-card p-4 space-y-3">
          <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-950/50 flex items-center justify-center text-red-500">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <p className="text-lg font-bold text-foreground">
              {formatCurrency(overdueAmount, currency)}
            </p>
            <p className="text-xs text-muted-foreground">Overdue invoices</p>
          </div>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="bg-card border rounded-2xl p-5">
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <h2 className="text-sm font-bold text-foreground">Revenue (Last 6 Months)</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Won deals closed per month
            </p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="text-right hidden sm:block">
              <p className="text-lg font-bold text-foreground">
                {formatCurrency(totalRevenue, currency)}
              </p>
              <p className="text-xs text-muted-foreground">Total period</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() =>
                exportCSV(revenueData as unknown as Record<string, unknown>[], "revenue-report")
              }
            >
              <Download className="w-3.5 h-3.5" />
              CSV
            </Button>
          </div>
        </div>
        {revenueData.length === 0 ? (
          <EmptyChart />
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={revenueData}
                margin={{ top: 5, right: 5, left: -10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.06} />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: "currentColor", opacity: 0.5 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "currentColor", opacity: 0.5 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => (v >= 1000 ? `${currency === "INR" ? "₹" : "$"}${(v / 1000).toFixed(0)}k` : String(v))}
                />
                <Tooltip
                  formatter={(value) => [formatCurrency(Number(value), currency), "Revenue"]}
                  contentStyle={{
                    fontSize: 12,
                    borderRadius: 12,
                    border: "1px solid hsl(var(--border))",
                    backgroundColor: "hsl(var(--card))",
                    color: "hsl(var(--foreground))",
                  }}
                  cursor={{ fill: "currentColor", fillOpacity: 0.04 }}
                />
                <Bar dataKey="revenue" fill="#2463FF" radius={[6, 6, 0, 0]} maxBarSize={48} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Source Performance + Win Rate */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Lead Sources */}
        <div className="bg-card border rounded-2xl p-5">
          <SectionHeader
            title="Lead Sources"
            subtitle="Where your leads are coming from"
            onExport={() =>
              exportCSV(sourceData as unknown as Record<string, unknown>[], "source-performance")
            }
          />
          {sourceData.length === 0 ? (
            <EmptyChart />
          ) : (
            <div className="mt-4 flex gap-4 items-center">
              {/* Donut chart */}
              <div className="w-36 h-36 flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={sourceData}
                      dataKey="count"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={38}
                      outerRadius={62}
                      strokeWidth={2}
                      stroke="hsl(var(--card))"
                    >
                      {sourceData.map((_, index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [Number(value), "Leads"]}
                      contentStyle={{
                        fontSize: 11,
                        borderRadius: 8,
                        border: "1px solid hsl(var(--border))",
                        backgroundColor: "hsl(var(--card))",
                        color: "hsl(var(--foreground))",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              {/* Legend table */}
              <div className="flex-1 space-y-2 min-w-0">
                {sourceData.map((src, i) => {
                  const totalLeadsForSource = sourceData.reduce((s, d) => s + d.count, 0);
                  const pct = totalLeadsForSource > 0 ? Math.round((src.count / totalLeadsForSource) * 100) : 0;
                  return (
                    <div key={src.name} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <div
                            className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ backgroundColor: COLORS[i % COLORS.length] }}
                          />
                          <span className="text-foreground font-medium truncate">{src.name}</span>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-muted-foreground">{src.count}</span>
                          <span
                            className="font-semibold"
                            style={{ color: COLORS[i % COLORS.length] }}
                          >
                            {src.winRate}% won
                          </span>
                        </div>
                      </div>
                      <div className="h-1 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${pct}%`,
                            backgroundColor: COLORS[i % COLORS.length],
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Win Rate by Rep */}
        <div className="bg-card border rounded-2xl p-5">
          <SectionHeader
            title="Win Rate by Rep"
            subtitle="Closed deals performance per team member"
            onExport={() =>
              exportCSV(winRateData as unknown as Record<string, unknown>[], "win-rate")
            }
          />
          {winRateData.length === 0 ? (
            <EmptyChart />
          ) : (
            <div className="mt-4 space-y-3">
              {winRateData.map((rep) => {
                const initials = rep.user_name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase();
                return (
                  <div key={rep.user_name} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-accent/10 text-accent flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                          {initials}
                        </div>
                        <span className="font-medium text-foreground">{rep.user_name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <span>{rep.won}/{rep.total} won</span>
                        <span
                          className="font-bold text-xs px-1.5 py-0.5 rounded-md"
                          style={{
                            backgroundColor: `${rep.win_rate >= 50 ? "#22C55E" : rep.win_rate >= 25 ? "#F59E0B" : "#EF4444"}20`,
                            color: rep.win_rate >= 50 ? "#16A34A" : rep.win_rate >= 25 ? "#D97706" : "#DC2626",
                          }}
                        >
                          {rep.win_rate}%
                        </span>
                      </div>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${rep.win_rate}%`,
                          backgroundColor:
                            rep.win_rate >= 50
                              ? "#22C55E"
                              : rep.win_rate >= 25
                              ? "#F59E0B"
                              : "#EF4444",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {winRateData.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Team average</span>
                <span className="font-semibold text-foreground">{overallWinRate}% win rate</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Invoice Aging */}
      <div className="bg-card border rounded-2xl p-5 space-y-5">
        <SectionHeader
          title="Invoice Aging"
          subtitle="Outstanding invoice amounts by days overdue"
          onExport={() =>
            exportCSV(agingData as unknown as Record<string, unknown>[], "invoice-aging")
          }
        />

        {/* Aging buckets */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {agingData.map((bucket) => (
            <div
              key={bucket.bucket}
              className={`rounded-2xl border p-4 space-y-2 ${bucket.bg} ${bucket.border}`}
            >
              <p className={`text-xs font-semibold ${bucket.text}`}>{bucket.bucket}</p>
              <p className={`text-xs ${bucket.text} opacity-70`}>{bucket.label}</p>
              <p className="text-lg font-bold text-foreground">
                {formatCurrency(bucket.amount, currency)}
              </p>
              {agingTotal > 0 && (
                <p className="text-xs text-muted-foreground">
                  {Math.round((bucket.amount / agingTotal) * 100)}% of total
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Stacked progress bar */}
        {agingTotal > 0 && (
          <div className="space-y-2">
            <div className="flex gap-0.5 h-2.5 rounded-full overflow-hidden bg-muted">
              {agingData.map((bucket) => {
                const pct = agingTotal > 0 ? (bucket.amount / agingTotal) * 100 : 0;
                if (pct === 0) return null;
                return (
                  <div
                    key={bucket.bucket}
                    className="h-full transition-all first:rounded-l-full last:rounded-r-full"
                    style={{ width: `${pct}%`, backgroundColor: bucket.color }}
                    title={`${bucket.bucket}: ${Math.round(pct)}%`}
                  />
                );
              })}
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              {agingData.map((bucket) => (
                <div key={bucket.bucket} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: bucket.color }} />
                  {bucket.bucket}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
