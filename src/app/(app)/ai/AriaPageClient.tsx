"use client";

import { AriaPanel } from "@/components/ai/AriaPanel";

interface AriaPageClientProps {
  userName: string;
}

export function AriaPageClient({ userName }: AriaPageClientProps) {
  return (
    <div
      className="flex flex-col"
      style={{
        height: "calc(100vh - 3.5rem)",
        background: "linear-gradient(160deg, #03070f 0%, #060c1a 60%, #03070f 100%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background grid */}
      <div
        className="absolute inset-0 pointer-events-none aria-grid"
        style={{
          backgroundImage:
            "linear-gradient(rgba(36,99,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(36,99,255,0.6) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          opacity: 0.03,
        }}
      />
      {/* Top glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none"
        style={{
          width: "700px",
          height: "250px",
          background: "radial-gradient(ellipse at center top, rgba(36,99,255,0.1) 0%, transparent 70%)",
        }}
      />

      {/* Identity bar */}
      <div
        className="relative z-10 flex-shrink-0 flex items-center justify-between px-6 py-3"
        style={{ borderBottom: "1px solid rgba(36,99,255,0.1)" }}
      >
        <div className="flex items-center gap-3">
          {/* Small orb */}
          <div className="relative w-8 h-8">
            <div className="absolute inset-0 rounded-full bg-blue-500/20 animate-ping" style={{ animationDuration: "3s" }} />
            <div
              className="relative w-8 h-8 rounded-full flex items-center justify-center overflow-hidden"
              style={{
                background: "linear-gradient(135deg, #3b82f6, #2463FF)",
                boxShadow: "0 0 16px rgba(36,99,255,0.5)",
              }}
            >
              <div className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent aria-scan" />
              <span className="text-white font-black text-sm z-10">A</span>
            </div>
          </div>
          <div>
            <span
              className="font-black tracking-[0.12em] text-base"
              style={{
                background: "linear-gradient(135deg, #bfdbfe, #ffffff 50%, #bfdbfe)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              ARIA
            </span>
            <p className="text-[11px] font-medium tracking-widest uppercase" style={{ color: "rgba(148,163,184,0.6)" }}>
              AI Sales Intelligence
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Online status */}
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
            style={{
              background: "rgba(16,185,129,0.08)",
              border: "1px solid rgba(16,185,129,0.2)",
              color: "#34d399",
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Online
          </div>
          {/* User greeting */}
          <span
            className="hidden sm:block text-sm font-medium"
            style={{ color: "rgba(148,163,184,0.7)" }}
          >
            Hi, {userName}
          </span>
        </div>
      </div>

      {/* Chat — fills all remaining space */}
      <div className="relative z-10 flex-1 min-h-0">
        <AriaPanel
          contextType="dashboard"
          className="h-full"
          userName={userName}
          seamless
        />
      </div>
    </div>
  );
}
