"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { AriaPanel } from "./AriaPanel";
import { usePathname } from "next/navigation";

export function AriaButton() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  if (pathname === "/ai") return null;

  return (
    <>
      {/* Floating orb button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-20 md:bottom-6 right-4 z-50 w-14 h-14 flex items-center justify-center group"
        aria-label={open ? "Close Aria" : "Ask Aria"}
      >
        {open ? (
          /* Close state */
          <div className="w-14 h-14 rounded-full bg-[#0a0f1e] border border-blue-500/40 shadow-[0_0_20px_rgba(36,99,255,0.4)] flex items-center justify-center transition-all">
            <X className="w-5 h-5 text-blue-400" />
          </div>
        ) : (
          /* Orb state */
          <div className="relative w-14 h-14">
            {/* Pulse rings */}
            <span className="absolute inset-0 rounded-full bg-blue-500/20 aria-pulse-ring" />
            <span className="absolute inset-0 rounded-full bg-blue-500/10 aria-pulse-ring-delay" />
            {/* Core orb */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500 to-[#2463FF] aria-orb-glow aria-float flex items-center justify-center shadow-[0_0_20px_rgba(36,99,255,0.6)]">
              {/* Inner grid scan effect */}
              <div className="absolute inset-0 rounded-full overflow-hidden opacity-20">
                <div
                  className="absolute inset-0 aria-grid"
                  style={{
                    backgroundImage:
                      "linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)",
                    backgroundSize: "8px 8px",
                  }}
                />
              </div>
              {/* Aria "A" monogram */}
              <span className="text-white font-bold text-lg tracking-tight z-10 select-none">A</span>
            </div>
          </div>
        )}
        {/* Tooltip */}
        {!open && (
          <span className="absolute right-16 top-1/2 -translate-y-1/2 whitespace-nowrap bg-[#0a0f1e] text-blue-300 text-xs font-medium px-2.5 py-1 rounded-lg border border-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg">
            Ask Aria
          </span>
        )}
      </button>

      {/* Floating panel */}
      {open && (
        <div className="fixed bottom-20 md:bottom-24 right-4 z-40 w-[calc(100vw-2rem)] sm:w-[400px] shadow-2xl rounded-2xl overflow-hidden">
          <AriaPanel contextType="global" className="h-[520px]" />
        </div>
      )}
    </>
  );
}
