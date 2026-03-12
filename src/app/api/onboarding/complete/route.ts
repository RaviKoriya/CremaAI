import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

export async function POST() {
  // Verify the user is authenticated via their session cookies
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Use the raw supabase-js admin client — this is the only correct way to
  // bypass RLS. The @supabase/ssr createServerClient does NOT properly bypass
  // RLS even with the service role key because it still processes user cookies.
  const service = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );

  // Fetch profile to get company_id
  const { data: profile } = await service
    .from("profiles")
    .select("company_id")
    .eq("id", user.id)
    .single();

  // Mark company complete if linked
  if (profile?.company_id) {
    await service
      .from("companies")
      .update({ onboarding_complete: true })
      .eq("id", profile.company_id);
  }

  // Always mark profile complete (service role bypasses RLS)
  const { error } = await service
    .from("profiles")
    .update({ onboarding_complete: true })
    .eq("id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
