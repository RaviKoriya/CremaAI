"use client";

import { useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Phone, Mail, Calendar, FileText, CheckSquare, Check } from "lucide-react";
import { formatRelativeDate, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { ActivityWithRelations } from "@/types/database";

const ACTIVITY_ICONS = {
  Call: { icon: Phone, color: "bg-blue-100 text-blue-600" },
  Email: { icon: Mail, color: "bg-purple-100 text-purple-600" },
  Meeting: { icon: Calendar, color: "bg-teal-100 text-teal-600" },
  Note: { icon: FileText, color: "bg-gray-100 text-gray-600" },
  Task: { icon: CheckSquare, color: "bg-amber-100 text-amber-600" },
};

interface ActivityFeedProps {
  activities: ActivityWithRelations[];
  onActivityUpdate?: (activity: ActivityWithRelations) => void;
}

export function ActivityFeed({ activities, onActivityUpdate }: ActivityFeedProps) {
  const [completingId, setCompletingId] = useState<string | null>(null);

  async function markComplete(activityId: string) {
    setCompletingId(activityId);
    const supabase = createClient();
    const { error } = await supabase
      .from("activities")
      .update({ completed: true })
      .eq("id", activityId);

    setCompletingId(null);
    if (error) {
      toast.error("Failed to update");
    } else {
      toast.success("Marked as complete");
    }
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-sm text-muted-foreground">
        No activities yet — log a call, email, or meeting above
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-5 top-0 bottom-0 w-px bg-gray-200" />

      <div className="space-y-4">
        {activities.map((activity) => {
          const typeConfig = ACTIVITY_ICONS[activity.type as keyof typeof ACTIVITY_ICONS] ?? ACTIVITY_ICONS.Note;
          const Icon = typeConfig.icon;

          return (
            <div key={activity.id} className="flex gap-4 relative">
              {/* Icon */}
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${typeConfig.color} z-10 relative`}
              >
                <Icon className="w-4 h-4" />
              </div>

              {/* Content */}
              <div className="flex-1 pb-4 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold text-gray-700">{activity.type}</span>
                      {activity.profiles && (
                        <span className="text-xs text-muted-foreground">
                          by {activity.profiles.name}
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {formatRelativeDate(activity.created_at)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-800 mt-1 leading-relaxed">
                      {activity.description}
                    </p>
                    {activity.due_date && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Due: {formatDate(activity.due_date, "MMM d, yyyy h:mm a")}
                      </p>
                    )}
                  </div>

                  {/* Complete button for tasks */}
                  {activity.type === "Task" && !activity.completed && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-shrink-0 h-7 text-xs gap-1"
                      onClick={() => markComplete(activity.id)}
                      disabled={completingId === activity.id}
                    >
                      <Check className="w-3 h-3" />
                      Done
                    </Button>
                  )}
                  {activity.completed && (
                    <span className="text-xs text-green-600 font-medium flex-shrink-0">
                      ✓ Done
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
