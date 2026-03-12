"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
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
import { Target, ArrowRight, Upload } from "lucide-react";
import { LEAD_SOURCES, CURRENCIES } from "@/lib/constants";

type Mode = "manual" | "csv" | null;

export default function OnboardingFirstLeadPage() {
  const [mode, setMode] = useState<Mode>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    contactName: "",
    email: "",
    leadTitle: "",
    value: "",
    currency: "USD",
    source: "Web",
  });

  function updateForm(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  // Hard full-page navigation — bypasses all Next.js RSC/router caches so the
  // server always fetches a fresh profile from the DB when the dashboard loads.
  function goToDashboard() {
    window.location.href = "/dashboard";
  }

  async function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("company_id")
        .eq("id", user.id)
        .single();

      if (profile?.company_id) {
        // Create contact
        const { data: contact } = await supabase
          .from("contacts")
          .insert({
            company_id: profile.company_id,
            full_name: form.contactName,
            email: form.email || null,
            source: form.source,
          })
          .select()
          .single();

        // Create lead
        await supabase.from("leads").insert({
          company_id: profile.company_id,
          contact_id: contact?.id ?? null,
          title: form.leadTitle,
          value: parseFloat(form.value) || 0,
          currency: form.currency,
          status: "New",
          priority: "Medium",
          assigned_to: user.id,
          source: form.source,
        });
      }
    }

    goToDashboard();
  }

  function handleSkip() {
    goToDashboard();
  }

  if (!mode) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#0F1E3C] text-white flex items-center justify-center font-bold">
            3
          </div>
          <div>
            <h2 className="font-bold text-xl text-gray-900">Add your first lead</h2>
            <p className="text-sm text-muted-foreground">Choose how you&apos;d like to get started</p>
          </div>
        </div>

        <div className="grid gap-4">
          <button
            onClick={() => setMode("manual")}
            className="text-left p-5 rounded-xl border-2 border-dashed border-gray-200 hover:border-[#00C9A7] hover:bg-teal-50/50 transition-colors group"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-[#0F1E3C] text-white flex items-center justify-center flex-shrink-0">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <div className="font-semibold text-gray-900 group-hover:text-[#0F1E3C]">
                  Add manually
                </div>
                <div className="text-sm text-muted-foreground mt-0.5">
                  Quick 5-field form — takes 30 seconds
                </div>
              </div>
            </div>
          </button>

          <button
            onClick={() => setMode("csv")}
            className="text-left p-5 rounded-xl border-2 border-dashed border-gray-200 hover:border-[#00C9A7] hover:bg-teal-50/50 transition-colors group"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-purple-600 text-white flex items-center justify-center flex-shrink-0">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <div className="font-semibold text-gray-900 group-hover:text-[#0F1E3C]">
                  Import from CSV
                </div>
                <div className="text-sm text-muted-foreground mt-0.5">
                  Upload your existing leads spreadsheet
                </div>
              </div>
            </div>
          </button>

          <button
            onClick={handleSkip}
            className="text-left p-5 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                <ArrowRight className="w-5 h-5 text-gray-400" />
              </div>
              <div>
                <div className="font-semibold text-gray-900">Skip for now</div>
                <div className="text-sm text-muted-foreground mt-0.5">
                  I&apos;ll explore the app first
                </div>
              </div>
            </div>
          </button>
        </div>
      </div>
    );
  }

  if (mode === "csv") {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMode(null)}
            className="text-sm text-muted-foreground hover:text-gray-900"
          >
            ← Back
          </button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>CSV Import</CardTitle>
            <CardDescription>
              You can import contacts & leads after completing setup. Head to Contacts → Import CSV.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleSkip}
              className="w-full h-11 bg-[#0F1E3C] hover:bg-[#1a2f5e] text-white"
            >
              Go to Dashboard & Import later →
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setMode(null)}
          className="text-sm text-muted-foreground hover:text-gray-900"
        >
          ← Back
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-[#0F1E3C] text-white flex items-center justify-center font-bold">
          3
        </div>
        <div>
          <h2 className="font-bold text-xl text-gray-900">Add your first lead</h2>
          <p className="text-sm text-muted-foreground">Just 5 fields to get started</p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Contact name *</Label>
              <Input
                placeholder="John Smith"
                value={form.contactName}
                onChange={(e) => updateForm("contactName", e.target.value)}
                required
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label>Contact email</Label>
              <Input
                type="email"
                placeholder="john@company.com"
                value={form.email}
                onChange={(e) => updateForm("email", e.target.value)}
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label>Lead / opportunity title *</Label>
              <Input
                placeholder="e.g. Website Redesign Project"
                value={form.leadTitle}
                onChange={(e) => updateForm("leadTitle", e.target.value)}
                required
                className="h-11"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Deal value</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={form.value}
                  onChange={(e) => updateForm("value", e.target.value)}
                  min="0"
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label>Currency</Label>
                <Select value={form.currency} onValueChange={(v) => v !== null && updateForm("currency", v)}>
                  <SelectTrigger className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.symbol} {c.value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Lead source</Label>
              <Select value={form.source} onValueChange={(v) => v !== null && updateForm("source", v)}>
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LEAD_SOURCES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="pt-2 space-y-3">
              <Button
                type="submit"
                className="w-full h-11 bg-[#00C9A7] hover:bg-[#00b396] text-white font-semibold"
                disabled={loading}
              >
                {loading ? "Saving..." : "Add lead & go to dashboard 🎉"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full h-11 text-muted-foreground"
                onClick={handleSkip}
              >
                Skip for now
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
