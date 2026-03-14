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
import {
  User,
  CalendarDays,
  Receipt,
  Percent,
  FileText,
  CreditCard,
  Send,
  Save,
  Eye,
  ArrowLeft,
  Building2,
} from "lucide-react";

interface InvoiceBuilderProps {
  invoice?: Invoice | null;
  companyId: string;
  preselectedContactId?: string;
  preselectedLeadId?: string;
}

function FieldGroup({
  icon,
  title,
  subtitle,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border bg-card p-5 space-y-4">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0 text-accent">
          {icon}
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">{title}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
      {children}
    </div>
  );
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
  const [issueDate, setIssueDate] = useState(
    invoice?.issue_date ?? new Date().toISOString().split("T")[0]
  );
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
      : [
          {
            id: generateId(),
            description: "",
            quantity: 1,
            unitPrice: 0,
            taxable: true,
            lineTotal: 0,
          } as LineItem,
        ]
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
      bank_details: bankDetails
        ? ({ info: bankDetails } as import("@/types/database").Json)
        : null,
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

  // Full-screen preview mode
  if (showPreview) {
    return (
      <div className="min-h-full bg-background">
        <div className="flex items-center justify-between px-6 py-4 border-b bg-card sticky top-0 z-10">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowPreview(false)}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Editor
          </Button>
          <span className="text-sm font-semibold text-foreground">Invoice Preview</span>
          <div className="w-28" />
        </div>
        <div className="p-6 max-w-3xl mx-auto">
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
    );
  }

  return (
    <div className="min-h-full bg-background">
      {/* Sticky page header */}
      <div className="sticky top-0 z-10 bg-card border-b px-4 sm:px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div>
            <h1 className="text-lg font-bold text-foreground">
              {invoice ? "Edit Invoice" : "New Invoice"}
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {invoice
                ? "Update invoice details and amounts"
                : "Create a professional invoice for your client"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPreview(true)}
              className="gap-1.5 hidden sm:flex"
            >
              <Eye className="w-4 h-4" />
              Preview
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSave("Draft")}
              disabled={loading}
              className="gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span className="hidden sm:inline">Save Draft</span>
            </Button>
            <Button
              size="sm"
              onClick={() => handleSave("Sent")}
              disabled={loading}
              className="gap-1.5"
            >
              <Send className="w-4 h-4" />
              {loading ? "Saving..." : "Save & Send"}
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column: form sections */}
          <div className="lg:col-span-2 space-y-4">
            {/* Bill To */}
            <FieldGroup
              icon={<User className="w-4 h-4" />}
              title="Bill To"
              subtitle="Who is this invoice for?"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-foreground">
                    Contact <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={contactId}
                    onValueChange={(v) => v !== null && setContactId(v)}
                  >
                    <SelectTrigger className="h-11 bg-background">
                      <SelectValue placeholder="Select a contact..." />
                    </SelectTrigger>
                    <SelectContent>
                      {contacts.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.full_name}
                          {c.company_name ? ` · ${c.company_name}` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-foreground">Country</Label>
                  <Select
                    value={country}
                    onValueChange={(v) => v !== null && setCountry(v)}
                  >
                    <SelectTrigger className="h-11 bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Auto-detected from contact · determines tax rules
                  </p>
                </div>
              </div>
            </FieldGroup>

            {/* Invoice Details */}
            <FieldGroup
              icon={<CalendarDays className="w-4 h-4" />}
              title="Invoice Details"
              subtitle="Issue date, due date, currency, and payment terms"
            >
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-foreground">Issue Date</Label>
                  <Input
                    type="date"
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    className="h-11 bg-background"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-foreground">Due Date</Label>
                  <Input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="h-11 bg-background"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-foreground">Currency</Label>
                  <Select
                    value={currency}
                    onValueChange={(v) => v !== null && setCurrency(v)}
                  >
                    <SelectTrigger className="h-11 bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENCIES.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          {c.symbol} {c.value}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-foreground">Payment Terms</Label>
                  <Select
                    value={paymentTerms}
                    onValueChange={(v) => v !== null && setPaymentTerms(v)}
                  >
                    <SelectTrigger className="h-11 bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PAYMENT_TERMS.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </FieldGroup>

            {/* Line Items */}
            <FieldGroup
              icon={<Receipt className="w-4 h-4" />}
              title="Line Items"
              subtitle="Add the products or services you're billing for"
            >
              <LineItemsEditor
                items={lineItems}
                currency={currency}
                onChange={setLineItems}
              />

              {/* Discount */}
              <div className="flex items-center justify-between pt-3 border-t">
                <div>
                  <p className="text-sm font-medium text-foreground">Discount</p>
                  <p className="text-xs text-muted-foreground">
                    Flat amount deducted from subtotal
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground font-medium">{currency}</span>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={discount}
                    onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                    className="h-9 w-28 bg-background text-right"
                  />
                </div>
              </div>
            </FieldGroup>

            {/* Tax */}
            <FieldGroup
              icon={<Percent className="w-4 h-4" />}
              title="Tax"
              subtitle="Rules are automatically applied based on the client's country — override if needed"
            >
              <TaxSelector
                country={country}
                onTaxRuleChange={handleTaxRuleChange}
                gstin={gstin}
                onGstinChange={setGstin}
                registrationNumber={registrationNumber}
                onRegistrationNumberChange={setRegistrationNumber}
              />
            </FieldGroup>

            {/* Notes & Payment */}
            <FieldGroup
              icon={<CreditCard className="w-4 h-4" />}
              title="Notes & Payment Info"
              subtitle="A thank-you note and your bank details appear at the bottom of the invoice"
            >
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-foreground">
                    Notes / Terms
                  </Label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Thank you for your business! Payment is due within the agreed terms."
                    rows={3}
                    className="resize-none bg-background text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-foreground">
                    Bank Details / Payment Link
                  </Label>
                  <Textarea
                    value={bankDetails}
                    onChange={(e) => setBankDetails(e.target.value)}
                    placeholder={
                      "Account name: Your Company\nAccount no: 123456789\nSort code: 01-23-45"
                    }
                    rows={3}
                    className="resize-none font-mono text-xs bg-background"
                  />
                  <p className="text-xs text-muted-foreground">
                    Shown at the bottom of the invoice PDF
                  </p>
                </div>
              </div>
            </FieldGroup>

            {/* Mobile preview button */}
            <Button
              type="button"
              variant="outline"
              className="w-full gap-2 sm:hidden"
              onClick={() => setShowPreview(true)}
            >
              <Eye className="w-4 h-4" />
              Preview Invoice
            </Button>
          </div>

          {/* Right column: summary + actions */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-24 space-y-4">
              {/* Invoice Total Summary */}
              <div className="rounded-2xl border bg-card p-5 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0 text-accent">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Invoice Summary</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Updates live as you build
                    </p>
                  </div>
                </div>

                <div className="space-y-2.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium text-foreground">
                      {formatCurrency(calculation.subtotal, currency)}
                    </span>
                  </div>
                  {calculation.discount > 0 && (
                    <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                      <span>Discount</span>
                      <span>−{formatCurrency(calculation.discount, currency)}</span>
                    </div>
                  )}
                  {calculation.taxBreakdown.map((t) => (
                    <div key={t.name} className="flex justify-between text-muted-foreground">
                      <span>
                        {t.name} ({t.rate}%)
                      </span>
                      <span>{formatCurrency(t.amount, currency)}</span>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="flex justify-between items-baseline">
                  <span className="text-sm font-semibold text-foreground">Total</span>
                  <span className="text-2xl font-bold text-foreground">
                    {formatCurrency(calculation.total, currency)}
                  </span>
                </div>

                <div className="space-y-2 pt-1">
                  <Button
                    type="button"
                    className="w-full gap-2"
                    onClick={() => handleSave("Sent")}
                    disabled={loading}
                  >
                    <Send className="w-4 h-4" />
                    {loading ? "Saving..." : "Save & Send"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full gap-2"
                    onClick={() => handleSave("Draft")}
                    disabled={loading}
                  >
                    <Save className="w-4 h-4" />
                    Save as Draft
                  </Button>
                </div>
              </div>

              {/* Billed To card */}
              {selectedContact && (
                <div className="rounded-2xl border bg-card p-4 space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Billed To
                  </p>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-accent" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {selectedContact.full_name}
                      </p>
                      {selectedContact.company_name && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Building2 className="w-3 h-3" />
                          {selectedContact.company_name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
