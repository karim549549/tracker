import type { ColumnDef } from "@/shared/types";

export const FEATURE_COLUMNS: ColumnDef[] = [
  { id: "open", label: "Open" },
  { id: "in-development", label: "In Development" },
  { id: "review", label: "Review" },
  { id: "testing", label: "Testing" },
  { id: "done", label: "Done" },
];

export const BUG_COLUMNS: ColumnDef[] = [
  { id: "open", label: "Open" },
  { id: "in-development", label: "In Development" },
  { id: "api-tested", label: "API Tested" },
  { id: "qa-tested", label: "QA Tested" },
  { id: "done", label: "Done" },
];

export const PRIORITY_OPTIONS = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
] as const;

export const MOOD_OPTIONS = [
  "🎯", "🔥", "😊", "😤", "😴", "🤔", "😎", "😬", "💪", "🚀",
] as const;

/* Neon badge colors */
export const PRIORITY_COLORS: Record<string, string> = {
  low:    "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  medium: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  high:   "bg-rose-500/15 text-rose-300 border-rose-500/30",
};

/* Left-edge accent strip on cards */
export const PRIORITY_ACCENT: Record<string, string> = {
  low:    "bg-emerald-400",
  medium: "bg-amber-400",
  high:   "bg-rose-400",
};

/* Neon status badge colors */
export const STATUS_COLORS: Record<string, string> = {
  "open":           "bg-slate-500/15 text-slate-300 border-slate-500/30",
  "in-development": "bg-violet-500/15 text-violet-300 border-violet-500/30",
  "review":         "bg-purple-500/15 text-purple-300 border-purple-500/30",
  "testing":        "bg-orange-500/15 text-orange-300 border-orange-500/30",
  "api-tested":     "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
  "qa-tested":      "bg-teal-500/15 text-teal-300 border-teal-500/30",
  "done":           "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
};

/* Neon top-border color per column (CSS color values for inline style) */
export const COLUMN_NEON_COLOR: Record<string, string> = {
  "open":           "#64748b",
  "in-development": "#8b5cf6",
  "review":         "#a855f7",
  "testing":        "#f97316",
  "api-tested":     "#06b6d4",
  "qa-tested":      "#14b8a6",
  "done":           "#10b981",
};
