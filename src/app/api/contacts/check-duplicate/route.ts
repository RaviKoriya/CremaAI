import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email") || "";
  const phone = searchParams.get("phone") || "";
  const companyId = searchParams.get("companyId") || "";
  const excludeId = searchParams.get("excludeId") || "";

  if ((!email && !phone) || !companyId) {
    return NextResponse.json({ duplicate: null });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ duplicate: null });

  let query = supabase
    .from("contacts")
    .select("id, full_name, email, phone")
    .eq("company_id", companyId);

  if (excludeId) {
    query = query.neq("id", excludeId);
  }

  if (email && phone) {
    query = query.or(`email.eq.${email},phone.eq.${phone}`);
  } else if (email) {
    query = query.eq("email", email);
  } else if (phone) {
    query = query.eq("phone", phone);
  }

  const { data } = await query.limit(1).single();

  return NextResponse.json({ duplicate: data ?? null });
}
