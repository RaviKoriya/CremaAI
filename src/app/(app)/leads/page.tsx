import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LeadsPageClient } from "./LeadsPageClient";
import type { LeadWithContact } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function LeadsPage() {
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

  const { data: leads } = await supabase
    .from("leads")
    .select(
      `
      *,
      contacts (id, full_name, company_name, email, phone),
      profiles:assigned_to (id, name, avatar_url)
    `
    )
    .eq("company_id", profile.company_id)
    .order("position", { ascending: true })
    .order("created_at", { ascending: false });

  const { data: team } = await supabase
    .from("profiles")
    .select("id, name")
    .eq("company_id", profile.company_id);

  return (
    <LeadsPageClient
      initialLeads={(leads ?? []) as unknown as LeadWithContact[]}
      companyId={profile.company_id}
      teamMembers={team ?? []}
      userRole={profile.role}
    />
  );
}
