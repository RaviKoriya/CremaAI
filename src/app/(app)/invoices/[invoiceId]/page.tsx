import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { InvoiceDetailClient } from "./InvoiceDetailClient";

export const dynamic = "force-dynamic";

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ invoiceId: string }>;
}) {
  const { invoiceId } = await params;
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

  const { data: invoice } = await supabase
    .from("invoices")
    .select(`
      *,
      contacts(id, full_name, email, company_name),
      leads(id, title)
    `)
    .eq("id", invoiceId)
    .eq("company_id", profile.company_id)
    .single();

  if (!invoice) notFound();

  const { data: company } = await supabase
    .from("companies")
    .select("name, country")
    .eq("id", profile.company_id)
    .single();

  return (
    <InvoiceDetailClient
      invoice={invoice as never}
      company={company ?? { name: "", country: "" }}
      userRole={profile.role}
    />
  );
}
