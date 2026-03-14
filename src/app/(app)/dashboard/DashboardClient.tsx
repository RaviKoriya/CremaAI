"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { FunnelChart } from "@/components/dashboard/FunnelChart";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatCurrency, formatRelativeDate } from "@/lib/utils";
import { useCurrency } from "@/contexts/CurrencyContext";
import {
  TrendUp,
  UsersThree,
  FileText,
  Lightning,
  Plus,
  X,
  CheckCircle,
  CaretRight,
  Pulse,
  Phone,
  EnvelopeSimple,
  ChatDots,
  CalendarCheck,
  Note,
} from "@phosphor-icons/react";
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

const ACTIVITY_ICONS: Record<string, React.ReactNode> = {
  Call: <Phone className="w-3.5 h-3.5" />,
  Email: <EnvelopeSimple className="w-3.5 h-3.5" />,
  Meeting: <CalendarCheck className="w-3.5 h-3.5" />,
  Note: <Note className="w-3.5 h-3.5" />,
  Message: <ChatDots className="w-3.5 h-3.5" />,
};

const ACTIVITY_COLORS: Record<string, string> = {
  Call: "bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400",
  Email: "bg-violet-100 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400",
  Meeting: "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400",
  Note: "bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400",
  Message: "bg-pink-100 dark:bg-pink-950/50 text-pink-600 dark:text-pink-400",
};

function getGreeting(name: string) {
  const hour = new Date().getHours();
  if (hour < 12) return `Good morning, ${name}`;
  if (hour < 17) return `Good afternoon, ${name}`;
  return `Good evening, ${name}`;
}

