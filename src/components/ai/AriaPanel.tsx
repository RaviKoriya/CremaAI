"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Trash2 } from "lucide-react";
import { ChatMessage } from "./ChatMessage";
import { useAria } from "@/lib/hooks/useAria";
import type { AriaContextType } from "@/lib/constants";

const SUGGESTED_PROMPTS: Record<AriaContextType, { icon: string; text: string }[]> = {
  lead: [
    { icon: "◎", text: "What's the status of this lead?" },
    { icon: "✉", text: "Draft a follow-up email" },
    { icon: "→", text: "Suggest next steps" },
    { icon: "◷", text: "What activities are pending?" },
  ],
  contact: [
    { icon: "◎", text: "Summarize this contact's history" },
    { icon: "◈", text: "What leads are open with them?" },
    { icon: "✉", text: "Draft an introduction email" },
  ],
  dashboard: [
    { icon: "◷", text: "Which leads need follow-up today?" },
    { icon: "◈", text: "What's my pipeline value?" },
    { icon: "↑", text: "Who has the highest win rate?" },
    { icon: "⚠", text: "What's overdue?" },
    { icon: "◎", text: "Show deals closing this month" },
    { icon: "✉", text: "Draft a prospect outreach email" },
  ],
  global: [
    { icon: "◷", text: "Which leads need follow-up today?" },
    { icon: "◈", text: "What's my total pipeline value?" },
    { icon: "◎", text: "Show deals closing this month" },
    { icon: "↑", text: "Who has the highest win rate?" },
  ],
  invoice: [
    { icon: "◎", text: "What's the status of this invoice?" },
    { icon: "✉", text: "Draft a payment reminder" },
  ],
};

interface AriaPanelProps {
  contextType: AriaContextType;
  contextId?: string;
  title?: string;
  className?: string;
  userName?: string;
  /** When true, renders without outer border/bg (used on the full /ai page) */
  seamless?: boolean;
}

