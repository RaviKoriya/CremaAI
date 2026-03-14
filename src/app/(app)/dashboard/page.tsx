import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DashboardClient } from "./DashboardClient";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("company_id, name, role")
    .eq("id", user.id)
    .single();

  if (!profile?.company_id) redirect("/onboarding/company");

  const companyId = profile.company_id;

  // Parallel data fetching
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const [
    statsResult,
    funnelResult,
    activitiesResult,
    topLeadsResult,
    contactsCountResult,
    pendingInvoicesResult,
    activitiesWeekResult,
  ] = await Promise.all([
    supabase.rpc("get_dashboard_stats", { p_company_id: companyId }),
    supabase.rpc("get_pipeline_funnel", { p_company_id: companyId }),
    supabase
      .from("activities")
      .select(`
        *,
        profiles(name),
        leads(title),
        contacts(full_name)
      `)
      .eq("company_id", companyId)
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("leads")
      .select(`
        id, title, value, currency, status, priority,
        contacts(full_name)
      `)
      .eq("company_id", companyId)
      .not("status", "in", '("Won","Lost")')
      .order("value", { ascending: false })
      .limit(5),
    supabase
      .from("contacts")
      .select("id", { count: "exact", head: true })
      .eq("company_id", companyId),
    supabase
      .from("invoices")
      .select("id", { count: "exact", head: true })
      .eq("company_id", companyId)
      .in("status", ["Sent", "Overdue"]),
    supabase
      .from("activities")
      .select("id", { count: "exact", head: true })
      .eq("company_id", companyId)
      .gte("created_at", sevenDaysAgo),
  ]);

  const raw = (statsResult.data ?? {}) as Record<string, number>;
  const stats = {
    total_leads:         raw.total_leads ?? 0,
    active_leads:        raw.open_leads ?? 0,
    total_pipeline_value: raw.pipeline_value ?? 0,
    revenue_this_month:  raw.won_value_month ?? 0,
    overdue_invoices:    raw.overdue_invoices ?? 0,
    total_contacts:      contactsCountResult.count ?? 0,
    pending_invoices:    pendingInvoicesResult.count ?? 0,
    activities_this_week: activitiesWeekResult.count ?? 0,
  };
  const funnel = (funnelResult.data ?? []) as { status: string; lead_count: number; total_value: number }[];
  const activities = activitiesResult.data ?? [];
  const topLeads = topLeadsResult.data ?? [];

  return (
    <DashboardClient
      stats={stats}
      funnel={funnel}
      activities={activities as never[]}
      topLeads={topLeads as never[]}
      userName={profile.name ?? "there"}
    />
  );
}
