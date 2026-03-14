import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

export async function POST(request: NextRequest) {
  // Verify auth
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, country, currency, timezone, loadDemo } = await request.json();

  // Service role client — bypasses all RLS
  const service = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );

  // Get current profile to check if company already exists
  const { data: profile } = await service
    .from("profiles")
    .select("company_id")
    .eq("id", user.id)
    .single();

  let companyId: string | null = profile?.company_id ?? null;

  if (companyId) {
    // Update existing company
    await service
      .from("companies")
      .update({ name, country, currency, timezone })
      .eq("id", companyId);
  } else {
    // Create new company
    const { data: newCompany, error: companyError } = await service
      .from("companies")
      .insert({ name, country, currency, timezone })
      .select("id")
      .single();

    if (companyError) {
      return NextResponse.json({ error: companyError.message }, { status: 500 });
    }

    companyId = newCompany?.id ?? null;

    // Link profile to company and set role to Admin
    // Use upsert (not update) so it works even if the trigger-created
    // profile row doesn't exist yet in production.
    if (companyId) {
      const { error: profileError } = await service
        .from("profiles")
        .upsert({
          id: user.id,
          email: user.email ?? "",
          name: (user.user_metadata?.full_name as string) || (user.email?.split("@")[0] ?? "User"),
          company_id: companyId,
          role: "Admin",
        });

      if (profileError) {
        return NextResponse.json({ error: profileError.message }, { status: 500 });
      }
    }
  }

  // Load demo data if requested
  if (loadDemo && companyId) {
    await supabase.rpc("load_demo_data", {
      p_company_id: companyId,
      p_user_id: user.id,
    });
  }

  return NextResponse.json({ success: true, companyId });
}
