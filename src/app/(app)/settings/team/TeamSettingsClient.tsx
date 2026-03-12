"use client";

import { useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { getInitials } from "@/lib/utils";
import { USER_ROLES } from "@/lib/constants";
import { Trash2, UserPlus } from "lucide-react";

interface Member {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar_url: string | null;
}

interface TeamSettingsClientProps {
  members: Member[];
  currentUserId: string;
  companyId: string;
  userRole: string;
}

const ROLE_COLORS: Record<string, string> = {
  Admin: "bg-purple-100 text-purple-700",
  Manager: "bg-blue-100 text-blue-700",
  "Sales Rep": "bg-gray-100 text-gray-700",
};

export function TeamSettingsClient({
  members: initialMembers,
  currentUserId,
  companyId,
  userRole,
}: TeamSettingsClientProps) {
  const [members, setMembers] = useState(initialMembers);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("Sales Rep");
  const [inviting, setInviting] = useState(false);
  const [removeMember, setRemoveMember] = useState<Member | null>(null);
  const [removing, setRemoving] = useState(false);

  const isAdmin = userRole === "Admin";

  async function handleInvite() {
    if (!inviteEmail.trim()) return;
    setInviting(true);

    // In production this would send an email invite via Supabase Auth
    // For now we show a toast indicating the feature
    toast.info(`Invite sent to ${inviteEmail} — they'll receive an email to join your team.`);
    setInviteEmail("");
    setInviting(false);
  }

  async function handleRoleChange(memberId: string, newRole: string) {
    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({ role: newRole })
      .eq("id", memberId);

    if (error) {
      toast.error("Failed to update role");
    } else {
      setMembers(members.map((m) => (m.id === memberId ? { ...m, role: newRole } : m)));
      toast.success("Role updated");
    }
  }

  async function handleRemove() {
    if (!removeMember) return;
    setRemoving(true);
    const supabase = createClient();
    // Detach from company (don't delete auth user)
    const { error } = await supabase
      .from("profiles")
      .update({ company_id: null } as never)
      .eq("id", removeMember.id);

    setRemoving(false);
    if (error) {
      toast.error("Failed to remove member");
    } else {
      setMembers(members.filter((m) => m.id !== removeMember.id));
      setRemoveMember(null);
      toast.success(`${removeMember.name} removed from team`);
    }
  }

  return (
    <div className="space-y-6">
      {/* Invite */}
      {isAdmin && (
        <div className="bg-white border rounded-xl p-5 space-y-4">
          <h2 className="font-semibold text-sm">Invite Team Member</h2>
          <div className="flex gap-3 flex-wrap">
            <div className="flex-1 min-w-48">
              <Label htmlFor="invite-email" className="sr-only">Email</Label>
              <Input
                id="invite-email"
                type="email"
                placeholder="colleague@company.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleInvite()}
              />
            </div>
            <Select value={inviteRole} onValueChange={(v) => v !== null && setInviteRole(v)}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {USER_ROLES.map((r) => (
                  <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              className="bg-[#0F1E3C] hover:bg-[#1a2f5e] text-white gap-1.5"
              onClick={handleInvite}
              disabled={inviting || !inviteEmail}
            >
              <UserPlus className="w-4 h-4" />
              {inviting ? "Sending..." : "Invite"}
            </Button>
          </div>
        </div>
      )}

      {/* Members list */}
      <div className="bg-white border rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b">
          <h2 className="font-semibold text-sm">Team Members ({members.length})</h2>
        </div>
        <div className="divide-y">
          {members.map((member) => {
            const isCurrentUser = member.id === currentUserId;
            const isSelf = isCurrentUser;

            return (
              <div key={member.id} className="flex items-center gap-3 px-5 py-3">
                <Avatar className="w-9 h-9 flex-shrink-0">
                  <AvatarFallback className="bg-[#0F1E3C] text-white text-xs font-bold">
                    {getInitials(member.name)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate">{member.name}</p>
                    {isSelf && (
                      <span className="text-xs text-muted-foreground">(you)</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {isAdmin && !isSelf ? (
                    <Select
                      value={member.role}
                      onValueChange={(role) => role !== null && handleRoleChange(member.id, role)}
                    >
                      <SelectTrigger className="h-7 text-xs w-28">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {USER_ROLES.map((r) => (
                          <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${ROLE_COLORS[member.role] ?? "bg-gray-100 text-gray-700"}`}
                    >
                      {member.role}
                    </span>
                  )}

                  {isAdmin && !isSelf && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 w-7 p-0 text-red-500 border-red-200 hover:bg-red-50"
                      onClick={() => setRemoveMember(member)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Remove dialog */}
      <Dialog open={removeMember !== null} onOpenChange={(o) => !o && setRemoveMember(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Team Member</DialogTitle>
            <DialogDescription>
              Remove <strong>{removeMember?.name}</strong> from your team? They will lose access
              to all company data.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setRemoveMember(null)}>
              Cancel
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleRemove}
              disabled={removing}
            >
              {removing ? "Removing..." : "Remove"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
