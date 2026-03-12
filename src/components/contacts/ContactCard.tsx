import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials, formatDate } from "@/lib/utils";
import { Mail, Phone, Building2 } from "lucide-react";
import type { Contact } from "@/types/database";

interface ContactCardProps {
  contact: Contact & { lead_count?: number; last_activity?: string };
}

export function ContactCard({ contact }: ContactCardProps) {
  return (
    <Link href={`/contacts/${contact.id}`}>
      <div className="bg-white border rounded-xl p-4 hover:shadow-md transition-shadow space-y-3 active:bg-gray-50">
        <div className="flex items-start gap-3">
          <Avatar className="w-10 h-10 flex-shrink-0">
            <AvatarImage src={contact.avatar_url ?? undefined} />
            <AvatarFallback className="bg-[#0F1E3C] text-white text-sm font-bold">
              {getInitials(contact.full_name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-sm text-gray-900 truncate">{contact.full_name}</p>
            {contact.company_name && (
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                <Building2 className="w-3 h-3" />
                {contact.company_name}
              </p>
            )}
          </div>
          {contact.lead_count !== undefined && contact.lead_count > 0 && (
            <span className="text-xs bg-[#0F1E3C] text-white rounded-full px-2 py-0.5 font-medium flex-shrink-0">
              {contact.lead_count} lead{contact.lead_count !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        <div className="space-y-1.5">
          {contact.email && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Mail className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{contact.email}</span>
            </div>
          )}
          {contact.phone && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Phone className="w-3 h-3 flex-shrink-0" />
              <span>{contact.phone}</span>
            </div>
          )}
        </div>

        {contact.tags && contact.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {contact.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="text-[10px] bg-teal-50 text-teal-700 rounded px-1.5 py-0.5 font-medium">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
