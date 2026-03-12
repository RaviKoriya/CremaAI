"use client";

import { useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ACTIVITY_TYPES } from "@/lib/constants";
import type { Activity } from "@/types/database";
import { Phone, Mail, Calendar, FileText, CheckSquare } from "lucide-react";

const ICONS = {
  Call: Phone,
  Email: Mail,
  Meeting: Calendar,
  Note: FileText,
  Task: CheckSquare,
};

interface ActivityFormProps {
  companyId: string;
  leadId?: string;
  contactId?: string;
  onSuccess?: (activity: Activity) => void;
  onCancel?: () => void;
}

export function ActivityForm({ companyId, leadId, contactId, onSuccess, onCancel }: ActivityFormProps) {
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState("Call");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [isTask, setIsTask] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!description.trim()) return;
    setLoading(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("activities")
      .insert({
        company_id: companyId,
        lead_id: leadId ?? null,
        contact_id: contactId ?? null,
        type,
        description,
        due_date: dueDate || null,
        completed: false,
        created_by: user.id,
      })
      .select()
      .single();

    setLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Activity logged");
      setDescription("");
      setDueDate("");
      onSuccess?.(data as Activity);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 p-4 bg-gray-50 rounded-xl">
      <div className="flex items-center gap-2">
        {ACTIVITY_TYPES.map((t) => {
          const Icon = ICONS[t.value as keyof typeof ICONS];
          return (
            <button
              key={t.value}
              type="button"
              onClick={() => { setType(t.value); setIsTask(t.value === "Task"); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors touch-target ${
                type === t.value
                  ? "bg-[#0F1E3C] text-white"
                  : "bg-white border text-muted-foreground hover:bg-gray-100"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {t.label}
            </button>
          );
        })}
      </div>

      <Textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder={
          type === "Call" ? "What was discussed..."
          : type === "Email" ? "Email subject or summary..."
          : type === "Meeting" ? "Meeting agenda or outcome..."
          : type === "Task" ? "What needs to be done..."
          : "Notes..."
        }
        rows={3}
        className="resize-none bg-white"
        required
      />

      {(isTask || type === "Meeting") && (
        <div className="space-y-1">
          <Label className="text-xs">Due date / time</Label>
          <Input
            type="datetime-local"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="h-9 bg-white"
          />
        </div>
      )}

      <div className="flex items-center gap-2">
        <Button
          type="submit"
          size="sm"
          className="bg-[#0F1E3C] hover:bg-[#1a2f5e] text-white"
          disabled={loading || !description.trim()}
        >
          {loading ? "Saving..." : "Log Activity"}
        </Button>
        {onCancel && (
          <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
