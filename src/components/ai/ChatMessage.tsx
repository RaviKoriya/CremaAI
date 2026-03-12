"use client";

import { cn } from "@/lib/utils";
import type { ChatMessage as ChatMessageType } from "@/lib/hooks/useAria";

interface ChatMessageProps {
  message: ChatMessageType;
}

// Very simple markdown-like rendering
function renderMarkdown(text: string): React.ReactNode {
  const lines = text.split("\n");
  return lines.map((line, i) => {
    if (line.startsWith("## ")) {
      return <h3 key={i} className="font-semibold mt-2 mb-1">{line.slice(3)}</h3>;
    }
    if (line.startsWith("# ")) {
      return <h2 key={i} className="font-bold mt-2 mb-1">{line.slice(2)}</h2>;
    }
    if (line.startsWith("• ") || line.startsWith("- ") || line.startsWith("* ")) {
      return <li key={i} className="ml-4 list-disc">{renderInline(line.slice(2))}</li>;
    }
    if (line.match(/^\d+\. /)) {
      return <li key={i} className="ml-4 list-decimal">{renderInline(line.replace(/^\d+\. /, ""))}</li>;
    }
    if (line === "") return <br key={i} />;
    return <p key={i}>{renderInline(line)}</p>;
  });
}

function renderInline(text: string): React.ReactNode {
  // Bold: **text**
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex gap-3", isUser ? "flex-row-reverse" : "flex-row")}>
      {/* Avatar */}
      <div
        className={cn(
          "w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5",
          isUser
            ? "bg-[#0F1E3C] text-white"
            : "bg-[#00C9A7] text-white"
        )}
      >
        {isUser ? "U" : "✨"}
      </div>

      {/* Bubble */}
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
          isUser
            ? "bg-[#0F1E3C] text-white rounded-tr-sm"
            : "bg-white border text-gray-800 rounded-tl-sm shadow-sm"
        )}
      >
        {isUser ? (
          <p>{message.content}</p>
        ) : (
          <div className="space-y-0.5 prose prose-sm max-w-none">
            {renderMarkdown(message.content)}
            {message.streaming && (
              <span className="inline-block w-1 h-4 bg-[#00C9A7] animate-pulse ml-0.5 rounded-sm" />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
