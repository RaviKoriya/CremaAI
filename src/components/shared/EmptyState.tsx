import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({ title, description, icon, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center py-16 px-4",
        className
      )}
    >
      {icon ? (
        <div className="mb-4 text-muted-foreground">{icon}</div>
      ) : (
        <div className="mb-4">
          <svg
            width="80"
            height="80"
            viewBox="0 0 80 80"
            fill="none"
            className="text-gray-200"
          >
            <circle cx="40" cy="40" r="40" fill="currentColor" />
            <path
              d="M28 40h24M40 28v24"
              stroke="#CBD5E1"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
        </div>
      )}
      <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground mb-6 max-w-xs">{description}</p>
      )}
      {action && (
        <Button
          onClick={action.onClick}
          className="bg-[#0F1E3C] hover:bg-[#1a2f5e] text-white"
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}
