"use client";

import { useCallback } from "react";
import type { DragEndEvent } from "@dnd-kit/core";
import type { BoardType, Card } from "@/shared/types";
import type { useCardMutations } from "./useCardMutations";

type MoveCard = ReturnType<typeof useCardMutations>["moveCard"];

export function useDragEnd(
  moveCard: MoveCard,
  boardType: BoardType,
  onMovedToDone?: (card: Card) => void
) {
  return useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const newStatus = over.data.current?.columnId as string | undefined;
      if (!newStatus) return;

      moveCard(String(active.id), boardType, newStatus);

      if (newStatus === "done" && onMovedToDone) {
        const card = active.data.current?.card as Card | undefined;
        if (card) onMovedToDone(card);
      }
    },
    [moveCard, boardType, onMovedToDone]
  );
}
