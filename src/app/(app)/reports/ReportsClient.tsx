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
  Legend,
} from "recharts";
import { formatCurrency } from "@/lib/utils";
import { Download } from "lucide-react";
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

const COLORS = ["#0F1E3C", "#00C9A7", "#8B5CF6", "#F97316", "#EF4444", "#3B82F6", "#F59E0B"];

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

export function ReportsClient({ revenueData, winRateData, leads, invoices }: ReportsClientProps) {
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
    { bucket: "Current", amount: agingBuckets.current, color: "#22C55E" },
    { bucket: "1-30d Overdue", amount: agingBuckets["1-30"], color: "#F59E0B" },
    { bucket: "31-60d Overdue", amount: agingBuckets["31-60"], color: "#F97316" },
    { bucket: "60d+ Overdue", amount: agingBuckets["60+"], color: "#EF4444" },
  ];

  const totalRevenue = revenueData.reduce((sum, d) => sum + (d.revenue ?? 0), 0);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Reports</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Performance analytics for your sales team
        </p>
      </div>

      {/* Revenue Chart */}
      <div className="bg-white border rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold text-sm">Revenue (Last 6 Months)</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Total: {formatCurrency(totalRevenue, "USD")}
            </p>
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
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={revenueData} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
              <Tooltip
                formatter={(value) => [formatCurrency(Number(value), "USD"), "Revenue"]}
                contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #e2e8f0" }}
              />
              <Bar dataKey="revenue" fill="#00C9A7" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Source Performance + Win Rate */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Source breakdown */}
        <div className="bg-white border rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-sm">Lead Sources</h2>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() =>
                exportCSV(sourceData as unknown as Record<string, unknown>[], "source-performance")
              }
            >
              <Download className="w-3.5 h-3.5" />
              CSV
            </Button>
          </div>
          {sourceData.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No data yet</p>
          ) : (
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sourceData}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    label={({ name, percent }) =>
                      `${name} ${Math.round((percent ?? 0) * 100)}%`
                    }
                    labelLine={false}
                  >
                    {sourceData.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [Number(value), "Leads"]}
                    contentStyle={{ fontSize: 11, borderRadius: 8 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
          {sourceData.length > 0 && (
            <div className="mt-3 space-y-1.5">
              {sourceData.map((src, i) => (
                <div key={src.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: COLORS[i % COLORS.length] }}
                    />
                    <span className="text-muted-foreground">{src.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span>{src.count} leads</span>
                    <span className="text-green-600 font-medium">{src.winRate}% win</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Win Rate by User */}
        <div className="bg-white border rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-sm">Win Rate by Rep</h2>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() =>
                exportCSV(winRateData as unknown as Record<string, unknown>[], "win-rate")
              }
            >
              <Download className="w-3.5 h-3.5" />
              CSV
            </Button>
          </div>
          {winRateData.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No data yet</p>
          ) : (
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={winRateData}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 5, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                  <XAxis
                    type="number"
                    domain={[0, 100]}
                    tickFormatter={(v) => `${v}%`}
                    tick={{ fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="user_name"
                    tick={{ fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                    width={80}
                  />
                  <Tooltip
                    formatter={(value) => [`${Number(value)}%`, "Win Rate"]}
                    contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #e2e8f0" }}
                  />
                  <Bar dataKey="win_rate" fill="#0F1E3C" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
          {winRateData.length > 0 && (
            <div className="mt-3 space-y-1.5">
              {winRateData.map((rep) => (
                <div key={rep.user_name} className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{rep.user_name}</span>
                  <div className="flex items-center gap-3">
                    <span>{rep.total} deals</span>
                    <span className="text-[#0F1E3C] font-medium">{rep.won} won</span>
                    <span className="text-green-600 font-bold">{rep.win_rate}%</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Invoice Aging */}
      <div className="bg-white border rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-sm">Invoice Aging</h2>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() =>
              exportCSV(agingData as unknown as Record<string, unknown>[], "invoice-aging")
            }
          >
            <Download className="w-3.5 h-3.5" />
            CSV
          </Button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {agingData.map((bucket) => (
            <div
              key={bucket.bucket}
              className="rounded-xl p-4 text-center"
              style={{ backgroundColor: `${bucket.color}15` }}
            >
              <p className="text-xs font-medium" style={{ color: bucket.color }}>
                {bucket.bucket}
              </p>
              <p className="text-xl font-bold text-gray-900 mt-1">
                {formatCurrency(bucket.amount, "USD")}
              </p>
            </div>
          ))}
        </div>
        {invoices.length > 0 && (
          <div className="mt-4">
            <div className="flex gap-1 h-3 rounded-full overflow-hidden">
              {agingData.map((bucket) => {
                const total = agingData.reduce((s, b) => s + b.amount, 0);
                const pct = total > 0 ? (bucket.amount / total) * 100 : 0;
                return (
                  <div
                    key={bucket.bucket}
                    style={{ width: `${pct}%`, backgroundColor: bucket.color }}
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
