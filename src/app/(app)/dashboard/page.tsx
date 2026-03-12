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
  const [statsResult, funnelResult, activitiesResult, topLeadsResult] = await Promise.all([
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
  ]);

  const stats = (statsResult.data ?? {}) as Record<string, number>;
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
