import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AriaPageClient } from "./AriaPageClient";

export const dynamic = "force-dynamic";

export default async function AiPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("company_id, name, role")
    .eq("id", user.id)
    .single();

  if (!profile?.company_id) redirect("/onboarding/company");

  return <AriaPageClient userName={profile.name} />;
}
