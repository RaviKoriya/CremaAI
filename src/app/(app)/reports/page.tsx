import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ReportsClient } from "./ReportsClient";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
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

  const [revenueResult, winRateResult, sourceResult, invoiceAgingResult] = await Promise.all([
    supabase.rpc("get_revenue_by_month", { p_company_id: companyId, p_months: 6 }),
    supabase.rpc("get_win_rate_by_user", { p_company_id: companyId }),
    // Source breakdown from leads
    supabase
      .from("leads")
      .select("source, value, status")
      .eq("company_id", companyId),
    // Invoice aging
    supabase
      .from("invoices")
      .select("id, total, due_date, status, currency")
      .eq("company_id", companyId)
      .in("status", ["Sent", "Overdue", "Draft"]),
  ]);

  return (
    <ReportsClient
      revenueData={revenueResult.data ?? []}
      winRateData={winRateResult.data ?? []}
      leads={sourceResult.data ?? []}
      invoices={invoiceAgingResult.data ?? []}
    />
  );
}
