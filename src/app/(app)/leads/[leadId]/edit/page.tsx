import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { LeadEditClient } from "./LeadEditClient";

export const dynamic = "force-dynamic";

export default async function LeadEditPage({
  params,
}: {
  params: Promise<{ leadId: string }>;
}) {
  const { leadId } = await params;
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

  const { data: lead } = await supabase
    .from("leads")
    .select("*")
    .eq("id", leadId)
    .eq("company_id", profile.company_id)
    .single();

  if (!lead) notFound();

  return (
    <LeadEditClient
      lead={lead as never}
      companyId={profile.company_id}
      returnHref={`/leads/${leadId}`}
    />
  );
}
