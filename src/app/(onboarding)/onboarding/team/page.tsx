"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Plus, Trash2, ArrowRight } from "lucide-react";
import { USER_ROLES } from "@/lib/constants";

interface Invite {
  email: string;
  role: string;
}

export default function OnboardingTeamPage() {
  const router = useRouter();
  const [invites, setInvites] = useState<Invite[]>([{ email: "", role: "Sales Rep" }]);

  function addRow() {
    setInvites([...invites, { email: "", role: "Sales Rep" }]);
  }

  function removeRow(i: number) {
    setInvites(invites.filter((_, idx) => idx !== i));
  }

  function updateInvite(i: number, field: keyof Invite, value: string) {
    setInvites(invites.map((inv, idx) => (idx === i ? { ...inv, [field]: value } : inv)));
  }

  function handleSkip() {
    router.push("/onboarding/first-lead");
  }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    // In a real app, send invite emails via Supabase Auth invite
    // For now, proceed to next step
    router.push("/onboarding/first-lead");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
          2
        </div>
        <div>
          <h2 className="font-bold text-xl text-foreground">Invite your team</h2>
          <p className="text-sm text-muted-foreground">Optional — you can always do this later</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="w-5 h-5 text-accent" />
            Team Members
          </CardTitle>
          <CardDescription>
            Teammates will receive an email invitation to join your workspace
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleInvite} className="space-y-4">
            <div className="space-y-3">
              {invites.map((invite, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    type="email"
                    placeholder="colleague@company.com"
                    value={invite.email}
                    onChange={(e) => updateInvite(i, "email", e.target.value)}
                    className="h-10 flex-1"
                  />
                  <Select
                    value={invite.role}
                    onValueChange={(v) => v !== null && updateInvite(i, "role", v)}
                  >
                    <SelectTrigger className="h-10 w-36">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {USER_ROLES.map((r) => (
                        <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {invites.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 text-muted-foreground hover:text-red-500"
                      onClick={() => removeRow(i)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addRow}
              className="text-accent border-accent"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add another
            </Button>

            <div className="pt-2 space-y-3">
              <Button
                type="submit"
                className="w-full h-11 bg-primary hover:bg-primary/80 text-primary-foreground"
              >
                Send invites & continue →
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full h-11 text-muted-foreground"
                onClick={handleSkip}
              >
                <ArrowRight className="w-4 h-4 mr-2" />
                Skip for now — I&apos;ll do this later
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
