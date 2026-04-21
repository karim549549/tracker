"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { AnimatePresence } from "framer-motion";
import { ColumnHeader } from "./ColumnHeader";
import { Card } from "@/components/card/Card";
import { COLUMN_NEON_COLOR } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Card as CardType, ColumnDef } from "@/shared/types";

interface ColumnProps {
  column: ColumnDef;
  cards: CardType[];
  activeCardId: string | null;
  onEditCard: (card: CardType) => void;
  onDeleteCard: (id: string, type: CardType["type"]) => void;
  onAddCard: (columnId: string) => void;
}

export function Column({
  column,
  cards,
  activeCardId,
  onEditCard,
  onDeleteCard,
  onAddCard,
}: ColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: { columnId: column.id },
  });

  const cardIds = cards.map((c) => c.id);
  const neonColor = COLUMN_NEON_COLOR[column.id] ?? "#64748b";

  return (
    <div className="flex flex-col w-72 shrink-0">
      {/* Neon top-accent header panel */}
      <div
        className="rounded-t-lg border border-border/50 border-b-0 px-3 pt-3 pb-0"
        style={{
          borderTopColor: neonColor,
          borderTopWidth: "2px",
          boxShadow: `0 -0px 12px ${neonColor}30`,
        }}
      >
        <ColumnHeader
          column={column}
          cardCount={cards.length}
          onAddCard={() => onAddCard(column.id)}
        />
      </div>

      <div
        ref={setNodeRef}
        className={cn(
          "flex flex-col gap-2 min-h-32 rounded-b-lg border border-border/50 border-t-0 p-2 transition-all duration-200",
          isOver ? "drop-zone-active" : "bg-card/30"
        )}
      >
        <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
          <AnimatePresence initial={false}>
            {cards.map((card) => (
              <Card
                key={card.id}
                card={card}
                onEdit={onEditCard}
                onDelete={onDeleteCard}
                isDragging={activeCardId === card.id}
              />
            ))}
          </AnimatePresence>
        </SortableContext>
        {cards.length === 0 && (
          <div className="flex-1 flex items-center justify-center min-h-24">
            <p className="text-xs text-muted-foreground/40 font-mono tracking-wider">
              {isOver ? "release to drop" : "empty"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
