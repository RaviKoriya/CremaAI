"use client";

import { useState } from "react";
import Link from "next/link";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { FunnelChart } from "@/components/dashboard/FunnelChart";
import { ActivityFeed } from "@/components/activities/ActivityFeed";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PriorityBadge } from "@/components/shared/PriorityBadge";
import { formatCurrency, formatRelativeDate } from "@/lib/utils";
import {
  TrendingUp,
  Users,
  FileText,
  Activity,
  Plus,
  X,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";
import type { ActivityWithRelations } from "@/types/database";

interface DashboardStats {
  total_leads?: number;
  active_leads?: number;
  won_leads?: number;
  total_pipeline_value?: number;
  revenue_this_month?: number;
  total_contacts?: number;
  pending_invoices?: number;
  overdue_invoices?: number;
  activities_this_week?: number;
}

interface FunnelData {
  status: string;
  lead_count: number;
  total_value: number;
}

interface DashboardClientProps {
  stats: DashboardStats;
  funnel: FunnelData[];
  activities: ActivityWithRelations[];
  topLeads: Array<{
    id: string;
    title: string;
    value: number;
    currency: string;
    status: string;
    priority: string;
    contacts: { full_name: string } | null;
  }>;
  userName: string;
}

const QUICKSTART_ITEMS = [
  { key: "added_lead", label: "Add your first lead", href: "/leads?new=true" },
  { key: "added_contact", label: "Import or add a contact", href: "/contacts" },
  { key: "created_invoice", label: "Create an invoice", href: "/invoices/new" },
];

export function DashboardClient({
  stats,
  funnel,
  activities,
  topLeads,
  userName,
}: DashboardClientProps) {
  const [quickStartDismissed, setQuickStartDismissed] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("quickstart_dismissed") === "true";
  });
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>(() => {
    if (typeof window === "undefined") return {};
    try {
      return JSON.parse(localStorage.getItem("quickstart_checked") ?? "{}");
    } catch {
      return {};
    }
  });

  function toggleCheck(key: string) {
    const next = { ...checkedItems, [key]: !checkedItems[key] };
    setCheckedItems(next);
    localStorage.setItem("quickstart_checked", JSON.stringify(next));
  }

  function dismissQuickStart() {
    setQuickStartDismissed(true);
    localStorage.setItem("quickstart_dismissed", "true");
  }

  const allChecked = QUICKSTART_ITEMS.every((item) => checkedItems[item.key]);

  const pipelineValue = stats.total_pipeline_value ?? 0;
  const monthlyRevenue = stats.revenue_this_month ?? 0;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">Good day, {userName} 👋</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Here&apos;s what&apos;s happening with your pipeline today.
        </p>
      </div>

      {/* Quick Start checklist */}
      {!quickStartDismissed && !allChecked && (
        <div className="bg-gradient-to-r from-[#0F1E3C] to-[#1a2f5e] rounded-xl p-4 text-white relative">
          <button
            onClick={dismissQuickStart}
            className="absolute top-3 right-3 text-white/60 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
          <p className="font-semibold text-sm mb-3 text-[#00C9A7]">Quick Start ✨</p>
          <div className="space-y-2">
            {QUICKSTART_ITEMS.map((item) => (
              <div key={item.key} className="flex items-center gap-3">
                <button
                  onClick={() => toggleCheck(item.key)}
                  className="flex-shrink-0"
                >
                  <CheckCircle2
                    className={`w-5 h-5 ${
                      checkedItems[item.key] ? "text-[#00C9A7]" : "text-white/30"
                    }`}
                  />
                </button>
                <Link
                  href={item.href}
                  className={`text-sm ${
                    checkedItems[item.key] ? "line-through text-white/40" : "text-white hover:text-[#00C9A7]"
                  }`}
                >
                  {item.label}
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KpiCard
          title="Pipeline Value"
          value={formatCurrency(pipelineValue, "USD")}
          subtitle={`${stats.active_leads ?? 0} active leads`}
          icon={<TrendingUp className="w-5 h-5" />}
          accentColor="#00C9A7"
        />
        <KpiCard
          title="Revenue This Month"
          value={formatCurrency(monthlyRevenue, "USD")}
          subtitle="From won & invoiced leads"
          icon={<FileText className="w-5 h-5" />}
          accentColor="#0F1E3C"
          trend="up"
        />
        <KpiCard
          title="Total Contacts"
          value={String(stats.total_contacts ?? 0)}
          subtitle={`${stats.total_leads ?? 0} total leads`}
          icon={<Users className="w-5 h-5" />}
          accentColor="#8B5CF6"
        />
        <KpiCard
          title="Activities (7d)"
          value={String(stats.activities_this_week ?? 0)}
          subtitle={
            stats.overdue_invoices
              ? `${stats.overdue_invoices} overdue invoices`
              : `${stats.pending_invoices ?? 0} pending invoices`
          }
          icon={<Activity className="w-5 h-5" />}
          accentColor={stats.overdue_invoices ? "#EF4444" : "#F59E0B"}
          trend={stats.overdue_invoices ? "down" : "neutral"}
        />
      </div>

      {/* Pipeline Funnel + Top Leads */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Funnel */}
        <div className="lg:col-span-3 bg-white border rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-sm">Pipeline Funnel</h2>
            <Link
              href="/pipeline"
              className="text-xs text-[#00C9A7] hover:underline flex items-center gap-0.5"
            >
              Full view <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <FunnelChart data={funnel} />
        </div>

        {/* Top Leads */}
        <div className="lg:col-span-2 bg-white border rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-sm">Top Open Leads</h2>
            <Link href="/leads">
              <button className="text-xs text-[#00C9A7] hover:underline flex items-center gap-0.5">
                View all <ChevronRight className="w-3 h-3" />
              </button>
            </Link>
          </div>

          {topLeads.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <p className="text-sm mb-2">No active leads yet</p>
              <Link href="/leads">
                <button className="text-xs bg-[#0F1E3C] text-white px-3 py-1.5 rounded-lg flex items-center gap-1 mx-auto">
                  <Plus className="w-3 h-3" />
                  Add a lead
                </button>
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {topLeads.map((lead) => (
                <Link key={lead.id} href={`/leads/${lead.id}`}>
                  <div className="flex items-center justify-between p-2.5 rounded-lg hover:bg-gray-50 gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{lead.title}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {lead.contacts?.full_name ?? "No contact"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs font-bold text-[#0F1E3C]">
                        {formatCurrency(lead.value, lead.currency)}
                      </span>
                      <StatusBadge status={lead.status} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white border rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-sm">Recent Activity</h2>
          <Link href="/leads" className="text-xs text-[#00C9A7] hover:underline">
            View leads
          </Link>
        </div>
        {activities.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            No activities logged yet. Start by adding a lead and logging interactions.
          </p>
        ) : (
          <ActivityFeed activities={activities} />
        )}
      </div>
    </div>
  );
}