function getDateString() {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export function DashboardClient({
  stats,
  funnel,
  activities,
  topLeads,
  userName,
}: DashboardClientProps) {
  const { currency } = useCurrency();

  const [quickStartDismissed, setQuickStartDismissed] = useState(false);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setQuickStartDismissed(localStorage.getItem("quickstart_dismissed") === "true");
    try {
      setCheckedItems(JSON.parse(localStorage.getItem("quickstart_checked") ?? "{}"));
    } catch {
      // ignore
    }
  }, []);

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
  const completedCount = QUICKSTART_ITEMS.filter((item) => checkedItems[item.key]).length;

  const pipelineValue = stats.total_pipeline_value ?? 0;
  const monthlyRevenue = stats.revenue_this_month ?? 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">

      {/* Greeting + date */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{getGreeting(userName)}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{getDateString()}</p>
        </div>
        <Link href="/leads?new=true">
          <button className="hidden sm:flex items-center gap-2 bg-primary text-primary-foreground text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-primary/90 transition-colors">
            <Plus className="w-4 h-4" weight="bold" />
            New Lead
          </button>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <KpiCard
          title="Pipeline Value"
          value={formatCurrency(pipelineValue, currency)}
          icon={<TrendUp className="w-5 h-5" />}
          variant="teal"
          trend="up"
          trendValue={`${stats.active_leads ?? 0} active`}
          trendLabel="leads in pipeline"
        />
        <KpiCard
          title="Revenue This Month"
          value={formatCurrency(monthlyRevenue, currency)}
          icon={<FileText className="w-5 h-5" />}
          variant="navy"
          trend="up"
          trendValue="Won & invoiced"
          trendLabel="leads"
        />
        <KpiCard
          title="Total Contacts"
          value={String(stats.total_contacts ?? 0)}
          icon={<UsersThree className="w-5 h-5" />}
          variant="purple"
          subtitle={`${stats.total_leads ?? 0} total leads`}
        />
        <KpiCard
          title="Activities (7d)"
          value={String(stats.activities_this_week ?? 0)}
          icon={<Lightning className="w-5 h-5" />}
          variant={stats.overdue_invoices ? "red" : "amber"}
          trend={stats.overdue_invoices ? "down" : "neutral"}
          trendValue={
            stats.overdue_invoices
              ? `${stats.overdue_invoices} overdue`
              : `${stats.pending_invoices ?? 0} pending`
          }
          trendLabel="invoices"
        />
      </div>

      {/* Main content: 3-col grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* LEFT: Pipeline Funnel — spans 2 cols */}
        <div className="lg:col-span-2 bg-card border rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-sm text-foreground">Pipeline Funnel</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Lead distribution across stages</p>
            </div>
            <Link
              href="/pipeline"
              className="text-xs text-accent hover:underline flex items-center gap-0.5 font-medium"
            >
              Full view <CaretRight className="w-3 h-3" />
            </Link>
          </div>
          <FunnelChart data={funnel} currency={currency} />
        </div>

        {/* RIGHT: Top Leads + Quick Start */}
        <div className="lg:col-span-1 flex flex-col gap-4">

          {/* Quick Start (if not dismissed) */}
          {!quickStartDismissed && !allChecked && (
            <div className="bg-card border rounded-2xl p-4 relative">
              <button
                onClick={dismissQuickStart}
                className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center">
                  <CheckCircle className="w-3.5 h-3.5 text-accent" weight="fill" />
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">Quick Start</p>
                  <p className="text-xs text-muted-foreground">{completedCount}/{QUICKSTART_ITEMS.length} done</p>
                </div>
                {/* Progress bar */}
                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden ml-1">
                  <div
                    className="h-full bg-accent rounded-full transition-all"
                    style={{ width: `${(completedCount / QUICKSTART_ITEMS.length) * 100}%` }}
                  />
                </div>
              </div>
              <div className="space-y-2">
                {QUICKSTART_ITEMS.map((item) => (
                  <div key={item.key} className="flex items-center gap-2.5">
                    <button onClick={() => toggleCheck(item.key)} className="flex-shrink-0">
                      <CheckCircle
                        className={`w-4 h-4 transition-colors ${
                          checkedItems[item.key] ? "text-accent" : "text-muted-foreground/40"
                        }`}
                        weight={checkedItems[item.key] ? "fill" : "regular"}
                      />
                    </button>
                    <Link
                      href={item.href}
                      className={`text-xs transition-colors ${
                        checkedItems[item.key]
                          ? "line-through text-muted-foreground/50"
                          : "text-foreground hover:text-accent"
                      }`}
                    >
                      {item.label}
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top Open Leads */}
          <div className="bg-card border rounded-2xl p-5 shadow-sm flex-1">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-bold text-sm text-foreground">Top Open Leads</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Highest value opportunities</p>
              </div>
              <Link href="/leads">
                <span className="text-xs text-accent hover:underline flex items-center gap-0.5 font-medium">
                  View all <CaretRight className="w-3 h-3" />
                </span>
              </Link>
            </div>

            {topLeads.length === 0 ? (
              <div className="text-center py-8 space-y-3">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mx-auto">
                  <TrendUp className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">No leads yet</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Start adding leads to see them here</p>
                </div>
                <Link href="/leads?new=true">
                  <button className="text-xs bg-primary text-primary-foreground px-3 py-1.5 rounded-lg flex items-center gap-1 mx-auto">
                    <Plus className="w-3 h-3" />
                    Add a lead
                  </button>
                </Link>
              </div>
            ) : (
              <div className="space-y-1.5">
                {topLeads.map((lead, i) => (
                  <Link key={lead.id} href={`/leads/${lead.id}`}>
                    <div className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted/50 transition-colors group">
                      {/* Rank */}
                      <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                        <span className="text-[10px] font-bold text-muted-foreground">{i + 1}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-foreground truncate group-hover:text-accent transition-colors">
                          {lead.title}
                        </p>
                        <p className="text-[11px] text-muted-foreground truncate">
                          {lead.contacts?.full_name ?? "No contact"}
                        </p>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <p className="text-xs font-bold text-foreground">
                          {formatCurrency(lead.value, currency)}
                        </p>
                        <StatusBadge status={lead.status} />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom row: Recent Activity full-width */}
      <div className="bg-card border rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-bold text-sm text-foreground">Recent Activity</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Latest interactions across all leads</p>
          </div>
          <Link href="/leads" className="text-xs text-accent hover:underline flex items-center gap-0.5 font-medium">
            View leads <CaretRight className="w-3 h-3" />
          </Link>
        </div>

        {activities.length === 0 ? (
          <div className="text-center py-8 space-y-2">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mx-auto">
              <Pulse className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">No activities yet</p>
            <p className="text-xs text-muted-foreground">
              Add a lead and log interactions to see them here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {activities.slice(0, 6).map((activity) => {
              const type = (activity.type as string) ?? "Note";
              const icon = ACTIVITY_ICONS[type] ?? <Note className="w-3.5 h-3.5" />;
              const colorClass = ACTIVITY_COLORS[type] ?? ACTIVITY_COLORS.Note;
              return (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-3 rounded-xl bg-muted/30 border border-border/50"
                >
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                    {icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-foreground">{type}</span>
                      <span className="text-[11px] text-muted-foreground flex-shrink-0">
                        {formatRelativeDate(activity.created_at)}
                      </span>
                    </div>
                    {activity.description && (
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                        {activity.description}
                      </p>
                    )}
                    {activity.profiles?.name && (
                      <p className="text-[11px] text-muted-foreground/70 mt-1">
                        by {activity.profiles.name}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
