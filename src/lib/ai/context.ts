import { createClient } from "@/lib/supabase/server";
import type { AriaContextType } from "@/lib/constants";

export interface AriaContext {
  contextType: AriaContextType;
  contextId?: string;
  data: Record<string, unknown>;
  userRole: string;
  userName: string;
  companyName: string;
  currency: string;
  timestamp: string;
}

export async function getAriaContext(
  contextType: AriaContextType,
  contextId?: string
): Promise<AriaContext> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*, companies(*)")
    .eq("id", user.id)
    .single();

  if (!profile?.company_id) throw new Error("No company");

  const baseContext = {
    contextType,
    contextId,
    userRole: profile.role,
    userName: profile.name,
    companyName: (profile.companies as unknown as Record<string, string> | null)?.name ?? "Your Company",
    currency: (profile.companies as unknown as Record<string, string> | null)?.currency ?? "USD",
    timestamp: new Date().toISOString(),
  };

  switch (contextType) {
    case "dashboard":
    case "global": {
      const [statsRes, activitiesRes, topLeadsRes] = await Promise.all([
        supabase.rpc("get_dashboard_stats", { p_company_id: profile.company_id }),
        supabase
          .from("activities")
          .select("type, description, created_at, leads(title), contacts(full_name)")
          .eq("company_id", profile.company_id)
          .order("created_at", { ascending: false })
          .limit(10),
        supabase
          .from("leads")
          .select("title, value, currency, status, priority")
          .eq("company_id", profile.company_id)
          .not("status", "in", "(Won,Lost)")
          .order("value", { ascending: false })
          .limit(5),
      ]);

      return {
        ...baseContext,
        data: {
          stats: statsRes.data,
          recentActivities: activitiesRes.data,
          topLeads: topLeadsRes.data,
        },
      };
    }

    case "lead": {
      if (!contextId) throw new Error("contextId required for lead context");

      const [leadRes, activitiesRes, invoicesRes] = await Promise.all([
        supabase
          .from("leads")
          .select("*, contacts(*), profiles:assigned_to(name, email)")
          .eq("id", contextId)
          .single(),
        supabase
          .from("activities")
          .select("type, description, completed, created_at, profiles:created_by(name)")
          .eq("lead_id", contextId)
          .order("created_at", { ascending: false })
          .limit(10),
        supabase
          .from("invoices")
          .select("invoice_number, total, status, issue_date")
          .eq("lead_id", contextId)
          .limit(5),
      ]);

      return {
        ...baseContext,
        data: {
          lead: leadRes.data,
          recentActivities: activitiesRes.data,
          linkedInvoices: invoicesRes.data,
        },
      };
    }

    case "contact": {
      if (!contextId) throw new Error("contextId required for contact context");

      const [contactRes, leadsRes, activitiesRes] = await Promise.all([
        supabase.from("contacts").select("*").eq("id", contextId).single(),
        supabase
          .from("leads")
          .select("title, value, currency, status")
          .eq("contact_id", contextId)
          .limit(10),
        supabase
          .from("activities")
          .select("type, description, created_at")
          .eq("contact_id", contextId)
          .order("created_at", { ascending: false })
          .limit(5),
      ]);

      return {
        ...baseContext,
        data: {
          contact: contactRes.data,
          linkedLeads: leadsRes.data,
          recentActivities: activitiesRes.data,
        },
      };
    }

    case "invoice": {
      if (!contextId) throw new Error("contextId required for invoice context");

      const { data: invoice } = await supabase
        .from("invoices")
        .select("*, contacts(*), leads(title)")
        .eq("id", contextId)
        .single();

      return {
        ...baseContext,
        data: { invoice },
      };
    }

    default:
      return { ...baseContext, data: {} };
  }
}
