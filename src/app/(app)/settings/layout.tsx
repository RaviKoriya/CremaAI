import Link from "next/link";

const SETTINGS_NAV = [
  { label: "Company", href: "/settings/company" },
  { label: "Team", href: "/settings/team" },
  { label: "Pipeline Stages", href: "/settings/pipeline" },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
      <h1 className="text-xl font-bold text-foreground mb-6">Settings</h1>
      <div className="flex gap-1 mb-6 border-b pb-0">
        {SETTINGS_NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground border-b-2 border-transparent hover:border-border -mb-px transition-colors"
          >
            {item.label}
          </Link>
        ))}
      </div>
      {children}
    </div>
  );
}
