"use client";

import { useState } from "react";
import { Sparkles, X } from "lucide-react";
import { AriaPanel } from "./AriaPanel";
import { usePathname } from "next/navigation";

export function AriaButton() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Don't show on AI page (it has its own panel)
  if (pathname === "/ai") return null;

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-20 md:bottom-6 right-4 z-50 w-14 h-14 rounded-full bg-[#0F1E3C] text-white shadow-lg flex items-center justify-center hover:bg-[#1a2f5e] active:scale-95 transition-all"
        aria-label={open ? "Close Aria" : "Ask Aria"}
      >
        {open ? <X className="w-5 h-5" /> : <Sparkles className="w-5 h-5 text-[#00C9A7]" />}
      </button>

      {/* Floating panel */}
      {open && (
        <div className="fixed bottom-20 md:bottom-24 right-4 z-40 w-[calc(100vw-2rem)] sm:w-96 shadow-2xl rounded-xl overflow-hidden">
          <AriaPanel contextType="global" className="h-[500px]" />
        </div>
      )}
    </>
  );
}
