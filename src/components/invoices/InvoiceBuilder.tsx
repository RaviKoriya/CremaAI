"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { LineItemsEditor } from "./LineItemsEditor";
import { TaxSelector } from "./TaxSelector";
import { InvoicePreview } from "./InvoicePreview";
import { recalculate } from "@/lib/tax/engine";
import { getTaxRule } from "@/lib/tax/rules";
import { CURRENCIES, COUNTRIES, PAYMENT_TERMS } from "@/lib/constants";
import { generateId, formatCurrency } from "@/lib/utils";
import type { LineItem, TaxRule } from "@/lib/tax/types";
import type { Contact, Invoice } from "@/types/database";
import { Eye, EyeOff, Send, Save, Download } from "lucide-react";

interface InvoiceBuilderProps {
  invoice?: Invoice | null;
  companyId: string;
  preselectedContactId?: string;
  preselectedLeadId?: string;
}

export function InvoiceBuilder({
  invoice,
  companyId,
  preselectedContactId,
  preselectedLeadId,
}: InvoiceBuilderProps) {
  const router = useRouter();
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(false);

  const [contacts, setContacts] = useState<Contact[]>([]);

  // Invoice fields
  const [contactId, setContactId] = useState(preselectedContactId ?? invoice?.contact_id ?? "");
  const [leadId] = useState(preselectedLeadId ?? invoice?.lead_id ?? "");
  const [issueDate, setIssueDate] = useState(invoice?.issue_date ?? new Date().toISOString().split("T")[0]);
  const [dueDate, setDueDate] = useState(invoice?.due_date ?? "");
  const [currency, setCurrency] = useState(invoice?.currency ?? "USD");
  const [country, setCountry] = useState(invoice?.country ?? "US");
  const [paymentTerms, setPaymentTerms] = useState(invoice?.payment_terms ?? "Net 30");
  const [notes, setNotes] = useState(invoice?.notes ?? "");
  const [bankDetails, setBankDetails] = useState(
    (invoice?.bank_details as { info?: string } | null)?.info ?? ""
  );

  // Tax state
  const [taxRule, setTaxRule] = useState<TaxRule>(getTaxRule(country));
  const [customTaxRate, setCustomTaxRate] = useState<number | undefined>(undefined);
  const [gstin, setGstin] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [discount, setDiscount] = useState(0);

  // Line items
  const [lineItems, setLineItems] = useState<LineItem[]>(
    invoice?.line_items
      ? (invoice.line_items as unknown as LineItem[])
      : [{ id: generateId(), description: "", quantity: 1, unitPrice: 0, taxable: true, lineTotal: 0 } as LineItem]
  );

  const calculation = recalculate(lineItems, country, customTaxRate, discount);

  useEffect(() => {
    createClient()
      .from("contacts")
      .select("id, full_name, company_name, country")
      .eq("company_id", companyId)
      .order("full_name")
      .limit(100)
      .then(({ data }) => {
        if (data) setContacts(data as Contact[]);
      });
  }, [companyId]);

  // Update country when contact changes
  useEffect(() => {
    if (contactId) {
      const contact = contacts.find((c) => c.id === contactId);
      if (contact?.country) setCountry(contact.country);
    }
  }, [contactId, contacts]);

  const handleTaxRuleChange = useCallback((rule: TaxRule, customRate?: number) => {
    setTaxRule(rule);
    setCustomTaxRate(customRate);
  }, []);

  async function handleSave(status: "Draft" | "Sent" = "Draft") {
    setLoading(true);
    const supabase = createClient();

    const payload = {
      company_id: companyId,
      contact_id: contactId || null,
      lead_id: leadId || null,
      issue_date: issueDate,
      due_date: dueDate || null,
      currency,
      country,
      line_items: lineItems as unknown as import("@/types/database").Json,
      subtotal: calculation.subtotal,
      tax_amount: calculation.totalTax,
      total: calculation.total,
      status,
      notes: notes || null,
      payment_terms: paymentTerms || null,
      bank_details: bankDetails ? { info: bankDetails } as import("@/types/database").Json : null,
      tax_config: {
        rule: taxRule,
        customRate: customTaxRate,
        gstin,
        registrationNumber,
        discount,
      } as unknown as import("@/types/database").Json,
    };

    if (invoice) {
      const { error } = await supabase
        .from("invoices")
        .update(payload)
        .eq("id", invoice.id);

      setLoading(false);
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Invoice saved");
        router.push(`/invoices/${invoice.id}`);
      }
    } else {
      // Generate invoice number server-side
      const { data: invoiceNumber } = await supabase.rpc("generate_invoice_number", {
        p_company_id: companyId,
      });

      const { data, error } = await supabase
        .from("invoices")
        .insert({ ...payload, invoice_number: invoiceNumber ?? `INV-${Date.now()}` })
        .select()
        .single();

      setLoading(false);
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Invoice created");
        router.push(`/invoices/${data.id}`);
      }
    }
  }

  const selectedContact = contacts.find((c) => c.id === contactId);

  return (
    <div className="flex h-full gap-0">
      {/* Builder panel */}
      <div className={`flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 ${showPreview ? "hidden lg:block" : ""}`}>
        {/* Header actions */}
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-lg">{invoice ? "Edit Invoice" : "New Invoice"}</h2>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
              className="gap-1.5"
            >
              {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span className="hidden sm:inline">Preview</span>
            </Button>
          </div>
        </div>

        {/* Contact & Lead */}
        <div className="bg-white border rounded-xl p-4 space-y-4">
          <h3 className="font-semibold text-sm">Bill To</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Contact *</Label>
              <Select value={contactId} onValueChange={(v) => v !== null && setContactId(v)}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Select contact..." />
                </SelectTrigger>
                <SelectContent>
                  {contacts.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.full_name}{c.company_name ? ` · ${c.company_name}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Country (determines tax)</Label>
              <Select value={country} onValueChange={(v) => v !== null && setCountry(v)}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COUNTRIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Dates & Terms */}
        <div className="bg-white border rounded-xl p-4 space-y-4">
          <h3 className="font-semibold text-sm">Invoice Details</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Issue Date</Label>
              <Input type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} className="h-9" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Due Date</Label>
              <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="h-9" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Currency</Label>
              <Select value={currency} onValueChange={(v) => v !== null && setCurrency(v)}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>{c.symbol} {c.value}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Payment Terms</Label>
              <Select value={paymentTerms} onValueChange={(v) => v !== null && setPaymentTerms(v)}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_TERMS.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="bg-white border rounded-xl p-4 space-y-4">
          <h3 className="font-semibold text-sm">Line Items</h3>
          <LineItemsEditor items={lineItems} currency={currency} onChange={setLineItems} />

          {/* Discount */}
          <div className="flex items-center gap-3 pt-2">
            <Label className="text-xs whitespace-nowrap">Discount Amount ({currency})</Label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={discount}
              onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
              className="h-8 w-32"
            />
          </div>
        </div>

        {/* Tax */}
        <div className="bg-white border rounded-xl p-4 space-y-4">
          <h3 className="font-semibold text-sm">Tax Configuration</h3>
          <TaxSelector
            country={country}
            onTaxRuleChange={handleTaxRuleChange}
            gstin={gstin}
            onGstinChange={setGstin}
            registrationNumber={registrationNumber}
            onRegistrationNumberChange={setRegistrationNumber}
          />

          {/* Tax Summary */}
          <Separator />
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span>{formatCurrency(calculation.subtotal, currency)}</span>
            </div>
            {calculation.discount > 0 && (
              <div className="flex justify-between text-muted-foreground">
                <span>Discount</span>
                <span>-{formatCurrency(calculation.discount, currency)}</span>
              </div>
            )}
            {calculation.taxBreakdown.map((t) => (
              <div key={t.name} className="flex justify-between text-muted-foreground">
                <span>{t.name} ({t.rate}%)</span>
                <span>{formatCurrency(t.amount, currency)}</span>
              </div>
            ))}
            <Separator />
            <div className="flex justify-between font-bold text-base">
              <span>Total</span>
              <span className="text-[#0F1E3C]">{formatCurrency(calculation.total, currency)}</span>
            </div>
          </div>
        </div>

        {/* Notes & Payment */}
        <div className="bg-white border rounded-xl p-4 space-y-4">
          <h3 className="font-semibold text-sm">Notes & Payment Info</h3>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label className="text-xs">Notes / Terms</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Thank you for your business..."
                rows={3}
                className="resize-none"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Bank Details / Payment Link</Label>
              <Textarea
                value={bankDetails}
                onChange={(e) => setBankDetails(e.target.value)}
                placeholder="Account name: Your Company&#10;Account no: 123456789&#10;Sort code: 01-23-45"
                rows={3}
                className="resize-none font-mono text-xs"
              />
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 pb-8">
          <Button
            type="button"
            variant="outline"
            className="flex-1 gap-1.5"
            onClick={() => handleSave("Draft")}
            disabled={loading}
          >
            <Save className="w-4 h-4" />
            Save Draft
          </Button>
          <Button
            type="button"
            className="flex-1 bg-[#0F1E3C] hover:bg-[#1a2f5e] text-white gap-1.5"
            onClick={() => handleSave("Sent")}
            disabled={loading}
          >
            <Send className="w-4 h-4" />
            {loading ? "Saving..." : "Save & Send"}
          </Button>
        </div>
      </div>

      {/* Preview panel (desktop side-by-side) */}
      {showPreview && (
        <div className="w-full lg:w-[480px] border-l bg-gray-100 overflow-y-auto">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm">Preview</h3>
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5"
                onClick={() => {/* PDF download */}}
              >
                <Download className="w-4 h-4" />
                Download PDF
              </Button>
            </div>
            <InvoicePreview
              invoiceNumber={invoice?.invoice_number ?? "PREVIEW"}
              contact={selectedContact ?? null}
              lineItems={lineItems}
              calculation={calculation}
              currency={currency}
              issueDate={issueDate}
              dueDate={dueDate}
              notes={notes}
              bankDetails={bankDetails}
              paymentTerms={paymentTerms}
              taxBreakdown={calculation.taxBreakdown}
              gstin={gstin}
              registrationNumber={registrationNumber}
            />
          </div>
        </div>
      )}
    </div>
  );
}
