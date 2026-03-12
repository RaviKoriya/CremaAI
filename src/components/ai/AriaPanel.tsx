"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChatMessage } from "./ChatMessage";
import { useAria } from "@/lib/hooks/useAria";
import type { AriaContextType } from "@/lib/constants";

const SUGGESTED_PROMPTS = {
  lead: [
    "What's the status of this lead?",
    "Draft a follow-up email",
    "Suggest next steps",
    "What activities are pending?",
  ],
  contact: [
    "Summarize this contact's history",
    "What leads are open with them?",
    "Draft an introduction email",
  ],
  dashboard: [
    "Which leads need follow-up today?",
    "What's my pipeline value?",
    "Who has the highest win rate?",
    "What's overdue?",
  ],
  global: [
    "Which leads need follow-up today?",
    "What's my total pipeline value?",
    "Show me deals closing this month",
  ],
  invoice: [
    "What's the status of this invoice?",
    "Draft a payment reminder",
  ],
};

interface AriaPanelProps {
  contextType: AriaContextType;
  contextId?: string;
  title?: string;
  className?: string;
}

export function AriaPanel({ contextType, contextId, title, className }: AriaPanelProps) {
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

  return (
    <div className={`flex flex-col bg-gray-50 rounded-xl border overflow-hidden ${className ?? "h-[480px]"}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#0F1E3C] text-white">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#00C9A7]" />
          <span className="font-semibold text-sm">Aria</span>
          {title && <span className="text-blue-300 text-xs truncate max-w-[200px]">· {title}</span>}
        </div>
        {messages.length > 0 && (
          <button
            onClick={clearMessages}
            className="text-blue-300 hover:text-white transition-colors"
            title="Clear conversation"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-6">
            <div className="w-12 h-12 rounded-full bg-[#00C9A7]/10 flex items-center justify-center mx-auto mb-3">
              <Sparkles className="w-6 h-6 text-[#00C9A7]" />
            </div>
            <p className="text-sm font-semibold text-gray-800 mb-1">Hi, I&apos;m Aria!</p>
            <p className="text-xs text-muted-foreground mb-4">
              Your AI sales assistant. Ask me anything about your leads, pipeline, or clients.
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="text-xs px-3 py-1.5 rounded-full bg-white border border-[#00C9A7] text-[#00C9A7] hover:bg-teal-50 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}

        {error && (
          <div className="text-xs text-red-500 text-center px-4 py-2 bg-red-50 rounded-lg">
            {error}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-3 py-3 bg-white border-t flex items-center gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask Aria anything..."
          className="flex-1 h-9 text-sm border-0 focus-visible:ring-0 bg-gray-50 rounded-full px-4"
          disabled={isStreaming}
        />
        <Button
          size="icon"
          className="h-9 w-9 rounded-full bg-[#00C9A7] hover:bg-[#00b396] text-white flex-shrink-0"
          onClick={handleSend}
          disabled={isStreaming || !input.trim()}
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
