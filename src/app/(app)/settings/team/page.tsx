import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { TeamSettingsClient } from "./TeamSettingsClient";

export const dynamic = "force-dynamic";

export default async function TeamSettingsPage() {
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

  const { data: members } = await supabase
    .from("profiles")
    .select("id, name, email, role, avatar_url")
    .eq("company_id", profile.company_id)
    .order("name");

  return (
    <TeamSettingsClient
      members={members ?? []}
      currentUserId={user.id}
      companyId={profile.company_id}
      userRole={profile.role}
    />
  );
}
