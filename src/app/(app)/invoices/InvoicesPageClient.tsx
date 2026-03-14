"use client";

import Link from "next/link";
import { Plus, FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { formatCurrency, formatDate } from "@/lib/utils";
import { INVOICE_STATUSES } from "@/lib/constants";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/contexts/CurrencyContext";

interface Invoice {
  id: string;
  invoice_number: string;
  total: number;
  currency: string;
  status: string;
  issue_date: string;
  due_date: string | null;
  contacts: { id: string; full_name: string; company_name: string | null } | null;
}

interface InvoicesPageClientProps {
  invoices: Invoice[];
  companyId: string;
}

export function InvoicesPageClient({ invoices }: InvoicesPageClientProps) {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { currency } = useCurrency();

  const filtered = statusFilter === "all"
    ? invoices
    : invoices.filter((i) => i.status === statusFilter);

  const totalOutstanding = invoices
    .filter((i) => i.status === "Sent" || i.status === "Overdue")
    .reduce((sum, i) => sum + i.total, 0);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-4 gap-3 border-b bg-card">
        <div>
          <h1 className="font-bold text-lg">Invoices</h1>
          <p className="text-xs text-muted-foreground">
            {invoices.length} total · Outstanding: {formatCurrency(totalOutstanding, currency)}
          </p>
        </div>
        <Link href="/invoices/new">
          <Button className="bg-primary hover:bg-primary/80 text-primary-foreground h-9 gap-1.5" size="sm">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Invoice</span>
          </Button>
        </Link>
      </div>

      {/* Status filter tabs */}
      <div className="flex items-center gap-2 px-4 sm:px-6 py-3 border-b bg-card overflow-x-auto">
        <button
          onClick={() => setStatusFilter("all")}
          className={cn(
            "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors",
            statusFilter === "all"
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground hover:bg-muted"
          )}
        >
          All ({invoices.length})
        </button>
        {INVOICE_STATUSES.map((s) => {
          const count = invoices.filter((i) => i.status === s.value).length;
          return (
            <button
              key={s.value}
              onClick={() => setStatusFilter(s.value)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors",
                statusFilter === s.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-muted"
              )}
            >
              {s.label} {count > 0 && `(${count})`}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 sm:p-6">
        {filtered.length === 0 ? (
          <EmptyState
            title="No invoices yet"
            description="Create your first invoice to start billing clients"
            icon={<FileText className="w-12 h-12 mx-auto text-gray-300" />}
            action={{
              label: "Create first invoice →",
              onClick: () => window.location.href = "/invoices/new",
            }}
          />
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden sm:block bg-card rounded-xl border overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted text-xs text-muted-foreground">
                    <th className="text-left px-4 py-3 font-medium">Invoice</th>
                    <th className="text-left px-4 py-3 font-medium">Client</th>
                    <th className="text-left px-4 py-3 font-medium">Issue Date</th>
                    <th className="text-left px-4 py-3 font-medium">Due Date</th>
                    <th className="text-right px-4 py-3 font-medium">Amount</th>
                    <th className="text-left px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((inv) => (
                    <tr key={inv.id} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="px-4 py-3">
                        <Link href={`/invoices/${inv.id}`} className="font-medium text-sm hover:text-accent">
                          {inv.invoice_number}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {inv.contacts?.full_name ?? "—"}
                        {inv.contacts?.company_name && (
                          <span className="text-xs block">{inv.contacts.company_name}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {formatDate(inv.issue_date)}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {inv.due_date ? formatDate(inv.due_date) : "—"}
                      </td>
                      <td className="px-4 py-3 text-sm font-bold text-right">
                        {formatCurrency(inv.total, currency)}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={inv.status} type="invoice" />
                      </td>
                      <td className="px-4 py-3">
                        <a
                          href={`/api/invoices/${inv.id}/pdf`}
                          target="_blank"
                          className="text-muted-foreground hover:text-foreground"
                          title="Download PDF"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile card list */}
            <div className="sm:hidden space-y-3">
              {filtered.map((inv) => (
                <Link key={inv.id} href={`/invoices/${inv.id}`}>
                  <div className="bg-card border rounded-xl p-4 space-y-2 active:bg-muted/50">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-sm">{inv.invoice_number}</p>
                        {inv.contacts && (
                          <p className="text-xs text-muted-foreground">{inv.contacts.full_name}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-sm">{formatCurrency(inv.total, currency)}</p>
                        <StatusBadge status={inv.status} type="invoice" className="mt-1" />
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(inv.issue_date)}{inv.due_date ? ` · Due ${formatDate(inv.due_date)}` : ""}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>

      {/* FAB */}
      <Link href="/invoices/new">
        <button className="md:hidden fixed bottom-20 right-4 z-40 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center active:scale-95 transition-transform">
          <Plus className="w-6 h-6" />
        </button>
      </Link>
    </div>
  );
}
