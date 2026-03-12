"use client";

import { AriaPanel } from "@/components/ai/AriaPanel";
import { Sparkles } from "lucide-react";

interface AriaPageClientProps {
  userName: string;
}

export function AriaPageClient({ userName }: AriaPageClientProps) {
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-4 sm:px-6 py-4 border-b bg-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#0F1E3C] flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-[#00C9A7]" />
          </div>
          <div>
            <h1 className="font-bold text-lg">Aria — AI Sales Assistant</h1>
            <p className="text-xs text-muted-foreground">
              Hi {userName}! Ask me about your leads, pipeline, or clients.
            </p>
          </div>
        </div>
      </div>

      {/* Full-height chat panel */}
      <div className="flex-1 overflow-hidden p-4 sm:p-6">
        <AriaPanel
          contextType="dashboard"
          className="h-full min-h-[500px]"
        />
      </div>
    </div>
  );
}
