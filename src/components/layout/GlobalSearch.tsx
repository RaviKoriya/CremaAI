"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Briefcase, Users, FileText, Loader2 } from "lucide-react";

interface SearchResult {
  leads: Array<{ id: string; title: string; status: string; value: number; currency: string; type: string }>;
  contacts: Array<{ id: string; full_name: string; email: string; company_name: string; type: string }>;
  invoices: Array<{ id: string; invoice_number: string; total: number; status: string; currency: string; type: string }>;
}

interface GlobalSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GlobalSearch({ open, onOpenChange }: GlobalSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);

  const search = useCallback(async (q: string) => {
    if (!q.trim() || q.length < 2) {
      setResults(null);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data);
      }
    } catch {
      // silent fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => search(query), 300);
    return () => clearTimeout(timer);
  }, [query, search]);

  // Cmd+K keyboard shortcut
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onOpenChange(true);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onOpenChange]);

  function navigate(href: string) {
    onOpenChange(false);
    setQuery("");
    setResults(null);
    router.push(href);
  }

  const hasResults =
    results &&
    ((results.leads?.length ?? 0) +
      (results.contacts?.length ?? 0) +
      (results.invoices?.length ?? 0)) > 0;

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Search leads, contacts, invoices..."
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        {loading && (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
          </div>
        )}
        {!loading && query.length >= 2 && !hasResults && (
          <CommandEmpty>No results for &quot;{query}&quot;</CommandEmpty>
        )}
        {!loading && !query && (
          <CommandEmpty>Start typing to search across all records...</CommandEmpty>
        )}

        {results?.leads && results.leads.length > 0 && (
          <CommandGroup heading="Leads">
            {results.leads.map((lead) => (
              <CommandItem
                key={lead.id}
                value={`lead-${lead.id}`}
                onSelect={() => navigate(`/leads/${lead.id}`)}
                className="flex items-center gap-3"
              >
                <Briefcase className="w-4 h-4 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{lead.title}</div>
                  <div className="text-xs text-muted-foreground">{lead.status}</div>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {results?.contacts && results.contacts.length > 0 && (
          <CommandGroup heading="Contacts">
            {results.contacts.map((contact) => (
              <CommandItem
                key={contact.id}
                value={`contact-${contact.id}`}
                onSelect={() => navigate(`/contacts/${contact.id}`)}
                className="flex items-center gap-3"
              >
                <Users className="w-4 h-4 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{contact.full_name}</div>
                  <div className="text-xs text-muted-foreground">{contact.email}</div>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {results?.invoices && results.invoices.length > 0 && (
          <CommandGroup heading="Invoices">
            {results.invoices.map((invoice) => (
              <CommandItem
                key={invoice.id}
                value={`invoice-${invoice.id}`}
                onSelect={() => navigate(`/invoices/${invoice.id}`)}
                className="flex items-center gap-3"
              >
                <FileText className="w-4 h-4 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{invoice.invoice_number}</div>
                  <div className="text-xs text-muted-foreground">{invoice.status}</div>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}
