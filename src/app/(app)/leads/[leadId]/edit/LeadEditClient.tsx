"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { LeadForm } from "@/components/leads/LeadForm";
import type { Lead } from "@/types/database";

interface LeadEditClientProps {
  lead: Lead;
  companyId: string;
  returnHref: string;
}

export function LeadEditClient({ lead, companyId, returnHref }: LeadEditClientProps) {
  const router = useRouter();

  return (
    <div className="min-h-full bg-gray-50">
      <div className="bg-white border-b sticky top-0 z-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="text-muted-foreground hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-bold text-lg">Edit Lead</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
        <div className="bg-white border rounded-xl p-5">
          <LeadForm
            lead={lead}
            companyId={companyId}
            onSuccess={() => router.push(returnHref)}
            onCancel={() => router.back()}
          />
        </div>
      </div>
    </div>
  );
}
