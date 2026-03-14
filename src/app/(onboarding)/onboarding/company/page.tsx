"use client";

import { useState } from "react";
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
import { COUNTRIES, CURRENCIES, TIMEZONES } from "@/lib/constants";
import { Building2, Rocket } from "lucide-react";

export default function OnboardingCompanyPage() {
  const [loading, setLoading] = useState(false);
  const [loadingDemo, setLoadingDemo] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    country: "US",
    currency: "USD",
    timezone: "UTC",
  });

  function updateForm(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent, loadDemo = false) {
    e.preventDefault();
    setError("");
    if (loadDemo) setLoadingDemo(true);
    else setLoading(true);

    // Use service-role API route — guaranteed to bypass RLS
    const res = await fetch("/api/onboarding/setup-company", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, loadDemo }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Something went wrong. Please try again.");
      setLoading(false);
      setLoadingDemo(false);
      return;
    }

    // Hard navigation so middleware refreshes session before the next page loads
    window.location.href = "/onboarding/team";
  }

  return (
    <div className="space-y-6">
      {/* Step indicator */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
          1
        </div>
        <div>
          <h2 className="font-bold text-xl text-foreground">Set up your company</h2>
          <p className="text-sm text-muted-foreground">Takes about 60 seconds</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Building2 className="w-5 h-5 text-accent" />
            Company Details
          </CardTitle>
          <CardDescription>
            This will appear on your invoices and throughout the app
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => handleSubmit(e)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Company name *</Label>
              <Input
                id="name"
                placeholder="Acme Corp"
                value={form.name}
                onChange={(e) => updateForm("name", e.target.value)}
                required
                className="h-11"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Country</Label>
                <Select value={form.country} onValueChange={(v) => v !== null && updateForm("country", v)}>
                  <SelectTrigger className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Default currency</Label>
                <Select value={form.currency} onValueChange={(v) => v !== null && updateForm("currency", v)}>
                  <SelectTrigger className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.symbol} {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Timezone</Label>
              <Select value={form.timezone} onValueChange={(v) => v !== null && updateForm("timezone", v)}>
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIMEZONES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {error && (
              <div className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-md">
                {error}
              </div>
            )}

            <div className="pt-2 space-y-3">
              <Button
                type="submit"
                className="w-full h-11 bg-primary hover:bg-primary/80 text-primary-foreground"
                disabled={loading || loadingDemo || !form.name}
              >
                {loading ? "Saving..." : "Continue →"}
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full h-11 border-accent text-accent hover:bg-accent hover:text-white"
                disabled={loading || loadingDemo || !form.name}
                onClick={(e) => handleSubmit(e as React.FormEvent, true)}
              >
                <Rocket className="w-4 h-4 mr-2" />
                {loadingDemo ? "Loading demo..." : "Load 5 demo leads & continue →"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
