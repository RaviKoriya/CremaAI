"use client";

import { formatDate, formatCurrency } from "@/lib/utils";
import type { LineItem, TaxBreakdownItem } from "@/lib/tax/types";
import type { Contact } from "@/types/database";

interface InvoicePreviewProps {
  invoiceNumber: string;
  contact: Contact | null;
  lineItems: LineItem[];
  calculation: {
    subtotal: number;
    discount: number;
    totalTax: number;
    total: number;
  };
  currency: string;
  issueDate: string;
  dueDate: string;
  notes: string;
  bankDetails: string;
  paymentTerms: string;
  taxBreakdown: TaxBreakdownItem[];
  gstin?: string;
  registrationNumber?: string;
}

export function InvoicePreview({
  invoiceNumber,
  contact,
  lineItems,
  calculation,
  currency,
  issueDate,
  dueDate,
  notes,
  bankDetails,
  paymentTerms,
  taxBreakdown,
  gstin,
}: InvoicePreviewProps) {
  return (
    <div className="bg-card rounded-xl shadow-sm p-6 text-sm space-y-6 min-h-[600px]">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center mb-3">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M3 3h8v8H3V3zm10 0h8v8h-8V3zm-10 10h8v8H3v-8zm13 4a4 4 0 100-8 4 4 0 000 8z" fill="white" />
            </svg>
          </div>
          <h2 className="font-bold text-xl text-primary">INVOICE</h2>
          <p className="text-muted-foreground text-xs">{invoiceNumber}</p>
        </div>
        <div className="text-right text-xs space-y-0.5">
          <div className="text-muted-foreground">Issue Date</div>
          <div className="font-medium">{issueDate ? formatDate(issueDate) : "—"}</div>
          {dueDate && (
            <>
              <div className="text-muted-foreground mt-1">Due Date</div>
              <div className="font-semibold text-red-600">{formatDate(dueDate)}</div>
            </>
          )}
          {paymentTerms && (
            <>
              <div className="text-muted-foreground mt-1">Terms</div>
              <div className="font-medium">{paymentTerms}</div>
            </>
          )}
        </div>
      </div>

      {/* Bill To */}
      {contact && (
        <div className="border-t pt-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1.5">Bill To</p>
          <p className="font-semibold">{contact.full_name}</p>
          {contact.company_name && <p className="text-muted-foreground">{contact.company_name}</p>}
          {contact.email && <p className="text-muted-foreground">{contact.email}</p>}
        </div>
      )}

      {/* GSTIN */}
      {gstin && (
        <div className="text-xs">
          <span className="text-muted-foreground">GSTIN: </span>
          <span className="font-mono font-medium">{gstin}</span>
        </div>
      )}

      {/* Line Items */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-xs">
          <thead className="bg-muted">
            <tr className="text-muted-foreground">
              <th className="text-left px-3 py-2 font-medium">Description</th>
              <th className="text-right px-3 py-2 font-medium">Qty</th>
              <th className="text-right px-3 py-2 font-medium">Price</th>
              <th className="text-right px-3 py-2 font-medium">Total</th>
            </tr>
          </thead>
          <tbody>
            {lineItems.filter((i) => i.description || i.unitPrice > 0).map((item) => (
              <tr key={item.id} className="border-t">
                <td className="px-3 py-2">{item.description || "—"}</td>
                <td className="px-3 py-2 text-right">{item.quantity}</td>
                <td className="px-3 py-2 text-right">{formatCurrency(item.unitPrice, currency)}</td>
                <td className="px-3 py-2 text-right font-medium">
                  {formatCurrency(item.lineTotal ?? item.quantity * item.unitPrice, currency)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="space-y-1.5">
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
        {taxBreakdown.map((t) => (
          <div key={t.name} className="flex justify-between text-muted-foreground">
            <span>{t.name} ({t.rate}%)</span>
            <span>{formatCurrency(t.amount, currency)}</span>
          </div>
        ))}
        <div className="flex justify-between font-bold text-base border-t pt-1.5 mt-1.5">
          <span>Total</span>
          <span className="text-foreground">{formatCurrency(calculation.total, currency)}</span>
        </div>
      </div>

      {/* Notes */}
      {notes && (
        <div className="border-t pt-4 text-xs">
          <p className="text-muted-foreground uppercase tracking-wide mb-1">Notes</p>
          <p className="text-muted-foreground whitespace-pre-wrap">{notes}</p>
        </div>
      )}

      {/* Bank Details */}
      {bankDetails && (
        <div className="border-t pt-4 text-xs bg-muted rounded-lg p-3">
          <p className="text-muted-foreground uppercase tracking-wide mb-1">Payment Details</p>
          <p className="font-mono text-muted-foreground whitespace-pre-wrap">{bankDetails}</p>
        </div>
      )}
    </div>
  );
}
