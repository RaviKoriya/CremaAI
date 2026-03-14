import { redirect } from "next/navigation";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/AppShell";
import { AriaButton } from "@/components/ai/AriaButton";

// Never cache this layout — always re-render with fresh DB data on every request
export const dynamic = "force-dynamic";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Use service client to bypass RLS — safe because this is a server component
  // and we've already verified the user's identity above.
  const service = await createServiceClient();
  const { data: profile } = await service
    .from("profiles")
    .select("*, companies(currency)")
    .eq("id", user.id)
    .single();

  // Redirect to onboarding only if no company is linked yet (step 1 not done)
  // We check company_id — it's set in a single DB write during step 1, which
  // is far more reliable than multi-step onboarding_complete tracking.
  if (!profile || !profile.company_id) {
    redirect("/onboarding/company");
  }

  const companyCurrency =
    (profile.companies as unknown as { currency?: string } | null)?.currency ?? "USD";

  return (
    <AppShell profile={profile} companyCurrency={companyCurrency}>
      {children}
      <AriaButton />
    </AppShell>
  );
}
