"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  ArrowLeft,
  Download,
  Send,
  CheckCircle,
  Copy,
  Trash2,
  ExternalLink,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import type { LineItem } from "@/types/database";

interface InvoiceContact {
  id: string;
  full_name: string;
  email: string | null;
  company_name: string | null;
}

interface Invoice {
  id: string;
  invoice_number: string;
  issue_date: string;
  due_date: string | null;
  status: string;
  currency: string;
  subtotal: number;
  tax_amount: number;
  total: number;
  notes: string | null;
  payment_terms: string | null;
  bank_details: { info?: string } | null;
  line_items: LineItem[];
  contacts: InvoiceContact | null;
  leads: { id: string; title: string } | null;
  tax_config: Record<string, unknown> | null;
}

interface InvoiceDetailClientProps {
  invoice: Invoice;
  company: { name: string; country: string | null };
  userRole: string;
}

const STATUS_ACTIONS: Record<string, { label: string; next: string; icon: React.ReactNode; color: string }> = {
  Draft: {
    label: "Mark as Sent",
    next: "Sent",
    icon: <Send className="w-3.5 h-3.5" />,
    color: "bg-blue-600 hover:bg-blue-700 text-white",
  },
  Sent: {
    label: "Mark as Paid",
    next: "Paid",
    icon: <CheckCircle className="w-3.5 h-3.5" />,
    color: "bg-green-600 hover:bg-green-700 text-white",
  },
  Overdue: {
    label: "Mark as Paid",
    next: "Paid",
    icon: <CheckCircle className="w-3.5 h-3.5" />,
    color: "bg-green-600 hover:bg-green-700 text-white",
  },
};

