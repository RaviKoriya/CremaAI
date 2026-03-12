import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ContactsPageClient } from "./ContactsPageClient";

export const dynamic = "force-dynamic";

export default async function ContactsPage() {
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

  const { data: contacts } = await supabase
    .from("contacts")
    .select("*")
    .eq("company_id", profile.company_id)
    .order("full_name");

  // Get lead counts per contact
  const { data: leadCounts } = await supabase
    .from("leads")
    .select("contact_id")
    .eq("company_id", profile.company_id);

  const countMap: Record<string, number> = {};
  if (leadCounts) {
    for (const lead of leadCounts) {
      if (lead.contact_id) {
        countMap[lead.contact_id] = (countMap[lead.contact_id] ?? 0) + 1;
      }
    }
  }

  const contactsWithCounts = (contacts ?? []).map((c) => ({
    ...c,
    lead_count: countMap[c.id] ?? 0,
  }));

  return (
    <ContactsPageClient
      initialContacts={contactsWithCounts}
      companyId={profile.company_id}
      userRole={profile.role}
    />
  );
}
