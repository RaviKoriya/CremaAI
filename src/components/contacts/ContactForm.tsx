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

export function ContactForm({ contact, companyId, onSuccess, onCancel }: ContactFormProps) {
  const [loading, setLoading] = useState(false);
  const [duplicate, setDuplicate] = useState<Contact | null>(null);

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
    const res = await fetch(`/api/contacts/check-duplicate?email=${encodeURIComponent(email)}&phone=${encodeURIComponent(phone)}&companyId=${companyId}&excludeId=${contact?.id ?? ""}`);
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
      toast.success(contact ? "Contact updated" : "Contact created");
      onSuccess?.(data as Contact);
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label>Full name *</Label>
        <Input {...form.register("full_name")} placeholder="John Smith" className="h-10" />
        {form.formState.errors.full_name && (
          <p className="text-xs text-red-500">{form.formState.errors.full_name.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Email</Label>
          <Input
            type="email"
            {...form.register("email")}
            placeholder="john@company.com"
            className="h-10"
            onBlur={(e) => checkDuplicate(e.target.value, form.watch("phone") ?? "")}
          />
        </div>
        <div className="space-y-2">
          <Label>Phone</Label>
          <Input
            {...form.register("phone")}
            placeholder="+1 555 0100"
            className="h-10"
            onBlur={(e) => checkDuplicate(form.watch("email") ?? "", e.target.value)}
          />
        </div>
      </div>

      {/* Duplicate warning */}
      {duplicate && (
        <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm">
          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-amber-800">Possible duplicate</p>
            <p className="text-amber-700">
              A contact named <strong>{duplicate.full_name}</strong> already exists with this email/phone.
            </p>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label>Company</Label>
        <Input {...form.register("company_name")} placeholder="Acme Corp" className="h-10" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Country</Label>
          <Select
            value={form.watch("country") ?? ""}
            onValueChange={(v) => form.setValue("country", v)}
          >
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent>
              {COUNTRIES.map((c) => (
                <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>City</Label>
          <Input {...form.register("city")} placeholder="New York" className="h-10" />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Source</Label>
        <Select
          value={form.watch("source") ?? ""}
          onValueChange={(v) => form.setValue("source", v)}
        >
          <SelectTrigger className="h-10">
            <SelectValue placeholder="How did you find them?" />
          </SelectTrigger>
          <SelectContent>
            {LEAD_SOURCES.map((s) => (
              <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-3 pt-2">
        <Button
          type="submit"
          className="flex-1 bg-[#0F1E3C] hover:bg-[#1a2f5e] text-white h-10"
          disabled={loading}
        >
          {loading ? "Saving..." : contact ? "Update Contact" : "Create Contact"}
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
