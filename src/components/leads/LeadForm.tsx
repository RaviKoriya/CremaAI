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
import { Flame, TrendingUp, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Lead, Contact, Profile } from "@/types/database";

interface LeadFormProps {
  lead?: Lead | null;
  companyId: string;
  onSuccess?: (lead: Lead) => void;
  onCancel?: () => void;
}

const PRIORITY_CONFIG = {
  Low:    { icon: Minus,      color: "text-slate-500",  activeBg: "bg-slate-100 dark:bg-slate-800",  activeBorder: "border-slate-400",  label: "Low" },
  Medium: { icon: TrendingUp, color: "text-orange-500", activeBg: "bg-orange-50 dark:bg-orange-950", activeBorder: "border-orange-400", label: "Medium" },
  High:   { icon: Flame,      color: "text-red-500",    activeBg: "bg-red-50 dark:bg-red-950",       activeBorder: "border-red-400",    label: "High" },
};

function FieldGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border bg-muted/30 p-4 space-y-3">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{title}</p>
      {children}
    </div>
  );
}

export function LeadForm({ lead, companyId, onSuccess, onCancel }: LeadFormProps) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [teamMembers, setTeamMembers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const isEdit = !!lead;

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

  const priority = form.watch("priority");
  const currency = form.watch("currency");
  const currencySymbol = CURRENCIES.find((c) => c.value === currency)?.symbol ?? "$";

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
      toast.success(lead ? "Lead updated" : "Lead created!");
      onSuccess?.(data as Lead);
    }
  }

  return (
    <div className="flex flex-col h-full bg-card">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b">
        <div>
          <h2 className="text-xl font-bold text-foreground">
            {isEdit ? "Edit Lead" : "New Lead"}
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {isEdit ? "Update opportunity details" : "Add a new sales opportunity"}
          </p>
        </div>
      </div>

      {/* Scrollable body */}
      <form
        id="lead-form"
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex-1 overflow-y-auto px-6 py-5 space-y-4"
      >
        {/* Lead Info */}
        <FieldGroup title="Lead Info">
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-foreground">
              Lead title <span className="text-destructive">*</span>
            </Label>
            <Input
              {...form.register("title")}
              placeholder="e.g. Website Redesign for Acme Corp"
              className="h-11 bg-card"
              autoFocus
            />
            {form.formState.errors.title && (
              <p className="text-xs text-destructive">{form.formState.errors.title.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-foreground">Contact</Label>
            <Select
              value={form.watch("contact_id") ?? "none"}
              onValueChange={(v) => form.setValue("contact_id", v === "none" ? null : v)}
            >
              <SelectTrigger className="h-11 bg-card">
                <SelectValue placeholder="Link a contact..." />
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
        </FieldGroup>

        {/* Deal Value */}
        <FieldGroup title="Deal Value">
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2 space-y-1.5">
              <Label className="text-sm font-medium text-foreground">Amount</Label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground">
                  {currencySymbol}
                </span>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  {...form.register("value", { valueAsNumber: true })}
                  className="h-11 pl-8 bg-card font-semibold"
                  placeholder="0.00"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-foreground">Currency</Label>
              <Select value={currency} onValueChange={(v) => v && form.setValue("currency", v)}>
                <SelectTrigger className="h-11 bg-card">
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
        </FieldGroup>

        {/* Stage & Priority */}
        <FieldGroup title="Stage & Priority">
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-foreground">Pipeline stage</Label>
            <Select
              value={form.watch("status")}
              onValueChange={(v) => form.setValue("status", v as LeadFormValues["status"])}
            >
              <SelectTrigger className="h-11 bg-card">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LEAD_STATUSES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-foreground">Priority</Label>
            <div className="grid grid-cols-3 gap-2">
              {PRIORITIES.map((p) => {
                const cfg = PRIORITY_CONFIG[p.value as keyof typeof PRIORITY_CONFIG];
                const Icon = cfg.icon;
                const isSelected = priority === p.value;
                return (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => form.setValue("priority", p.value as LeadFormValues["priority"])}
                    className={cn(
                      "flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all",
                      isSelected
                        ? `${cfg.activeBg} ${cfg.activeBorder} ${cfg.color}`
                        : "bg-card border-border text-muted-foreground hover:border-muted-foreground"
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {p.value}
                  </button>
                );
              })}
            </div>
          </div>
        </FieldGroup>

        {/* Timeline & Assignment */}
        <FieldGroup title="Timeline & Assignment">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-foreground">Source</Label>
              <Select
                value={form.watch("source") ?? "none"}
                onValueChange={(v) => form.setValue("source", v === "none" ? null : v)}
              >
                <SelectTrigger className="h-11 bg-card">
                  <SelectValue placeholder="Unknown" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Unknown</SelectItem>
                  {LEAD_SOURCES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-foreground">Close date</Label>
              <Input
                type="date"
                {...form.register("expected_close_date")}
                className="h-11 bg-card"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-foreground">Assigned to</Label>
            <Select
              value={form.watch("assigned_to") ?? "none"}
              onValueChange={(v) => form.setValue("assigned_to", v === "none" ? null : v)}
            >
              <SelectTrigger className="h-11 bg-card">
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
        </FieldGroup>

        {/* Notes */}
        <FieldGroup title="Notes">
          <Textarea
            {...form.register("notes")}
            placeholder="Key context, pain points, next steps..."
            rows={3}
            className="resize-none bg-card text-sm"
          />
        </FieldGroup>
      </form>

      {/* Footer */}
      <div className="flex-shrink-0 border-t bg-card px-6 py-4 flex gap-3">
        <Button
          type="submit"
          form="lead-form"
          className="flex-1 h-11 font-semibold"
          disabled={loading}
        >
          {loading ? "Saving..." : isEdit ? "Save Changes" : "Create Lead"}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} className="h-11 px-6">
            Cancel
          </Button>
        )}
      </div>
    </div>
  );
}
