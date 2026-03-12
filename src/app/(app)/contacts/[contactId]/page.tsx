import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ContactDetailClient } from "./ContactDetailClient";
import type { ActivityWithRelations } from "@/types/database";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ contactId: string }>;
}

export default async function ContactDetailPage({ params }: PageProps) {
  const { contactId } = await params;
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

  const [contactRes, leadsRes, activitiesRes] = await Promise.all([
    supabase
      .from("contacts")
      .select("*")
      .eq("id", contactId)
      .eq("company_id", profile.company_id)
      .single(),

    supabase
      .from("leads")
      .select("id, title, value, currency, status, priority, created_at")
      .eq("contact_id", contactId)
      .order("created_at", { ascending: false }),

    supabase
      .from("activities")
      .select(`*, profiles:created_by(name)`)
      .eq("contact_id", contactId)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  if (!contactRes.data) notFound();

  return (
    <ContactDetailClient
      contact={contactRes.data}
      leads={(leadsRes.data ?? []) as never[]}
      activities={(activitiesRes.data ?? []) as unknown as ActivityWithRelations[]}
      companyId={profile.company_id}
      userRole={profile.role}
    />
  );
}
