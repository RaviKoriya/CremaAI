"use client";

import { useRef, useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Link from "next/link";
import { Phone, Mail, RefreshCw, GripVertical } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PriorityBadge } from "@/components/shared/PriorityBadge";
import { LeadAgingBadge } from "./LeadAgingBadge";
import { formatCurrency, getInitials } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { LeadWithContact } from "@/types/database";
import { PRIORITIES } from "@/lib/constants";

interface LeadCardProps {
  lead: LeadWithContact;
  onStatusChange?: (leadId: string, status: string) => void;
}

export function LeadCard({ lead, onStatusChange }: LeadCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lead.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Swipe state for mobile quick actions
  const [swipeX, setSwipeX] = useState(0);
  const touchStartX = useRef(0);
  const priority = PRIORITIES.find((p) => p.value === lead.priority);

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }

  function handleTouchMove(e: React.TouchEvent) {
    const diff = e.touches[0].clientX - touchStartX.current;
    if (diff < 0) {
      setSwipeX(Math.max(diff, -120));
    }
  }

  function handleTouchEnd() {
    if (swipeX < -60) {
      // Keep swiped open
    } else {
      setSwipeX(0);
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative overflow-hidden rounded-xl",
        isDragging && "opacity-50 z-50"
      )}
    >
      {/* Swipe action buttons (mobile) */}
      <div
        className="absolute right-0 top-0 bottom-0 flex items-center gap-1 px-2 bg-gray-100"
        style={{ width: 120 }}
      >
        <button
          className="flex flex-col items-center gap-0.5 w-10 h-10 rounded-lg bg-blue-500 text-white justify-center"
          onClick={() => setSwipeX(0)}
        >
          <Phone className="w-4 h-4" />
        </button>
        <button
          className="flex flex-col items-center gap-0.5 w-10 h-10 rounded-lg bg-purple-500 text-white justify-center"
          onClick={() => setSwipeX(0)}
        >
          <Mail className="w-4 h-4" />
        </button>
        <button
          className="flex flex-col items-center gap-0.5 w-10 h-10 rounded-lg bg-[#00C9A7] text-white justify-center"
          onClick={() => { setSwipeX(0); }}
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Card */}
      <div
        className={cn(
          "bg-white border rounded-xl p-3 cursor-pointer hover:shadow-md transition-all select-none border-l-4",
          priority?.borderColor ?? "border-l-gray-200"
        )}
        style={{
          transform: `translateX(${swipeX}px)`,
          transition: "transform 0.2s ease",
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Drag handle */}
        <div
          className="absolute top-2 right-2 text-gray-300 cursor-grab active:cursor-grabbing touch-none"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="w-4 h-4" />
        </div>

        <Link href={`/leads/${lead.id}`} className="block">
          {/* Title + value */}
          <div className="pr-6">
            <p className="font-semibold text-sm text-gray-900 leading-tight line-clamp-2">
              {lead.title}
            </p>
            <p className="text-base font-bold text-[#0F1E3C] mt-1">
              {formatCurrency(lead.value, lead.currency)}
            </p>
          </div>

          {/* Contact name */}
          {lead.contacts && (
            <p className="text-xs text-muted-foreground mt-1 truncate">
              {lead.contacts.full_name}
              {lead.contacts.company_name && ` · ${lead.contacts.company_name}`}
            </p>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between mt-2.5 gap-2">
            <div className="flex items-center gap-1.5">
              <PriorityBadge priority={lead.priority} />
              <LeadAgingBadge createdAt={lead.created_at} />
            </div>

            {lead.profiles && (
              <Avatar className="w-5 h-5 flex-shrink-0">
                <AvatarFallback className="text-[9px] bg-[#0F1E3C] text-white">
                  {getInitials(lead.profiles.name)}
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        </Link>
      </div>
    </div>
  );
}
