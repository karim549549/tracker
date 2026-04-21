"use client";

import { cn } from "@/lib/utils";

export type ViewMode = "feature" | "bug";

interface BoardTabsProps {
  active: ViewMode;
  onChange: (tab: ViewMode) => void;
  featureCount: number;
  bugCount: number;
}

export function BoardTabs({ active, onChange, featureCount, bugCount }: BoardTabsProps) {
  const tabs = [
    { id: "feature" as ViewMode, label: "Features", count: featureCount },
    { id: "bug" as ViewMode, label: "Bugs", count: bugCount },
  ];

  return (
    <div className="flex items-center gap-1 border-b border-border/50 px-6 bg-background/60 backdrop-blur-sm">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all duration-200",
            active === tab.id
              ? "border-primary text-foreground tab-neon-active"
              : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
          )}
        >
          {tab.label}
          <span
            className={cn(
              "inline-flex items-center justify-center rounded-full text-xs font-medium h-5 min-w-5 px-1.5 transition-all duration-200",
              active === tab.id
                ? "bg-primary/20 text-primary border border-primary/40"
                : "bg-muted text-muted-foreground"
            )}
          >
            {tab.count}
          </span>
        </button>
      ))}
    </div>
  );
}
