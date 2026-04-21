"use client";

import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Card } from "@/shared/types";

interface CardMenuProps {
  card: Card;
  onEdit: (card: Card) => void;
  onDelete: (id: string, type: Card["type"]) => void;
}

export function CardMenu({ card, onEdit, onDelete }: CardMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="inline-flex items-center justify-center h-6 w-6 rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-accent"
        onClick={(e) => e.stopPropagation()}
      >
        <MoreHorizontal className="h-3.5 w-3.5" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-36">
        <DropdownMenuItem onClick={() => onEdit(card)}>
          <Pencil className="mr-2 h-3.5 w-3.5" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-destructive"
          onClick={() => onDelete(card.id, card.type)}
        >
          <Trash2 className="mr-2 h-3.5 w-3.5" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
