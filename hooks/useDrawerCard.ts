"use client";

import { useState } from "react";
import type { Card } from "@/shared/types";

interface UseDrawerCardReturn {
  activeCard: Card | null;
  isDrawerOpen: boolean;
  isFullViewOpen: boolean;
  openCard: (card: Card | null) => void;
  closeDrawer: () => void;
  openFullView: () => void;
  closeFullView: () => void;
}

export function useDrawerCard(): UseDrawerCardReturn {
  const [activeCard, setActiveCard] = useState<Card | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isFullViewOpen, setIsFullViewOpen] = useState(false);

  function openCard(card: Card | null) {
    setActiveCard(card);
    setIsDrawerOpen(true);
  }

  function closeDrawer() {
    setIsDrawerOpen(false);
    setIsFullViewOpen(false);
  }

  function openFullView() {
    setIsFullViewOpen(true);
  }

  function closeFullView() {
    setIsFullViewOpen(false);
  }

  return {
    activeCard,
    isDrawerOpen,
    isFullViewOpen,
    openCard,
    closeDrawer,
    openFullView,
    closeFullView,
  };
}
