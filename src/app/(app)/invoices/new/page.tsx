import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { InvoiceBuilder } from "@/components/invoices/InvoiceBuilder";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ leadId?: string; contactId?: string }>;
}

export default async function NewInvoicePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("company_id")
    .eq("id", user.id)
    .single();

  if (!profile?.company_id) redirect("/onboarding/company");

  return (
    <div className="h-full flex flex-col">
      <InvoiceBuilder
        companyId={profile.company_id}
        preselectedLeadId={params.leadId}
        preselectedContactId={params.contactId}
      />
    </div>
  );
}
