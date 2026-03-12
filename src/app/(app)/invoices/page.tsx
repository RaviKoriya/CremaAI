import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { InvoicesPageClient } from "./InvoicesPageClient";

export const dynamic = "force-dynamic";

export default async function InvoicesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("company_id, role")
    .eq("id", user.id)
    .single();

  if (!profile?.company_id) redirect("/onboarding/company");

  const { data: invoices } = await supabase
    .from("invoices")
    .select(`
      id, invoice_number, total, currency, status, issue_date, due_date,
      contacts (id, full_name, company_name)
    `)
    .eq("company_id", profile.company_id)
    .order("created_at", { ascending: false });

  return (
    <InvoicesPageClient
      invoices={(invoices ?? []) as never[]}
      companyId={profile.company_id}
    />
  );
}
