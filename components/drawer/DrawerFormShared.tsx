"use client";

import { Label as FormLabel } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MOOD_OPTIONS, PRIORITY_OPTIONS } from "@/lib/constants";
import type { Card, Label } from "@/shared/types";
import { cn } from "@/lib/utils";

interface DrawerFormSharedProps {
  draft: Partial<Card>;
  onChange: (patch: Partial<Card>) => void;
  labels: Label[];
}

export function DrawerFormShared({ draft, onChange, labels }: DrawerFormSharedProps) {
  const selectedIds: string[] = (draft as { labelIds?: string[] }).labelIds ?? [];

  function toggleLabel(id: string) {
    const next = selectedIds.includes(id)
      ? selectedIds.filter((x) => x !== id)
      : [...selectedIds, id];
    onChange({ labelIds: next } as Partial<Card>);
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <FormLabel htmlFor="title">Title</FormLabel>
        <Input
          id="title"
          value={draft.title ?? ""}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="What needs to be done?"
        />
      </div>

      <div className="space-y-1.5">
        <FormLabel htmlFor="priority">Priority</FormLabel>
        <Select
          value={draft.priority ?? "medium"}
          onValueChange={(v) => onChange({ priority: v as Card["priority"] })}
        >
          <SelectTrigger id="priority">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PRIORITY_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <FormLabel>Mood</FormLabel>
        <div className="flex flex-wrap gap-2">
          {MOOD_OPTIONS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => onChange({ mood: emoji })}
              className={cn(
                "text-xl rounded-md p-1.5 transition-colors hover:bg-muted",
                draft.mood === emoji && "bg-muted ring-2 ring-primary"
              )}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <FormLabel>Labels</FormLabel>
        {labels.length === 0 ? (
          <p className="text-xs text-muted-foreground/50">No labels for this environment yet.</p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {labels.map((lbl) => {
              const active = selectedIds.includes(lbl.id);
              return (
                <button
                  key={lbl.id}
                  type="button"
                  onClick={() => toggleLabel(lbl.id)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium border transition-all",
                    active
                      ? "border-transparent text-white"
                      : "border-border/50 text-muted-foreground bg-muted/40 hover:bg-muted"
                  )}
                  style={active ? { background: lbl.color, borderColor: lbl.color } : {}}
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full shrink-0"
                    style={{ background: active ? "rgba(255,255,255,0.8)" : lbl.color }}
                  />
                  {lbl.name}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
