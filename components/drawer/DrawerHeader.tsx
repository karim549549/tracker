"use client";

import { Expand, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CardBadge } from "@/components/card/CardBadge";
import { PRIORITY_COLORS } from "@/lib/constants";
import type { Card } from "@/shared/types";

interface DrawerHeaderProps {
  card: Card | null;
  isCreating: boolean;
  boardType: "feature" | "bug";
  onExpand: () => void;
  onClose: () => void;
}

export function DrawerHeader({
  card,
  isCreating,
  boardType,
  onExpand,
  onClose,
}: DrawerHeaderProps) {
  const typeLabel = boardType === "feature" ? "Feature" : "Bug";

  return (
    <div className="flex items-start justify-between gap-3 pb-4 border-b border-border">
      <div className="space-y-1.5 flex-1 min-w-0">
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
          {isCreating ? `New ${typeLabel}` : typeLabel}
        </p>
        {card && !isCreating && (
          <div className="flex items-center gap-2 flex-wrap">
            <CardBadge
              label={card.priority}
              size="md"
              className={PRIORITY_COLORS[card.priority]}
            />
            {card.type === "bug" && card.isCauseVerified && (
              <CardBadge
                label="Cause verified"
                size="md"
                className="bg-emerald-500/15 text-emerald-400 border-emerald-500/20"
              />
            )}
          </div>
        )}
      </div>
      <div className="flex items-center gap-1 shrink-0">
        {!isCreating && (
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onExpand}>
            <Expand className="h-3.5 w-3.5" />
          </Button>
        )}
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
