"use client";

import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { contactSchema, type ContactFormValues } from "@/lib/validations/contact";
import { LEAD_SOURCES, COUNTRIES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle } from "lucide-react";
import type { Contact } from "@/types/database";

interface ContactFormProps {
  contact?: Contact | null;
  companyId: string;
  onSuccess?: (contact: Contact) => void;
  onCancel?: () => void;
}

function FieldGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border bg-muted/30 p-4 space-y-3">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{title}</p>
      {children}
    </div>
  );
}

export function ContactForm({ contact, companyId, onSuccess, onCancel }: ContactFormProps) {
  const [loading, setLoading] = useState(false);
  const [duplicate, setDuplicate] = useState<Contact | null>(null);
  const isEdit = !!contact;

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      full_name: contact?.full_name ?? "",
      email: contact?.email ?? "",
      phone: contact?.phone ?? "",
      company_name: contact?.company_name ?? "",
      country: contact?.country ?? "",
      city: contact?.city ?? "",
      source: contact?.source ?? "",
      tags: contact?.tags ?? [],
    },
  });

  const checkDuplicate = useCallback(async (email: string, phone: string) => {
    if (!email && !phone) return;
    const res = await fetch(
      `/api/contacts/check-duplicate?email=${encodeURIComponent(email)}&phone=${encodeURIComponent(phone)}&companyId=${companyId}&excludeId=${contact?.id ?? ""}`
    );
    if (res.ok) {
      const data = await res.json();
      setDuplicate(data.duplicate ?? null);
    }
  }, [companyId, contact?.id]);

  async function onSubmit(values: ContactFormValues) {
    setLoading(true);
    const supabase = createClient();
    const payload = {
      ...values,
      company_id: companyId,
      email: values.email || null,
      phone: values.phone || null,
      company_name: values.company_name || null,
      country: values.country || null,
      city: values.city || null,
      source: values.source || null,
    };
    const { data, error } = contact
      ? await supabase.from("contacts").update(payload).eq("id", contact.id).select().single()
      : await supabase.from("contacts").insert(payload).select().single();
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(contact ? "Contact updated" : "Contact created!");
      onSuccess?.(data as Contact);
    }
  }

  return (
    <div className="flex flex-col h-full bg-card">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b">
        <div>
          <h2 className="text-xl font-bold text-foreground">
            {isEdit ? "Edit Contact" : "New Contact"}
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {isEdit ? "Update contact details" : "Add someone to your network"}
          </p>
        </div>
      </div>

      {/* Scrollable body */}
      <form
        id="contact-form"
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex-1 overflow-y-auto px-6 py-5 space-y-4"
      >
        {/* Identity */}
        <FieldGroup title="Identity">
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-foreground">
              Full name <span className="text-destructive">*</span>
            </Label>
            <Input
              {...form.register("full_name")}
              placeholder="John Smith"
              className="h-11 bg-card"
              autoFocus
            />
            {form.formState.errors.full_name && (
              <p className="text-xs text-destructive">{form.formState.errors.full_name.message}</p>
            )}
          </div>
        </FieldGroup>

        {/* Contact Details */}
        <FieldGroup title="Contact Details">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-foreground">Email</Label>
              <Input
                type="email"
                {...form.register("email")}
                placeholder="john@company.com"
                className="h-11 bg-card"
                onBlur={(e) => checkDuplicate(e.target.value, form.watch("phone") ?? "")}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-foreground">Phone</Label>
              <Input
                {...form.register("phone")}
                placeholder="+1 555 0100"
                className="h-11 bg-card"
                onBlur={(e) => checkDuplicate(form.watch("email") ?? "", e.target.value)}
              />
            </div>
          </div>

          {duplicate && (
            <div className="flex items-start gap-2.5 p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl">
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-800 dark:text-amber-400">Possible duplicate</p>
                <p className="text-xs text-amber-700 dark:text-amber-500 mt-0.5">
                  <strong>{duplicate.full_name}</strong> already exists with this email or phone.
                </p>
              </div>
            </div>
          )}
        </FieldGroup>

        {/* Organisation */}
        <FieldGroup title="Organisation">
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-foreground">Company</Label>
            <Input
              {...form.register("company_name")}
              placeholder="Acme Corp"
              className="h-11 bg-card"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-foreground">Country</Label>
              <Select
                value={form.watch("country") ?? ""}
                onValueChange={(v) => form.setValue("country", v)}
              >
                <SelectTrigger className="h-11 bg-card">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  {COUNTRIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-foreground">City</Label>
              <Input
                {...form.register("city")}
                placeholder="New York"
                className="h-11 bg-card"
              />
            </div>
          </div>
        </FieldGroup>

        {/* Source */}
        <FieldGroup title="Source">
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-foreground">How did you find them?</Label>
            <Select
              value={form.watch("source") ?? ""}
              onValueChange={(v) => form.setValue("source", v)}
            >
              <SelectTrigger className="h-11 bg-card">
                <SelectValue placeholder="Select a source..." />
              </SelectTrigger>
              <SelectContent>
                {LEAD_SOURCES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </FieldGroup>
      </form>

      {/* Footer */}
      <div className="flex-shrink-0 border-t bg-card px-6 py-4 flex gap-3">
        <Button
          type="submit"
          form="contact-form"
          className="flex-1 h-11 font-semibold"
          disabled={loading}
        >
          {loading ? "Saving..." : isEdit ? "Save Changes" : "Create Contact"}
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
