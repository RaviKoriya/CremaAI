"use client";

import { useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { useCurrency } from "@/contexts/CurrencyContext";
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
import { COUNTRIES, CURRENCIES, TIMEZONES } from "@/lib/constants";

interface Company {
  id: string;
  name: string;
  country: string | null;
  currency: string | null;
  timezone: string | null;
  invoice_prefix: string | null;
  logo_url: string | null;
}

interface CompanySettingsClientProps {
  company: Company;
  userRole: string;
}

export function CompanySettingsClient({ company, userRole }: CompanySettingsClientProps) {
  const { setCurrency: setContextCurrency } = useCurrency();
  const [name, setName] = useState(company.name ?? "");
  const [country, setCountry] = useState(company.country ?? "US");
  const [currency, setCurrency] = useState(company.currency ?? "USD");
  const [timezone, setTimezone] = useState(company.timezone ?? "UTC");
  const [invoicePrefix, setInvoicePrefix] = useState(company.invoice_prefix ?? "INV");
  const [saving, setSaving] = useState(false);

  const isAdmin = userRole === "Admin";

  async function handleSave() {
    if (!name.trim()) {
      toast.error("Company name is required");
      return;
    }
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("companies")
      .update({ name, country, currency, timezone, invoice_prefix: invoicePrefix })
      .eq("id", company.id);

    setSaving(false);
    if (error) {
      toast.error("Failed to save settings");
    } else {
      setContextCurrency(currency);
      toast.success("Settings saved");
    }
  }

  return (
    <div className="space-y-6">
      {!isAdmin && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-800">
          Only Admins can modify company settings.
        </div>
      )}

      <div className="bg-card border rounded-xl p-5 space-y-4">
        <h2 className="font-semibold text-sm">Company Profile</h2>

        <div className="space-y-2">
          <Label htmlFor="name">Company Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={!isAdmin}
            placeholder="Acme Inc."
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Country</Label>
            <Select value={country} onValueChange={(v) => v !== null && setCountry(v)} disabled={!isAdmin}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {COUNTRIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Currency</Label>
            <Select value={currency} onValueChange={(v) => v !== null && setCurrency(v)} disabled={!isAdmin}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Timezone</Label>
            <Select value={timezone} onValueChange={(v) => v !== null && setTimezone(v)} disabled={!isAdmin}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIMEZONES.map((tz) => (
                  <SelectItem key={tz.value} value={tz.value}>{tz.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="prefix">Invoice Prefix</Label>
            <Input
              id="prefix"
              value={invoicePrefix}
              onChange={(e) => setInvoicePrefix(e.target.value.toUpperCase())}
              disabled={!isAdmin}
              placeholder="INV"
              maxLength={6}
            />
            <p className="text-xs text-muted-foreground">
              Invoices will be numbered as {invoicePrefix || "INV"}-2024-0001
            </p>
          </div>
        </div>
      </div>

      {isAdmin && (
        <div className="flex justify-end">
          <Button
            className="bg-primary hover:bg-primary/80 text-white"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      )}
    </div>
  );
}
