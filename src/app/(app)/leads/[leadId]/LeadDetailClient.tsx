"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PriorityBadge } from "@/components/shared/PriorityBadge";
import { ActivityFeed } from "@/components/activities/ActivityFeed";
import { ActivityForm } from "@/components/activities/ActivityForm";
import { AriaPanel } from "@/components/ai/AriaPanel";
import { formatCurrency, formatDate } from "@/lib/utils";
import { LEAD_STATUSES, LOST_REASONS } from "@/lib/constants";
import { ArrowLeft, Edit, Trophy, XCircle, Plus, FileText, Phone, Mail, Globe } from "lucide-react";
import type { ActivityWithRelations, InvoiceWithContact } from "@/types/database";

interface LeadDetailClientProps {
  lead: Record<string, unknown>;
  activities: ActivityWithRelations[];
  invoices: InvoiceWithContact[];
  companyId: string;
  currentUser: { id: string; name: string; role: string };
}

export function LeadDetailClient({
  lead: initialLead,
  activities: initialActivities,
  invoices,
  companyId,
  currentUser,
}: LeadDetailClientProps) {
  const router = useRouter();
  const [lead, setLead] = useState(initialLead);
  const [activities, setActivities] = useState<ActivityWithRelations[]>(initialActivities);
  const [wonLostDialog, setWonLostDialog] = useState<"won" | "lost" | null>(null);
  const [lostReason, setLostReason] = useState("");
  const [statusChanging, setStatusChanging] = useState(false);

  const contact = lead.contacts as Record<string, string> | null;
  const assignedProfile = lead.profiles as Record<string, string> | null;

  async function updateStatus(status: string, lostReasonValue?: string) {
    setStatusChanging(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("leads")
      .update({
        status,
        won_lost_reason: lostReasonValue ?? null,
      })
      .eq("id", lead.id as string)
      .select()
      .single();

    setStatusChanging(false);
    if (error) {
      toast.error("Failed to update status");
    } else {
      setLead({ ...lead, status, won_lost_reason: lostReasonValue ?? null });
      toast.success(`Lead marked as ${status}`);
    }
  }

  return (
    <div className="min-h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-start gap-3">
            <button
              onClick={() => router.back()}
              className="mt-1 text-muted-foreground hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div className="flex-1 min-w-0">
              <h1 className="font-bold text-lg text-gray-900 leading-tight truncate">
                {lead.title as string}
              </h1>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <StatusBadge status={lead.status as string} />
                <PriorityBadge priority={lead.priority as string} />
                <span className="font-bold text-[#0F1E3C]">
                  {formatCurrency(lead.value as number, lead.currency as string)}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {lead.status !== "Won" && lead.status !== "Lost" && (
                <>
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white h-8 gap-1 hidden sm:flex"
                    onClick={() => setWonLostDialog("won")}
                  >
                    <Trophy className="w-3.5 h-3.5" />
                    Won
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 border-red-200 hover:bg-red-50 h-8 gap-1 hidden sm:flex"
                    onClick={() => setWonLostDialog("lost")}
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    Lost
                  </Button>
                </>
              )}
              <Link href={`/leads/${lead.id}/edit`}>
                <Button variant="outline" size="sm" className="h-8 gap-1">
                  <Edit className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Edit</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        <Tabs defaultValue="overview">
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="activities">
              Activities {activities.length > 0 && `(${activities.length})`}
            </TabsTrigger>
            <TabsTrigger value="invoices">
              Invoices {invoices.length > 0 && `(${invoices.length})`}
            </TabsTrigger>
            <TabsTrigger value="aria">
              Ask Aria ✨
            </TabsTrigger>
          </TabsList>

          {/* OVERVIEW TAB */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Contact info */}
              <div className="bg-white rounded-xl p-4 border space-y-3">
                <h3 className="font-semibold text-sm text-gray-900">Contact</h3>
                {contact ? (
                  <div className="space-y-2">
                    <Link
                      href={`/contacts/${contact.id}`}
                      className="font-medium text-[#0F1E3C] hover:text-[#00C9A7]"
                    >
                      {contact.full_name}
                    </Link>
                    {contact.company_name && (
                      <p className="text-sm text-muted-foreground">{contact.company_name}</p>
                    )}
                    <div className="space-y-1.5 pt-1">
                      {contact.email && (
                        <a href={`mailto:${contact.email}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-gray-900">
                          <Mail className="w-3.5 h-3.5" />
                          {contact.email}
                        </a>
                      )}
                      {contact.phone && (
                        <a href={`tel:${contact.phone}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-gray-900">
                          <Phone className="w-3.5 h-3.5" />
                          {contact.phone}
                        </a>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No contact linked</p>
                )}
              </div>

              <div className="bg-white rounded-xl p-4 border space-y-3">
                <h3 className="font-semibold text-sm text-gray-900">Details</h3>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Source</dt>
                    <dd className="font-medium">{String(lead.source ?? "—")}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Close Date</dt>
                    <dd className="font-medium">
                      {lead.expected_close_date
                        ? formatDate(lead.expected_close_date as string)
                        : "—"}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Assigned To</dt>
                    <dd className="font-medium">{assignedProfile?.name ?? "Unassigned"}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Created</dt>
                    <dd className="font-medium">{formatDate(lead.created_at as string)}</dd>
                  </div>
                  {lead.won_lost_reason != null && (
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Lost Reason</dt>
                      <dd className="font-medium text-red-600">{String(lead.won_lost_reason)}</dd>
                    </div>
                  )}
                </dl>
              </div>

              {/* Notes */}
              {!!lead.notes && (
                <div className="bg-white rounded-xl p-4 border sm:col-span-2">
                  <h3 className="font-semibold text-sm text-gray-900 mb-2">Notes</h3>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{lead.notes as string}</p>
                </div>
              )}

              {/* Mobile Won/Lost buttons */}
              {lead.status !== "Won" && lead.status !== "Lost" && (
                <div className="sm:hidden flex gap-3 sm:col-span-2">
                  <Button
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white gap-1"
                    onClick={() => setWonLostDialog("won")}
                  >
                    <Trophy className="w-4 h-4" />
                    Mark Won
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 text-red-600 border-red-200 hover:bg-red-50 gap-1"
                    onClick={() => setWonLostDialog("lost")}
                  >
                    <XCircle className="w-4 h-4" />
                    Mark Lost
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          {/* ACTIVITIES TAB */}
          <TabsContent value="activities">
            <div className="space-y-4">
              <ActivityForm
                companyId={companyId}
                leadId={lead.id as string}
                contactId={contact?.id}
                onSuccess={(activity) => {
                  setActivities([activity as ActivityWithRelations, ...activities]);
                }}
              />
              <ActivityFeed
                activities={activities}
              />
            </div>
          </TabsContent>

          {/* INVOICES TAB */}
          <TabsContent value="invoices">
            <div className="space-y-4">
              <div className="flex justify-end">
                <Link href={`/invoices/new?leadId=${lead.id}`}>
                  <Button size="sm" className="bg-[#0F1E3C] hover:bg-[#1a2f5e] text-white gap-1.5">
                    <Plus className="w-4 h-4" />
                    Create Invoice
                  </Button>
                </Link>
              </div>
              {invoices.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm">No invoices linked to this lead</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {invoices.map((inv) => (
                    <Link key={inv.id} href={`/invoices/${inv.id}`}>
                      <div className="bg-white border rounded-xl p-4 flex items-center justify-between hover:bg-gray-50">
                        <div>
                          <p className="font-medium text-sm">{inv.invoice_number}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {formatDate(inv.issue_date)}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-sm">
                            {formatCurrency(inv.total, inv.currency)}
                          </span>
                          <StatusBadge status={inv.status} type="invoice" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* ARIA TAB */}
          <TabsContent value="aria">
            <AriaPanel
              contextType="lead"
              contextId={lead.id as string}
              title={`Ask about: ${lead.title as string}`}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Won/Lost Dialog */}
      <Dialog open={wonLostDialog !== null} onOpenChange={(open) => !open && setWonLostDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {wonLostDialog === "won" ? "🏆 Mark as Won!" : "Mark as Lost"}
            </DialogTitle>
            <DialogDescription>
              {wonLostDialog === "won"
                ? "Congratulations! This will move the lead to Won status."
                : "What was the reason for losing this deal?"}
            </DialogDescription>
          </DialogHeader>

          {wonLostDialog === "lost" && (
            <Select value={lostReason} onValueChange={(v) => v !== null && setLostReason(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select reason..." />
              </SelectTrigger>
              <SelectContent>
                {LOST_REASONS.map((r) => (
                  <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setWonLostDialog(null)}>
              Cancel
            </Button>
            <Button
              className={wonLostDialog === "won" ? "bg-green-600 hover:bg-green-700 text-white" : "bg-red-600 hover:bg-red-700 text-white"}
              onClick={async () => {
                await updateStatus(
                  wonLostDialog === "won" ? "Won" : "Lost",
                  wonLostDialog === "lost" ? lostReason : undefined
                );
                setWonLostDialog(null);
              }}
              disabled={statusChanging}
            >
              {statusChanging ? "Saving..." : wonLostDialog === "won" ? "Mark as Won" : "Mark as Lost"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
