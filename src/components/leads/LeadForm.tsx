"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { leadSchema, type LeadFormValues } from "@/lib/validations/lead";
import { LEAD_STATUSES, PRIORITIES, LEAD_SOURCES, CURRENCIES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Lead, Contact, Profile } from "@/types/database";

interface LeadFormProps {
  lead?: Lead | null;
  companyId: string;
  onSuccess?: (lead: Lead) => void;
  onCancel?: () => void;
}

export function LeadForm({ lead, companyId, onSuccess, onCancel }: LeadFormProps) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [teamMembers, setTeamMembers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);

  const form = useForm<LeadFormValues>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      title: lead?.title ?? "",
      contact_id: lead?.contact_id ?? null,
      value: lead?.value ?? 0,
      currency: lead?.currency ?? "USD",
      status: (lead?.status as LeadFormValues["status"]) ?? "New",
      priority: (lead?.priority as LeadFormValues["priority"]) ?? "Medium",
      assigned_to: lead?.assigned_to ?? null,
      expected_close_date: lead?.expected_close_date ?? null,
      notes: lead?.notes ?? "",
      source: lead?.source ?? null,
    },
  });

  useEffect(() => {
    const supabase = createClient();

    Promise.all([
      supabase.from("contacts").select("id, full_name, company_name").eq("company_id", companyId).order("full_name").limit(100),
      supabase.from("profiles").select("id, name").eq("company_id", companyId).order("name"),
    ]).then(([contactsRes, profilesRes]) => {
      if (contactsRes.data) setContacts(contactsRes.data as unknown as Contact[]);
      if (profilesRes.data) setTeamMembers(profilesRes.data as Profile[]);
    });
  }, [companyId]);

  async function onSubmit(values: LeadFormValues) {
    setLoading(true);
    const supabase = createClient();

    const payload = {
      ...values,
      company_id: companyId,
      contact_id: values.contact_id || null,
      assigned_to: values.assigned_to || null,
    };

    const { data, error } = lead
      ? await supabase.from("leads").update(payload).eq("id", lead.id).select().single()
      : await supabase.from("leads").insert(payload).select().single();

    setLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success(lead ? "Lead updated" : "Lead created");
      onSuccess?.(data as Lead);
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label>Lead title *</Label>
        <Input {...form.register("title")} placeholder="e.g. Website Redesign Project" className="h-10" />
        {form.formState.errors.title && (
          <p className="text-xs text-red-500">{form.formState.errors.title.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Contact</Label>
        <Select
          value={form.watch("contact_id") ?? "none"}
          onValueChange={(v) => form.setValue("contact_id", v === "none" ? null : v)}
        >
          <SelectTrigger className="h-10">
            <SelectValue placeholder="Select contact..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No contact</SelectItem>
            {contacts.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.full_name}{(c as Contact & { company_name?: string }).company_name ? ` · ${(c as Contact & { company_name: string }).company_name}` : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Deal value</Label>
          <Input
            type="number"
            min="0"
            step="0.01"
            {...form.register("value", { valueAsNumber: true })}
            className="h-10"
          />
        </div>
        <div className="space-y-2">
          <Label>Currency</Label>
          <Select value={form.watch("currency")} onValueChange={(v) => v !== null && form.setValue("currency", v)}>
            <SelectTrigger className="h-10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CURRENCIES.map((c) => (
                <SelectItem key={c.value} value={c.value}>{c.symbol} {c.value}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Status</Label>
          <Select
            value={form.watch("status")}
            onValueChange={(v) => form.setValue("status", v as LeadFormValues["status"])}
          >
            <SelectTrigger className="h-10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LEAD_STATUSES.map((s) => (
                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Priority</Label>
          <Select
            value={form.watch("priority")}
            onValueChange={(v) => form.setValue("priority", v as LeadFormValues["priority"])}
          >
            <SelectTrigger className="h-10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PRIORITIES.map((p) => (
                <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Source</Label>
          <Select
            value={form.watch("source") ?? "none"}
            onValueChange={(v) => form.setValue("source", v === "none" ? null : v)}
          >
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Unknown</SelectItem>
              {LEAD_SOURCES.map((s) => (
                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Expected close</Label>
          <Input
            type="date"
            {...form.register("expected_close_date")}
            className="h-10"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Assigned to</Label>
        <Select
          value={form.watch("assigned_to") ?? "none"}
          onValueChange={(v) => form.setValue("assigned_to", v === "none" ? null : v)}
        >
          <SelectTrigger className="h-10">
            <SelectValue placeholder="Unassigned" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Unassigned</SelectItem>
            {teamMembers.map((m) => (
              <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Notes</Label>
        <Textarea
          {...form.register("notes")}
          placeholder="Any relevant notes..."
          rows={3}
          className="resize-none"
        />
      </div>

      <div className="flex gap-3 pt-2">
        <Button
          type="submit"
          className="flex-1 bg-[#0F1E3C] hover:bg-[#1a2f5e] text-white h-10"
          disabled={loading}
        >
          {loading ? "Saving..." : lead ? "Update Lead" : "Create Lead"}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} className="h-10">
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