export function InvoiceDetailClient({ invoice: initialInvoice, company, userRole }: InvoiceDetailClientProps) {
  const router = useRouter();
  const [invoice, setInvoice] = useState(initialInvoice);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const canDelete = userRole === "Admin" || userRole === "Manager";
  const statusAction = STATUS_ACTIONS[invoice.status];

  async function updateStatus(newStatus: string) {
    setUpdatingStatus(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("invoices")
      .update({ status: newStatus })
      .eq("id", invoice.id);

    setUpdatingStatus(false);
    if (error) {
      toast.error("Failed to update status");
    } else {
      setInvoice({ ...invoice, status: newStatus });
      toast.success(`Invoice marked as ${newStatus}`);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    const supabase = createClient();
    const { error } = await supabase.from("invoices").delete().eq("id", invoice.id);
    setDeleting(false);
    if (error) {
      toast.error("Failed to delete invoice");
    } else {
      toast.success("Invoice deleted");
      router.push("/invoices");
    }
  }

  async function duplicateInvoice() {
    const supabase = createClient();
    // Generate new invoice number
    const { data: profile } = await supabase
      .from("profiles")
      .select("company_id")
      .single();

    if (!profile?.company_id) return;

    const { data: invoiceNum } = await supabase.rpc("generate_invoice_number", {
      p_company_id: profile.company_id,
    });

    const { data: newInvoice, error } = await supabase
      .from("invoices")
      .insert({
        company_id: profile.company_id,
        invoice_number: invoiceNum ?? "",
        contact_id: invoice.contacts?.id ?? null,
        lead_id: invoice.leads?.id ?? null,
        issue_date: new Date().toISOString().split("T")[0],
        due_date: invoice.due_date,
        country: null,
        line_items: invoice.line_items as never,
        subtotal: invoice.subtotal,
        tax_amount: invoice.tax_amount,
        total: invoice.total,
        currency: invoice.currency,
        status: "Draft",
        notes: invoice.notes,
        payment_terms: invoice.payment_terms,
        bank_details: invoice.bank_details as never,
        tax_config: invoice.tax_config as never,
      })
      .select("id")
      .single();

    if (error) {
      toast.error("Failed to duplicate invoice");
    } else if (newInvoice) {
      toast.success("Invoice duplicated");
      router.push(`/invoices/${newInvoice.id}`);
    }
  }

  const lineItems = invoice.line_items ?? [];

  return (
    <div className="min-h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="text-muted-foreground hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-lg truncate">{invoice.invoice_number}</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <StatusBadge status={invoice.status} type="invoice" />
              <span className="text-sm font-bold text-[#0F1E3C]">
                {formatCurrency(invoice.total, invoice.currency)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {statusAction && (
              <Button
                size="sm"
                className={`h-8 gap-1 ${statusAction.color}`}
                onClick={() => updateStatus(statusAction.next)}
                disabled={updatingStatus}
              >
                {statusAction.icon}
                <span className="hidden sm:inline">{statusAction.label}</span>
              </Button>
            )}
            <a href={`/api/invoices/${invoice.id}/pdf`} target="_blank">
              <Button variant="outline" size="sm" className="h-8 gap-1">
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">PDF</span>
              </Button>
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-4">
        {/* Invoice header card */}
        <div className="bg-white border rounded-xl p-5">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                From
              </p>
              <p className="font-bold text-[#0F1E3C]">{company.name}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Issue Date</p>
              <p className="font-medium text-sm">{formatDate(invoice.issue_date)}</p>
              {invoice.due_date && (
                <>
                  <p className="text-xs text-muted-foreground mt-1">Due Date</p>
                  <p className="font-medium text-sm">{formatDate(invoice.due_date)}</p>
                </>
              )}
            </div>
          </div>

          {invoice.contacts && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Bill To</p>
              <p className="font-semibold text-sm">{invoice.contacts.full_name}</p>
              {invoice.contacts.company_name && (
                <p className="text-xs text-muted-foreground">{invoice.contacts.company_name}</p>
              )}
              {invoice.contacts.email && (
                <p className="text-xs text-muted-foreground">{invoice.contacts.email}</p>
              )}
              <Link
                href={`/contacts/${invoice.contacts.id}`}
                className="text-xs text-[#00C9A7] hover:underline mt-1 inline-flex items-center gap-0.5"
              >
                View contact <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          )}

          {invoice.leads && (
            <div className="mt-3">
              <p className="text-xs text-muted-foreground">
                Linked to:{" "}
                <Link href={`/leads/${invoice.leads.id}`} className="text-[#00C9A7] hover:underline">
                  {invoice.leads.title}
                </Link>
              </p>
            </div>
          )}
        </div>

        {/* Line Items */}
        <div className="bg-white border rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b">
            <h2 className="font-semibold text-sm">Line Items</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 text-xs text-muted-foreground">
                  <th className="text-left px-5 py-2 font-medium">Description</th>
                  <th className="text-right px-5 py-2 font-medium">Qty</th>
                  <th className="text-right px-5 py-2 font-medium">Unit Price</th>
                  <th className="text-right px-5 py-2 font-medium">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {lineItems.map((item, i) => (
                  <tr key={i}>
                    <td className="px-5 py-3 text-sm">{item.description || "—"}</td>
                    <td className="px-5 py-3 text-sm text-right">{item.quantity}</td>
                    <td className="px-5 py-3 text-sm text-right">
                      {formatCurrency(item.unitPrice, invoice.currency)}
                    </td>
                    <td className="px-5 py-3 text-sm font-medium text-right">
                      {formatCurrency(item.lineTotal, invoice.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="border-t px-5 py-4 space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Subtotal</span>
              <span>{formatCurrency(invoice.subtotal, invoice.currency)}</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Tax</span>
              <span>{formatCurrency(invoice.tax_amount, invoice.currency)}</span>
            </div>
            <div className="flex justify-between font-bold text-base border-t pt-2">
              <span>Total</span>
              <span className="text-[#0F1E3C]">
                {formatCurrency(invoice.total, invoice.currency)}
              </span>
            </div>
          </div>
        </div>

        {/* Notes & Payment */}
        {(invoice.notes || invoice.bank_details?.info) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {invoice.notes && (
              <div className="bg-white border rounded-xl p-4">
                <h3 className="font-semibold text-xs text-muted-foreground uppercase mb-2">Notes</h3>
                <p className="text-sm whitespace-pre-wrap text-gray-700">{invoice.notes}</p>
              </div>
            )}
            {invoice.bank_details?.info && (
              <div className="bg-white border rounded-xl p-4">
                <h3 className="font-semibold text-xs text-muted-foreground uppercase mb-2">
                  Payment Details
                </h3>
                <pre className="text-xs font-mono text-gray-700 whitespace-pre-wrap">
                  {invoice.bank_details.info}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* Actions row */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={duplicateInvoice}
          >
            <Copy className="w-3.5 h-3.5" />
            Duplicate
          </Button>
          {canDelete && (
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-red-600 border-red-200 hover:bg-red-50"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </Button>
          )}
        </div>
      </div>

      {/* Delete dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Invoice</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <strong>{invoice.invoice_number}</strong>? This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete Invoice"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
