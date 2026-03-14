"use client";

import { cn } from "@/lib/utils";
import type { ChatMessage as ChatMessageType } from "@/lib/hooks/useAria";

interface ChatMessageProps {
  message: ChatMessageType;
}

function renderMarkdown(text: string): React.ReactNode {
  const lines = text.split("\n");
  return lines.map((line, i) => {
    if (line.startsWith("## ")) {
      return <h3 key={i} className="font-bold mt-3 mb-1" style={{ color: "#bfdbfe" }}>{line.slice(3)}</h3>;
    }
    if (line.startsWith("# ")) {
      return <h2 key={i} className="font-bold mt-3 mb-1" style={{ color: "#dbeafe" }}>{line.slice(2)}</h2>;
    }
    if (line.startsWith("• ") || line.startsWith("- ") || line.startsWith("* ")) {
      return (
        <li key={i} className="flex gap-2 items-start my-0.5">
          <span className="mt-1.5 w-1 h-1 rounded-full flex-shrink-0" style={{ background: "#60a5fa" }} />
          <span>{renderInline(line.slice(2))}</span>
        </li>
      );
    }
    if (line.match(/^\d+\. /)) {
      return <li key={i} className="ml-4 list-decimal my-0.5">{renderInline(line.replace(/^\d+\. /, ""))}</li>;
    }
    if (line === "") return <br key={i} />;
    return <p key={i} className="my-0.5">{renderInline(line)}</p>;
  });
}

function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i} className="font-semibold" style={{ color: "#e2e8f0" }}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex gap-3 items-start", isUser ? "flex-row-reverse" : "flex-row")}>
      {/* Avatar */}
      {isUser ? (
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
          style={{
            background: "rgba(36,99,255,0.2)",
            border: "1px solid rgba(36,99,255,0.3)",
            color: "#93c5fd",
          }}
        >
          U
        </div>
      ) : (
        <div className="relative w-8 h-8 flex-shrink-0">
          <div className="absolute inset-0 rounded-full bg-blue-500/15 animate-ping" style={{ animationDuration: "3s" }} />
          <div
            className="relative w-8 h-8 rounded-full flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, #3b82f6, #2463FF)",
              boxShadow: "0 0 12px rgba(36,99,255,0.4)",
            }}
          >
            <span className="text-white font-bold text-[11px]">A</span>
          </div>
        </div>
      )}

      {/* Bubble */}
      {isUser ? (
        <div
          className="max-w-[80%] rounded-2xl rounded-tr-sm px-4 py-3 text-sm leading-relaxed"
          style={{
            background: "linear-gradient(135deg, rgba(59,130,246,0.5), rgba(36,99,255,0.4))",
            border: "1px solid rgba(59,130,246,0.35)",
            color: "#f1f5f9",
            backdropFilter: "blur(8px)",
          }}
        >
          <p>{message.content}</p>
        </div>
      ) : (
        <div
          className="max-w-[80%] rounded-2xl rounded-tl-sm px-4 py-3 text-sm leading-relaxed"
          style={{
            background: "rgba(15,23,42,0.7)",
            border: "1px solid rgba(36,99,255,0.18)",
            color: "#cbd5e1",
            backdropFilter: "blur(8px)",
          }}
        >
          <div className="space-y-0.5">
            {renderMarkdown(message.content)}
            {message.streaming && (
              <span
                className="inline-block w-1.5 h-4 ml-0.5 rounded-sm aria-cursor"
                style={{ background: "#60a5fa" }}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
