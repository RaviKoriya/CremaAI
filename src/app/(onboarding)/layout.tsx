import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const STEPS = [
  { label: "Company Setup", href: "/onboarding/company" },
  { label: "Invite Team", href: "/onboarding/team" },
  { label: "First Lead", href: "/onboarding/first-lead" },
];

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#0F1E3C] text-white py-4 px-6">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#00C9A7] flex items-center justify-center flex-shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M3 3h8v8H3V3zm10 0h8v8h-8V3zm-10 10h8v8H3v-8zm13 4a4 4 0 100-8 4 4 0 000 8z" fill="white" />
            </svg>
          </div>
          <span className="font-bold text-lg">LeadFlow</span>
          <div className="flex-1 flex items-center justify-end gap-2">
            {STEPS.map((step, i) => (
              <div key={step.href} className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded-full bg-white/20 text-white text-xs flex items-center justify-center font-bold">
                    {i + 1}
                  </div>
                  <span className="text-sm text-white/70 hidden sm:block">{step.label}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="w-6 h-px bg-white/20 hidden sm:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
