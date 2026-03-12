export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      companies: {
        Row: {
          id: string;
          name: string;
          logo_url: string | null;
          country: string;
          currency: string;
          timezone: string;
          invoice_prefix: string;
          onboarding_complete: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          logo_url?: string | null;
          country?: string;
          currency?: string;
          timezone?: string;
          invoice_prefix?: string;
          onboarding_complete?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          logo_url?: string | null;
          country?: string;
          currency?: string;
          timezone?: string;
          invoice_prefix?: string;
          onboarding_complete?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          name: string;
          email: string;
          role: string;
          avatar_url: string | null;
          company_id: string | null;
          onboarding_complete: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          name: string;
          email: string;
          role?: string;
          avatar_url?: string | null;
          company_id?: string | null;
          onboarding_complete?: boolean;
          created_at?: string;
        };
        Update: {
          name?: string;
          email?: string;
          role?: string;
          avatar_url?: string | null;
          company_id?: string | null;
          onboarding_complete?: boolean;
        };
        Relationships: [];
      };
      contacts: {
        Row: {
          id: string;
          company_id: string;
          full_name: string;
          email: string | null;
          phone: string | null;
          company_name: string | null;
          country: string | null;
          city: string | null;
          source: string | null;
          tags: string[];
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          full_name: string;
          email?: string | null;
          phone?: string | null;
          company_name?: string | null;
          country?: string | null;
          city?: string | null;
          source?: string | null;
          tags?: string[];
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          full_name?: string;
          email?: string | null;
          phone?: string | null;
          company_name?: string | null;
          country?: string | null;
          city?: string | null;
          source?: string | null;
          tags?: string[];
          avatar_url?: string | null;
        };
        Relationships: [];
      };
      leads: {
        Row: {
          id: string;
          company_id: string;
          contact_id: string | null;
          title: string;
          value: number;
          currency: string;
          status: string;
          priority: string;
          assigned_to: string | null;
          expected_close_date: string | null;
          notes: string | null;
          source: string | null;
          won_lost_reason: string | null;
          position: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          contact_id?: string | null;
          title: string;
          value?: number;
          currency?: string;
          status?: string;
          priority?: string;
          assigned_to?: string | null;
          expected_close_date?: string | null;
          notes?: string | null;
          source?: string | null;
          won_lost_reason?: string | null;
          position?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          contact_id?: string | null;
          title?: string;
          value?: number;
          currency?: string;
          status?: string;
          priority?: string;
          assigned_to?: string | null;
          expected_close_date?: string | null;
          notes?: string | null;
          source?: string | null;
          won_lost_reason?: string | null;
          position?: number;
        };
        Relationships: [];
      };
      activities: {
        Row: {
          id: string;
          company_id: string;
          lead_id: string | null;
          contact_id: string | null;
          type: string;
          description: string;
          due_date: string | null;
          completed: boolean;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          lead_id?: string | null;
          contact_id?: string | null;
          type: string;
          description: string;
          due_date?: string | null;
          completed?: boolean;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          lead_id?: string | null;
          contact_id?: string | null;
          type?: string;
          description?: string;
          due_date?: string | null;
          completed?: boolean;
        };
        Relationships: [];
      };
      invoices: {
        Row: {
          id: string;
          company_id: string;
          invoice_number: string;
          contact_id: string | null;
          lead_id: string | null;
          issue_date: string;
          due_date: string | null;
          country: string | null;
          line_items: Json;
          subtotal: number;
          tax_amount: number;
          total: number;
          currency: string;
          status: string;
          notes: string | null;
          payment_terms: string | null;
          bank_details: Json | null;
          tax_config: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          invoice_number: string;
          contact_id?: string | null;
          lead_id?: string | null;
          issue_date?: string;
          due_date?: string | null;
          country?: string | null;
          line_items?: Json;
          subtotal?: number;
          tax_amount?: number;
          total?: number;
          currency?: string;
          status?: string;
          notes?: string | null;
          payment_terms?: string | null;
          bank_details?: Json | null;
          tax_config?: Json | null;
          created_at?: string;
        };
        Update: {
          invoice_number?: string;
          contact_id?: string | null;
          lead_id?: string | null;
          issue_date?: string;
          due_date?: string | null;
          country?: string | null;
          line_items?: Json;
          subtotal?: number;
          tax_amount?: number;
          total?: number;
          currency?: string;
          status?: string;
          notes?: string | null;
          payment_terms?: string | null;
          bank_details?: Json | null;
          tax_config?: Json | null;
        };
        Relationships: [];
      };
      ai_conversations: {
        Row: {
          id: string;
          user_id: string;
          company_id: string;
          messages: Json;
          context_type: string | null;
          context_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          company_id: string;
          messages?: Json;
          context_type?: string | null;
          context_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          messages?: Json;
          context_type?: string | null;
          context_id?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      audit_logs: {
        Row: {
          id: string;
          company_id: string;
          user_id: string | null;
          entity_type: string;
          entity_id: string;
          action: string;
          old_value: Json | null;
          new_value: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          user_id?: string | null;
          entity_type: string;
          entity_id: string;
          action: string;
          old_value?: Json | null;
          new_value?: Json | null;
          created_at?: string;
        };
        Update: Record<string, never>;
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_user_company_id: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      get_user_role: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      generate_invoice_number: {
        Args: { p_company_id: string };
        Returns: string;
      };
      get_dashboard_stats: {
        Args: { p_company_id: string };
        Returns: Json;
      };
      get_pipeline_funnel: {
        Args: { p_company_id: string };
        Returns: { status: string; lead_count: number; total_value: number }[];
      };
      global_search: {
        Args: { p_company_id: string; p_query: string };
        Returns: Json;
      };
      get_revenue_by_month: {
        Args: { p_company_id: string; p_months: number };
        Returns: { month: string; revenue: number; lead_count: number }[];
      };
      get_win_rate_by_user: {
        Args: { p_company_id: string };
        Returns: { user_name: string; total: number; won: number; win_rate: number }[];
      };
      load_demo_data: {
        Args: { p_company_id: string; p_user_id: string };
        Returns: undefined;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

// Convenience types
export type Company = Database["public"]["Tables"]["companies"]["Row"];
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Contact = Database["public"]["Tables"]["contacts"]["Row"];
export type Lead = Database["public"]["Tables"]["leads"]["Row"];
export type Activity = Database["public"]["Tables"]["activities"]["Row"];
export type Invoice = Database["public"]["Tables"]["invoices"]["Row"];
export type AiConversation = Database["public"]["Tables"]["ai_conversations"]["Row"];
export type AuditLog = Database["public"]["Tables"]["audit_logs"]["Row"];

// Extended types with relations
export type LeadWithContact = Lead & {
  contacts: Contact | null;
  profiles: Profile | null;
};

export type ActivityWithRelations = Activity & {
  leads: { title: string } | null;
  contacts: { full_name: string } | null;
  profiles: { name: string } | null;
};

export type InvoiceWithContact = Invoice & {
  contacts: Contact | null;
  leads: { title: string } | null;
};

export type LineItem = {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxable: boolean;
  lineTotal: number;
};