export function AriaPanel({ contextType, contextId, title, className, userName, seamless }: AriaPanelProps) {
  const { messages, isStreaming, error, sendMessage, clearMessages } = useAria(contextType, contextId);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    if (!input.trim()) return;
    const msg = input;
    setInput("");
    await sendMessage(msg);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  const suggestions = SUGGESTED_PROMPTS[contextType] ?? SUGGESTED_PROMPTS.global;

  const containerStyle = seamless
    ? { background: "transparent" }
    : {
        background: "linear-gradient(160deg, #060c1a 0%, #0a1228 60%, #060c1a 100%)",
        borderRadius: "inherit",
        border: "1px solid rgba(36,99,255,0.2)",
        boxShadow: "0 0 40px rgba(36,99,255,0.08), inset 0 0 40px rgba(36,99,255,0.03)",
      };

  return (
    <div
      className={`flex flex-col overflow-hidden ${className ?? "h-[480px]"}`}
      style={containerStyle}
    >
      {/* Header — only shown in floating mode */}
      {!seamless && (
        <div
          className="flex items-center justify-between px-4 py-3 border-b flex-shrink-0"
          style={{ borderColor: "rgba(36,99,255,0.15)" }}
        >
          <div className="flex items-center gap-3">
            <div className="relative w-7 h-7 flex-shrink-0">
              <div className="absolute inset-0 rounded-full bg-blue-500/20 animate-ping" style={{ animationDuration: "3s" }} />
              <div className="relative w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-[#2463FF] flex items-center justify-center shadow-[0_0_12px_rgba(36,99,255,0.6)]">
                <span className="text-white font-bold text-[10px]">A</span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-white tracking-wide">ARIA</span>
                <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  ONLINE
                </span>
              </div>
              {title && (
                <span className="text-[11px] text-blue-300/70 truncate max-w-[180px] block">{title}</span>
              )}
            </div>
          </div>
          {messages.length > 0 && (
            <button
              onClick={clearMessages}
              className="text-blue-500/50 hover:text-blue-400 transition-colors p-1.5 rounded-lg hover:bg-blue-500/10"
              title="Clear conversation"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-4 min-h-0">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-center gap-6 py-6">
            {/* Compact orb */}
            <div className="relative">
              <span className="absolute inset-0 rounded-full bg-blue-500/20 aria-pulse-ring" />
              <div
                className="relative w-14 h-14 rounded-full flex items-center justify-center aria-orb-glow overflow-hidden"
                style={{ background: "linear-gradient(135deg, #3b82f6, #2463FF)" }}
              >
                <div className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent aria-scan" />
                <span className="text-white font-black text-xl z-10">A</span>
              </div>
            </div>

            {/* Greeting */}
            <div>
              <p className="text-lg font-bold text-white mb-1">
                {userName ? `Hi ${userName}, I'm Aria` : "Hi, I'm Aria"}
              </p>
              <p className="text-sm" style={{ color: "rgba(148,163,184,0.85)" }}>
                Ask me about your leads, pipeline, invoices, or contacts.
              </p>
            </div>

            {/* Suggestion chips grid */}
            <div className="w-full max-w-lg grid grid-cols-1 sm:grid-cols-2 gap-2">
              {suggestions.map((s) => (
                <button
                  key={s.text}
                  onClick={() => sendMessage(s.text)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-left transition-all group"
                  style={{
                    background: "rgba(36,99,255,0.07)",
                    border: "1px solid rgba(36,99,255,0.18)",
                    color: "rgba(203,213,225,0.9)",
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLButtonElement;
                    el.style.background = "rgba(36,99,255,0.14)";
                    el.style.borderColor = "rgba(36,99,255,0.35)";
                    el.style.color = "#e2e8f0";
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLButtonElement;
                    el.style.background = "rgba(36,99,255,0.07)";
                    el.style.borderColor = "rgba(36,99,255,0.18)";
                    el.style.color = "rgba(203,213,225,0.9)";
                  }}
                >
                  <span className="text-blue-400 text-base w-5 flex-shrink-0 text-center">{s.icon}</span>
                  <span className="leading-snug">{s.text}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            {error && (
              <div
                className="text-sm text-center px-4 py-2 rounded-lg"
                style={{
                  color: "#fca5a5",
                  background: "rgba(239,68,68,0.1)",
                  border: "1px solid rgba(239,68,68,0.2)",
                }}
              >
                {error}
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input bar */}
      <div
        className="flex-shrink-0 px-4 sm:px-6 py-4 flex items-center gap-3"
        style={{ borderTop: "1px solid rgba(36,99,255,0.12)", background: "rgba(3,7,15,0.6)" }}
      >
        {/* Clear button — shown when messages exist in seamless mode */}
        {seamless && messages.length > 0 && (
          <button
            onClick={clearMessages}
            className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all"
            style={{ color: "rgba(148,163,184,0.5)", border: "1px solid rgba(36,99,255,0.12)" }}
            title="Clear conversation"
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLButtonElement;
              el.style.color = "#93c5fd";
              el.style.background = "rgba(36,99,255,0.1)";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLButtonElement;
              el.style.color = "rgba(148,163,184,0.5)";
              el.style.background = "transparent";
            }}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
        <div
          className="flex-1 flex items-center rounded-xl px-4 h-11"
          style={{ background: "rgba(36,99,255,0.06)", border: "1px solid rgba(36,99,255,0.2)" }}
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Aria anything..."
            disabled={isStreaming}
            className="aria-input flex-1 bg-transparent text-sm outline-none border-0 h-full"
            style={{ color: "#e2e8f0" }}
          />
        </div>
        <button
          onClick={handleSend}
          disabled={isStreaming || !input.trim()}
          className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all disabled:opacity-30"
          style={{
            background: input.trim() ? "linear-gradient(135deg, #3b82f6, #2463FF)" : "rgba(36,99,255,0.15)",
            boxShadow: input.trim() ? "0 0 20px rgba(36,99,255,0.4)" : "none",
            border: "1px solid rgba(36,99,255,0.3)",
          }}
        >
          <Send className="w-4 h-4 text-white" />
        </button>
      </div>
    </div>
  );
}
