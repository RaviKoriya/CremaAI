"use client";

import { useState, useMemo } from "react";
import { Plus, Search, LayoutGrid, List, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ContactCard } from "@/components/contacts/ContactCard";
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";
import { ContactForm } from "@/components/contacts/ContactForm";
import { EmptyState } from "@/components/shared/EmptyState";
import { Users } from "lucide-react";
import Link from "next/link";
import type { Contact } from "@/types/database";

interface ContactsPageClientProps {
  initialContacts: (Contact & { lead_count: number })[];
  companyId: string;
  userRole: string;
}

export function ContactsPageClient({ initialContacts, companyId }: ContactsPageClientProps) {
  const [contacts, setContacts] = useState(initialContacts);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [drawerOpen, setDrawerOpen] = useState(false);

  const filtered = useMemo(() => {
    if (!search.trim()) return contacts;
    const q = search.toLowerCase();
    return contacts.filter(
      (c) =>
        c.full_name.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.company_name?.toLowerCase().includes(q)
    );
  }, [contacts, search]);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-4 gap-3 border-b bg-card flex-wrap">
        <div>
          <h1 className="font-bold text-lg text-foreground">Contacts</h1>
          <p className="text-xs text-muted-foreground">{contacts.length} total</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search contacts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-9 w-48"
            />
          </div>
          <div className="hidden sm:flex rounded-lg border p-0.5 bg-muted/50">
            <button
              onClick={() => setView("grid")}
              className={`p-1.5 rounded-md transition-colors ${view === "grid" ? "bg-card shadow-sm" : "text-muted-foreground"}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setView("list")}
              className={`p-1.5 rounded-md transition-colors ${view === "list" ? "bg-card shadow-sm" : "text-muted-foreground"}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
          <Link href="/contacts/import">
            <Button variant="outline" size="sm" className="h-9 gap-1.5 hidden sm:flex">
              <Upload className="w-4 h-4" />
              Import
            </Button>
          </Link>
          <Button
            onClick={() => setDrawerOpen(true)}
            className="bg-primary hover:bg-primary/80 text-primary-foreground h-9 gap-1.5"
            size="sm"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Contact</span>
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 sm:p-6">
        {filtered.length === 0 && !search && (
          <EmptyState
            title="No contacts yet"
            description="Add your first contact to start building your network"
            icon={<Users className="w-12 h-12 mx-auto text-gray-300" />}
            action={{ label: "Add your first contact →", onClick: () => setDrawerOpen(true) }}
          />
        )}

        {filtered.length === 0 && search && (
          <div className="text-center py-12 text-muted-foreground text-sm">
            No contacts matching &quot;{search}&quot;
          </div>
        )}

        {view === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((contact) => (
              <ContactCard key={contact.id} contact={contact} />
            ))}
          </div>
        ) : (
          <div className="bg-card rounded-xl border overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted text-xs text-muted-foreground">
                  <th className="text-left px-4 py-3 font-medium">Name</th>
                  <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">Email</th>
                  <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Company</th>
                  <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Country</th>
                  <th className="text-left px-4 py-3 font-medium">Leads</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((contact) => (
                  <tr key={contact.id} className="border-b last:border-0 hover:bg-muted/50 cursor-pointer">
                    <td className="px-4 py-3">
                      <Link href={`/contacts/${contact.id}`} className="font-medium text-sm hover:text-accent">
                        {contact.full_name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground hidden sm:table-cell">
                      {contact.email ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground hidden md:table-cell">
                      {contact.company_name ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground hidden md:table-cell">
                      {contact.country ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium">{contact.lead_count}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => setDrawerOpen(true)}
        className="md:hidden fixed bottom-20 right-4 z-40 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center active:scale-95 transition-transform"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Drawer */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent className="w-full sm:max-w-2xl p-0 flex flex-col overflow-hidden">
          <ContactForm
            companyId={companyId}
            onSuccess={(contact) => {
              setContacts([{ ...contact, lead_count: 0 }, ...contacts]);
              setDrawerOpen(false);
            }}
            onCancel={() => setDrawerOpen(false)}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}
