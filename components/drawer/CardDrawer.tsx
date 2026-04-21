"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { DrawerHeader } from "./DrawerHeader";
import { DrawerFormShared } from "./DrawerFormShared";
import { DrawerFormFeature } from "./DrawerFormFeature";
import { DrawerFormBug } from "./DrawerFormBug";
import type { Card, BugCard, FeatureCard, BoardType, Label } from "@/shared/types";
import type { useCardMutations } from "@/hooks/useCardMutations";

interface CardDrawerProps {
  isOpen: boolean;
  activeCard: Card | null;
  boardType: BoardType;
  initialColumnId?: string;
  mutations: ReturnType<typeof useCardMutations>;
  labels: Label[];
  onClose: () => void;
  onExpand: () => void;
}

function buildDraft(card: Card | null, boardType: BoardType, columnId?: string): Partial<Card> {
  if (card) return { ...card };
  const base = {
    title: "",
    type: boardType,
    priority: "medium" as const,
    status: columnId ?? "open",
    mood: "🎯",
    labelIds: [],
  };
  if (boardType === "feature") return { ...base, implementationPlan: "" } as Partial<FeatureCard>;
  return { ...base, reason: "", isCauseVerified: false } as Partial<BugCard>;
}

export function CardDrawer({
  isOpen,
  activeCard,
  boardType,
  initialColumnId,
  mutations,
  labels,
  onClose,
  onExpand,
}: CardDrawerProps) {
  const isCreating = !activeCard;
  const [draft, setDraft] = useState<Partial<Card>>(() =>
    buildDraft(activeCard, boardType, initialColumnId)
  );

  useEffect(() => {
    setDraft(buildDraft(activeCard, boardType, initialColumnId));
  }, [activeCard, boardType, initialColumnId]);

  function patch(p: Partial<Card>) {
    setDraft((prev) => ({ ...prev, ...p }));
  }

  function handleSave() {
    if (!draft.title?.trim()) return;
    if (isCreating) {
      mutations.addCard(draft as Omit<Card, "id" | "createdAt" | "updatedAt">);
    } else if (activeCard) {
      mutations.updateCard(activeCard.id, activeCard.type, draft);
    }
    onClose();
  }

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-[420px] sm:w-[480px] p-0 flex flex-col gap-0">
        <div className="p-5 flex flex-col gap-0 flex-1 overflow-y-auto">
          <DrawerHeader
            card={activeCard}
            isCreating={isCreating}
            boardType={boardType}
            onExpand={onExpand}
            onClose={onClose}
          />
          <motion.div
            key={activeCard?.id ?? "new"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15 }}
            className="mt-5 space-y-5"
          >
            <DrawerFormShared draft={draft} onChange={patch} labels={labels} />
            <Separator />
            {boardType === "feature" ? (
              <DrawerFormFeature
                draft={draft as Partial<FeatureCard>}
                onChange={patch}
              />
            ) : (
              <DrawerFormBug
                draft={draft as Partial<BugCard>}
                onChange={patch}
              />
            )}
          </motion.div>
        </div>
        <div className="border-t border-border p-4 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!draft.title?.trim()}>
            {isCreating ? "Create" : "Save"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
