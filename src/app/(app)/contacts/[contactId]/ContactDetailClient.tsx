"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { ContactForm } from "@/components/contacts/ContactForm";
import { ActivityFeed } from "@/components/activities/ActivityFeed";
import { ActivityForm } from "@/components/activities/ActivityForm";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { AriaPanel } from "@/components/ai/AriaPanel";
import { getInitials, formatCurrency } from "@/lib/utils";
import { ArrowLeft, Mail, Phone, Building2, MapPin, Edit, Trash2 } from "lucide-react";
import type { Contact, Lead, ActivityWithRelations } from "@/types/database";

interface ContactDetailClientProps {
  contact: Contact;
  leads: Pick<Lead, "id" | "title" | "value" | "currency" | "status" | "priority" | "created_at">[];
  activities: ActivityWithRelations[];
  companyId: string;
  userRole: string;
}

export function ContactDetailClient({
  contact: initialContact,
  leads,
  activities: initialActivities,
  companyId,
  userRole,
}: ContactDetailClientProps) {
  const router = useRouter();
  const [contact, setContact] = useState(initialContact);
  const [activities, setActivities] = useState(initialActivities);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    const supabase = createClient();
    const { error } = await supabase.from("contacts").delete().eq("id", contact.id);
    setDeleting(false);
    if (error) {
      toast.error("Failed to delete contact");
    } else {
      toast.success("Contact deleted");
      router.push("/contacts");
    }
  }

  const canDelete = userRole === "Admin" || userRole === "Manager";

  return (
    <div className="min-h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">
          <button onClick={() => router.back()} className="text-muted-foreground hover:text-gray-900">
            <ArrowLeft className="w-5 h-5" />
          </button>

          <Avatar className="w-10 h-10">
            <AvatarFallback className="bg-[#0F1E3C] text-white font-bold">
              {getInitials(contact.full_name)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-lg truncate">{contact.full_name}</h1>
            {contact.company_name && (
              <p className="text-sm text-muted-foreground">{contact.company_name}</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-8 gap-1" onClick={() => setEditOpen(true)}>
              <Edit className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Edit</span>
            </Button>
            {canDelete && (
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-red-600 border-red-200 hover:bg-red-50"
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        <Tabs defaultValue="overview">
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="leads">Leads ({leads.length})</TabsTrigger>
            <TabsTrigger value="activities">Activities</TabsTrigger>
            <TabsTrigger value="aria">Ask Aria ✨</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white border rounded-xl p-4 space-y-3">
                <h3 className="font-semibold text-sm">Contact Info</h3>
                <div className="space-y-2">
                  {contact.email && (
                    <a href={`mailto:${contact.email}`} className="flex items-center gap-2 text-sm hover:text-[#00C9A7]">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      {contact.email}
                    </a>
                  )}
                  {contact.phone && (
                    <a href={`tel:${contact.phone}`} className="flex items-center gap-2 text-sm hover:text-[#00C9A7]">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      {contact.phone}
                    </a>
                  )}
                  {contact.company_name && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Building2 className="w-4 h-4" />
                      {contact.company_name}
                    </div>
                  )}
                  {(contact.city || contact.country) && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      {[contact.city, contact.country].filter(Boolean).join(", ")}
                    </div>
                  )}
                </div>
                {contact.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {contact.tags.map((tag) => (
                      <span key={tag} className="text-xs bg-teal-50 text-teal-700 rounded px-2 py-0.5">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white border rounded-xl p-4 space-y-2">
                <h3 className="font-semibold text-sm">Quick Stats</h3>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Total Leads</dt>
                    <dd className="font-semibold">{leads.length}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Source</dt>
                    <dd className="font-medium">{contact.source ?? "—"}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="leads">
            {leads.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground text-sm">
                No leads linked to this contact
              </div>
            ) : (
              <div className="space-y-2">
                {leads.map((lead) => (
                  <Link key={lead.id} href={`/leads/${lead.id}`}>
                    <div className="bg-white border rounded-xl p-4 flex items-center justify-between hover:bg-gray-50">
                      <div>
                        <p className="font-medium text-sm">{lead.title}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-sm">
                          {formatCurrency(lead.value, lead.currency)}
                        </span>
                        <StatusBadge status={lead.status} />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="activities">
            <div className="space-y-4">
              <ActivityForm
                companyId={companyId}
                contactId={contact.id}
                onSuccess={(a) => setActivities([a as ActivityWithRelations, ...activities])}
              />
              <ActivityFeed activities={activities} />
            </div>
          </TabsContent>

          <TabsContent value="aria">
            <AriaPanel contextType="contact" contextId={contact.id} title={`Ask about: ${contact.full_name}`} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Contact</DialogTitle>
          </DialogHeader>
          <ContactForm
            contact={contact}
            companyId={companyId}
            onSuccess={(c) => { setContact(c); setEditOpen(false); }}
            onCancel={() => setEditOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Contact</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{contact.full_name}</strong>? This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete Contact"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
