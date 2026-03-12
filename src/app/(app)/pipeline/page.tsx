import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PipelineClient } from "./PipelineClient";

export const dynamic = "force-dynamic";

export default async function PipelinePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("company_id")
    .eq("id", user.id)
    .single();

  if (!profile?.company_id) redirect("/onboarding/company");

  const companyId = profile.company_id;

  const [funnelResult, leadsResult] = await Promise.all([
    supabase.rpc("get_pipeline_funnel", { p_company_id: companyId }),
    supabase
      .from("leads")
      .select(`
        id, title, value, currency, status, priority, created_at, expected_close_date,
        contacts(full_name)
      `)
      .eq("company_id", companyId)
      .order("created_at", { ascending: false }),
  ]);

  return (
    <PipelineClient
      funnel={(funnelResult.data ?? []) as { status: string; lead_count: number; total_value: number }[]}
      leads={(leadsResult.data ?? []) as never[]}
    />
  );
}
