"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { CardBadge } from "@/components/card/CardBadge";
import { PRIORITY_COLORS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import type { Card, Label } from "@/shared/types";

interface CardFullViewProps {
  card: Card | null;
  isOpen: boolean;
  labels?: Label[];
  onClose: () => void;
}

export function CardFullView({ card, isOpen, labels = [], onClose }: CardFullViewProps) {
  if (!card) return null;

  const isBug = card.type === "bug";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm text-muted-foreground font-medium uppercase tracking-wider">
              {card.type}
            </span>
            <span className="text-muted-foreground/40">·</span>
            <CardBadge
              label={card.priority}
              className={PRIORITY_COLORS[card.priority]}
            />
            {isBug && card.isCauseVerified && (
              <CardBadge
                label="Cause verified"
                className="bg-emerald-500/15 text-emerald-400 border-emerald-500/20"
              />
            )}
          </div>
          <DialogTitle className="text-xl leading-snug">{card.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 mt-2">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-2xl">{card.mood}</span>
            {card.labelIds.map((id) => {
              const lbl = labels.find((l) => l.id === id);
              if (!lbl) return null;
              return (
                <span
                  key={id}
                  className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium text-white"
                  style={{ background: lbl.color }}
                >
                  {lbl.name}
                </span>
              );
            })}
          </div>

          <div className="text-xs text-muted-foreground space-y-0.5">
            <p>Created: {formatDate(card.createdAt)}</p>
            <p>Updated: {formatDate(card.updatedAt)}</p>
          </div>

          <Separator />

          {!isBug && card.implementationPlan && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold">Implementation Plan</h4>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {card.implementationPlan}
              </p>
            </div>
          )}

          {isBug && (
            <div className="space-y-4">
              {card.reason && (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">Root Cause</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                    {card.reason}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
