"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { STATUS_COLORS } from "@/lib/constants";
import type { ColumnDef } from "@/shared/types";

interface ColumnHeaderProps {
  column: ColumnDef;
  cardCount: number;
  onAddCard: () => void;
}

export function ColumnHeader({ column, cardCount, onAddCard }: ColumnHeaderProps) {
  const colorClass = STATUS_COLORS[column.id] ?? "bg-muted/50 text-muted-foreground border-border/40";

  return (
    <div className="flex items-center justify-between mb-3 px-1">
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-semibold text-foreground">{column.label}</h3>
        <span
          className={cn(
            "inline-flex items-center justify-center rounded-full border text-xs font-medium h-5 min-w-5 px-1.5",
            colorClass
          )}
        >
          {cardCount}
        </span>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 opacity-60 hover:opacity-100"
        onClick={onAddCard}
        title={`Add to ${column.label}`}
      >
        <Plus className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
