"use client";

import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { Column } from "./Column";
import { DragOverlayCard } from "./DragOverlayCard";
import { useDragEnd } from "@/hooks/useDragEnd";
import type { Card, ColumnDef, BoardType } from "@/shared/types";
import type { useCardMutations } from "@/hooks/useCardMutations";

interface BoardProps {
  columns: ColumnDef[];
  cards: Card[];
  boardType: BoardType;
  mutations: ReturnType<typeof useCardMutations>;
  onEditCard: (card: Card) => void;
  onAddCard: (columnId: string) => void;
  onCardDone?: (card: Card) => void;
}

export function Board({
  columns,
  cards,
  boardType,
  mutations,
  onEditCard,
  onAddCard,
  onCardDone,
}: BoardProps) {
  const [activeCardId, setActiveCardId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = useDragEnd(mutations.moveCard, boardType, onCardDone);

  const activeCard = activeCardId ? cards.find((c) => c.id === activeCardId) ?? null : null;

  const cardsForColumn = (columnId: string) =>
    cards.filter((c) => c.status === columnId);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={(e) => setActiveCardId(String(e.active.id))}
      onDragEnd={(e) => {
        handleDragEnd(e);
        setActiveCardId(null);
      }}
      onDragCancel={() => setActiveCardId(null)}
    >
      <div className="flex gap-4 overflow-x-auto pb-4 px-6 pt-4 min-h-full board-grid">
        {columns.map((col) => (
          <Column
            key={col.id}
            column={col}
            cards={cardsForColumn(col.id)}
            activeCardId={activeCardId}
            onEditCard={onEditCard}
            onDeleteCard={mutations.deleteCard}
            onAddCard={onAddCard}
          />
        ))}
      </div>
      <DragOverlay>
        {activeCard && <DragOverlayCard card={activeCard} />}
      </DragOverlay>
    </DndContext>
  );
}
