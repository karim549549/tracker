"use client";

import { useCallback } from "react";
import { toast } from "sonner";
import type { AppData, Card, BoardType } from "@/shared/types";
import { generateId, now } from "@/lib/utils";

export function useCardMutations(
  appData: AppData | null,
  activeProjectId: string | null,
  persist: (data: AppData) => Promise<void>
) {
  const patchProject = useCallback(
    (updater: (proj: AppData["projects"][number]) => AppData["projects"][number]) => {
      if (!appData || !activeProjectId) return;
      const updated: AppData = {
        ...appData,
        projects: appData.projects.map((p) =>
          p.id === activeProjectId ? updater(p) : p
        ),
      };
      persist(updated);
    },
    [appData, activeProjectId, persist]
  );

  const addCard = useCallback(
    (draft: Omit<Card, "id" | "createdAt" | "updatedAt">) => {
      const ts = now();
      const card = {
        ...draft,
        id: generateId(),
        createdAt: ts,
        updatedAt: ts,
        labelIds: (draft as Card & { labelIds?: string[] }).labelIds ?? [],
        completedAt: draft.status === "done" ? ts : undefined,
      } as Card;
      const key = card.type === "feature" ? "features" : "bugs";
      patchProject((p) => ({ ...p, [key]: [...p[key], card] }));
      toast.success(`"${card.title}" added`);
    },
    [patchProject]
  );

  const updateCard = useCallback(
    (id: string, type: BoardType, patch: Partial<Card>) => {
      const key = type === "feature" ? "features" : "bugs";
      patchProject((p) => ({
        ...p,
        [key]: (p[key] as Card[]).map((c) => {
          if (c.id !== id) return c;
          const newStatus = (patch as Partial<Card>).status ?? c.status;
          return {
            ...c,
            ...patch,
            updatedAt: now(),
            completedAt:
              newStatus === "done"
                ? c.completedAt ?? now()
                : undefined,
          };
        }),
      }));
      toast.success("Card updated");
    },
    [patchProject]
  );

  const deleteCard = useCallback(
    (id: string, type: BoardType) => {
      const key = type === "feature" ? "features" : "bugs";
      patchProject((p) => ({
        ...p,
        [key]: (p[key] as Card[]).filter((c) => c.id !== id),
      }));
      toast.success("Card deleted");
    },
    [patchProject]
  );

  const moveCard = useCallback(
    (id: string, type: BoardType, newStatus: string) => {
      const key = type === "feature" ? "features" : "bugs";
      patchProject((p) => ({
        ...p,
        [key]: (p[key] as Card[]).map((c) =>
          c.id === id
            ? {
                ...c,
                status: newStatus,
                updatedAt: now(),
                completedAt: newStatus === "done" ? c.completedAt ?? now() : undefined,
              }
            : c
        ),
      }));
      toast.info(`Moved to ${newStatus.replace(/-/g, " ")}`);
    },
    [patchProject]
  );

  return { addCard, updateCard, deleteCard, moveCard };
}
