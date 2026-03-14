"use client";

import { useState } from "react";
import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PriorityBadge } from "@/components/shared/PriorityBadge";
import { LeadAgingBadge } from "./LeadAgingBadge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import type { LeadWithContact } from "@/types/database";
import { EmptyState } from "@/components/shared/EmptyState";
import { Briefcase, ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";

type SortField = "title" | "value" | "status" | "priority" | "expected_close_date";
type SortDir = "asc" | "desc";

const PRIORITY_ORDER: Record<string, number> = { High: 0, Medium: 1, Low: 2 };
const STATUS_ORDER: Record<string, number> = {
  New: 0, Contacted: 1, Qualified: 2, "Proposal Sent": 3,
  Negotiation: 4, Won: 5, Lost: 6,
};

function sortLeads(leads: LeadWithContact[], field: SortField, dir: SortDir) {
  return [...leads].sort((a, b) => {
    let cmp = 0;
    if (field === "title") {
      cmp = (a.title ?? "").localeCompare(b.title ?? "");
    } else if (field === "value") {
      cmp = (a.value ?? 0) - (b.value ?? 0);
    } else if (field === "status") {
      cmp = (STATUS_ORDER[a.status] ?? 99) - (STATUS_ORDER[b.status] ?? 99);
    } else if (field === "priority") {
      cmp = (PRIORITY_ORDER[a.priority] ?? 99) - (PRIORITY_ORDER[b.priority] ?? 99);
    } else if (field === "expected_close_date") {
      const da = a.expected_close_date ? new Date(a.expected_close_date).getTime() : Infinity;
      const db = b.expected_close_date ? new Date(b.expected_close_date).getTime() : Infinity;
      cmp = da - db;
    }
    return dir === "asc" ? cmp : -cmp;
  });
}

interface LeadListProps {
  leads: LeadWithContact[];
  onNewLead?: () => void;
}

export function LeadList({ leads, onNewLead }: LeadListProps) {
  const [sortField, setSortField] = useState<SortField>("expected_close_date");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  }

  if (leads.length === 0) {
    return (
      <EmptyState
        title="No leads yet"
        description="Add your first lead to start tracking your pipeline"
        icon={<Briefcase className="w-12 h-12 mx-auto text-muted-foreground" />}
        action={onNewLead ? { label: "Add your first lead →", onClick: onNewLead } : undefined}
      />
    );
  }

  const sorted = sortLeads(leads, sortField, sortDir);

  function SortIcon({ field }: { field: SortField }) {
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3 opacity-40" />;
    return sortDir === "asc"
      ? <ArrowUp className="w-3 h-3 text-accent" />
      : <ArrowDown className="w-3 h-3 text-accent" />;
  }

  function Th({ field, label }: { field: SortField; label: string }) {
    return (
      <th className="text-left px-4 py-3 font-medium">
        <button
          onClick={() => handleSort(field)}
          className="flex items-center gap-1 hover:text-foreground transition-colors"
        >
          {label}
          <SortIcon field={field} />
        </button>
      </th>
    );
  }

  return (
    <>
      {/* Desktop table */}
      <div className="hidden sm:block overflow-hidden rounded-xl border bg-card">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted text-xs text-muted-foreground">
              <Th field="title" label="Lead" />
              <th className="text-left px-4 py-3 font-medium">Contact</th>
              <Th field="value" label="Value" />
              <Th field="status" label="Status" />
              <Th field="priority" label="Priority" />
              <th className="text-left px-4 py-3 font-medium">Assigned</th>
              <Th field="expected_close_date" label="Close Date" />
            </tr>
          </thead>
          <tbody>
            {sorted.map((lead) => (
              <tr key={lead.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                <td className="px-4 py-3">
                  <Link href={`/leads/${lead.id}`} className="hover:text-accent">
                    <div className="font-medium text-sm">{lead.title}</div>
                    <LeadAgingBadge createdAt={lead.created_at} className="mt-0.5" />
                  </Link>
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  {lead.contacts?.full_name ?? "—"}
                </td>
                <td className="px-4 py-3 font-semibold text-sm">
                  {formatCurrency(lead.value, lead.currency)}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={lead.status} />
                </td>
                <td className="px-4 py-3">
                  <PriorityBadge priority={lead.priority} />
                </td>
                <td className="px-4 py-3">
                  {lead.profiles ? (
                    <div className="flex items-center gap-2">
                      <Avatar className="w-6 h-6">
                        <AvatarFallback className="text-[10px] bg-primary text-primary-foreground">
                          {getInitials(lead.profiles.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-muted-foreground">{lead.profiles.name}</span>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">Unassigned</span>
                  )}
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {lead.expected_close_date ? formatDate(lead.expected_close_date, "MMM d") : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: sort bar + card list */}
      <div className="sm:hidden space-y-3">
        {/* Mobile sort bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-xs text-muted-foreground flex-shrink-0">Sort:</span>
          {(
            [
              { field: "expected_close_date" as SortField, label: "Close Date" },
              { field: "value" as SortField, label: "Value" },
              { field: "status" as SortField, label: "Status" },
              { field: "priority" as SortField, label: "Priority" },
            ] as { field: SortField; label: string }[]
          ).map(({ field, label }) => (
            <button
              key={field}
              onClick={() => handleSort(field)}
              className={`flex-shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                sortField === field
                  ? "bg-accent/10 text-accent border-accent/30"
                  : "bg-card text-muted-foreground border-border"
              }`}
            >
              {label}
              {sortField === field && (
                sortDir === "asc"
                  ? <ArrowUp className="w-3 h-3" />
                  : <ArrowDown className="w-3 h-3" />
              )}
            </button>
          ))}
        </div>

        {sorted.map((lead) => (
          <Link key={lead.id} href={`/leads/${lead.id}`}>
            <div className="bg-card border rounded-xl p-4 space-y-2 active:bg-muted/50">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-sm">{lead.title}</p>
                  {lead.contacts && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {lead.contacts.full_name}
                    </p>
                  )}
                </div>
                <p className="font-bold text-sm text-primary whitespace-nowrap">
                  {formatCurrency(lead.value, lead.currency)}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <StatusBadge status={lead.status} />
                <PriorityBadge priority={lead.priority} />
                <LeadAgingBadge createdAt={lead.created_at} />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
