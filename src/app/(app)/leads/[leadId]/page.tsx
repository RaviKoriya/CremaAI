import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LeadDetailClient } from "./LeadDetailClient";
import type { ActivityWithRelations, InvoiceWithContact } from "@/types/database";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ leadId: string }>;
}

export default async function LeadDetailPage({ params }: PageProps) {
  const { leadId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("company_id, role, id, name")
    .eq("id", user.id)
    .single();

  if (!profile?.company_id) redirect("/onboarding/company");

  const [leadRes, activitiesRes, invoicesRes] = await Promise.all([
    supabase
      .from("leads")
      .select(`
        *,
        contacts (*),
        profiles:assigned_to (id, name, email, avatar_url)
      `)
      .eq("id", leadId)
      .eq("company_id", profile.company_id)
      .single(),

    supabase
      .from("activities")
      .select(`
        *,
        profiles:created_by (id, name)
      `)
      .eq("lead_id", leadId)
      .order("created_at", { ascending: false })
      .limit(50),

    supabase
      .from("invoices")
      .select(`
        id, invoice_number, total, currency, status, issue_date,
        contacts (full_name)
      `)
      .eq("lead_id", leadId)
      .order("created_at", { ascending: false }),
  ]);

  if (!leadRes.data) notFound();

  return (
    <LeadDetailClient
      lead={leadRes.data as Record<string, unknown>}
      activities={(activitiesRes.data ?? []) as unknown as ActivityWithRelations[]}
      invoices={(invoicesRes.data ?? []) as unknown as InvoiceWithContact[]}
      companyId={profile.company_id}
      currentUser={{ id: profile.id, name: profile.name, role: profile.role }}
    />
  );
}
