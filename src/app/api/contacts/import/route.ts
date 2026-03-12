import { NextResponse, type NextRequest } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import Papa from "papaparse";

interface ContactRow {
  full_name?: string;
  name?: string;
  email?: string;
  phone?: string;
  company_name?: string;
  company?: string;
  city?: string;
  country?: string;
  source?: string;
  tags?: string;
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("company_id")
    .eq("id", user.id)
    .single();

  if (!profile?.company_id) {
    return NextResponse.json({ error: "No company" }, { status: 400 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const text = await file.text();

  const { data: rows, errors } = Papa.parse<ContactRow>(text, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.toLowerCase().trim().replace(/\s+/g, "_"),
  });

  if (errors.length > 0) {
    return NextResponse.json({ error: "CSV parse error", details: errors }, { status: 400 });
  }

  const contacts = rows
    .filter((row) => (row.full_name || row.name) && row.email)
    .map((row) => ({
      company_id: profile.company_id as string,
      full_name: (row.full_name || row.name || "").trim(),
      email: row.email?.trim() ?? null,
      phone: row.phone?.trim() ?? null,
      company_name: (row.company_name || row.company || "").trim() || null,
      city: row.city?.trim() ?? null,
      country: row.country?.trim() ?? null,
      source: row.source?.trim() ?? null,
      tags: row.tags
        ? row.tags.split(",").map((t) => t.trim()).filter(Boolean)
        : [],
    }));

  if (contacts.length === 0) {
    return NextResponse.json(
      { error: "No valid contacts found. Ensure CSV has full_name/name and email columns." },
      { status: 400 }
    );
  }

  const serviceClient = await createServiceClient();
  const { data: inserted, error } = await serviceClient
    .from("contacts")
    .upsert(contacts, { onConflict: "company_id,email", ignoreDuplicates: false })
    .select("id");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    imported: inserted?.length ?? 0,
    total: contacts.length,
    skipped: contacts.length - (inserted?.length ?? 0),
  });
}
