"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { PRIORITY_COLORS, PRIORITY_ACCENT } from "@/lib/constants";
import { CardBadge } from "./CardBadge";
import { CardMenu } from "./CardMenu";
import type { Card as CardType } from "@/shared/types";

interface CardProps {
  card: CardType;
  onEdit: (card: CardType) => void;
  onDelete: (id: string, type: CardType["type"]) => void;
  isDragging?: boolean;
}

export function Card({ card, onEdit, onDelete, isDragging }: CardProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: card.id,
      data: { card },
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.15 }}
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onEdit(card)}
      className={cn(
        "group relative rounded-lg border border-border bg-card p-3 cursor-pointer overflow-hidden",
        "card-glow select-none",
        isDragging && "opacity-30"
      )}
    >
      {/* Priority left-edge accent */}
      <div
        className={cn(
          "absolute left-0 top-0 bottom-0 w-[3px] rounded-l-lg",
          PRIORITY_ACCENT[card.priority]
        )}
      />

      <div className="flex items-start justify-between gap-2 mb-2 pl-2">
        <span className="text-sm font-medium leading-snug line-clamp-2 flex-1 text-foreground/90">
          {card.title}
        </span>
        <div className="flex items-center gap-1 shrink-0">
          <span className="text-base leading-none">{card.mood}</span>
          <CardMenu card={card} onEdit={onEdit} onDelete={onDelete} />
        </div>
      </div>

      <div className="flex items-center gap-1.5 flex-wrap pl-2">
        <CardBadge
          label={card.priority}
          className={PRIORITY_COLORS[card.priority]}
        />
        {(card.labelIds ?? []).length > 0 && (
          <span className="inline-flex items-center gap-1 rounded-full border border-border/40 bg-muted/60 px-2 py-0.5 text-xs text-muted-foreground/70">
            🏷 {(card.labelIds ?? []).length}
          </span>
        )}
      </div>

      {card.type === "bug" && card.isCauseVerified && (
        <div className="mt-1.5 flex items-center gap-1 pl-2">
          <span className="text-xs text-emerald-400 font-medium">✓ Cause verified</span>
        </div>
      )}
    </motion.div>
  );
}
