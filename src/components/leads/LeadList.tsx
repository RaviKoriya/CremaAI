"use client";

import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PriorityBadge } from "@/components/shared/PriorityBadge";
import { LeadAgingBadge } from "./LeadAgingBadge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import type { LeadWithContact } from "@/types/database";
import { EmptyState } from "@/components/shared/EmptyState";
import { Briefcase } from "lucide-react";

interface LeadListProps {
  leads: LeadWithContact[];
  onNewLead?: () => void;
}

export function LeadList({ leads, onNewLead }: LeadListProps) {
  if (leads.length === 0) {
    return (
      <EmptyState
        title="No leads yet"
        description="Add your first lead to start tracking your pipeline"
        icon={<Briefcase className="w-12 h-12 mx-auto text-gray-300" />}
        action={onNewLead ? { label: "Add your first lead →", onClick: onNewLead } : undefined}
      />
    );
  }

  return (
    <>
      {/* Desktop table */}
      <div className="hidden sm:block overflow-hidden rounded-xl border bg-white">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-gray-50 text-xs text-muted-foreground">
              <th className="text-left px-4 py-3 font-medium">Lead</th>
              <th className="text-left px-4 py-3 font-medium">Contact</th>
              <th className="text-left px-4 py-3 font-medium">Value</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="text-left px-4 py-3 font-medium">Priority</th>
              <th className="text-left px-4 py-3 font-medium">Assigned</th>
              <th className="text-left px-4 py-3 font-medium">Close Date</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead.id} className="border-b last:border-0 hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <Link href={`/leads/${lead.id}`} className="hover:text-[#00C9A7]">
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
                        <AvatarFallback className="text-[10px] bg-[#0F1E3C] text-white">
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

      {/* Mobile card list */}
      <div className="sm:hidden space-y-3">
        {leads.map((lead) => (
          <Link key={lead.id} href={`/leads/${lead.id}`}>
            <div className="bg-white border rounded-xl p-4 space-y-2 active:bg-gray-50">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-sm">{lead.title}</p>
                  {lead.contacts && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {lead.contacts.full_name}
                    </p>
                  )}
                </div>
                <p className="font-bold text-sm text-[#0F1E3C] whitespace-nowrap">
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
