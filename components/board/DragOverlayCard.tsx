import { cn } from "@/lib/utils";
import { PRIORITY_COLORS, PRIORITY_ACCENT } from "@/lib/constants";
import { CardBadge } from "@/components/card/CardBadge";
import type { Card } from "@/shared/types";

interface DragOverlayCardProps {
  card: Card;
}

export function DragOverlayCard({ card }: DragOverlayCardProps) {
  return (
    <div
      className={cn(
        "relative rounded-lg border border-primary/60 bg-card p-3 overflow-hidden",
        "rotate-2 scale-105 cursor-grabbing w-64",
        "shadow-[0_0_30px_rgba(139,92,246,0.25),0_20px_40px_rgba(0,0,0,0.6)]"
      )}
    >
      <div
        className={cn("absolute left-0 top-0 bottom-0 w-[3px] rounded-l-lg", PRIORITY_ACCENT[card.priority])}
      />
      <div className="flex items-start gap-2 mb-2 pl-2">
        <span className="text-sm font-medium leading-snug line-clamp-2 flex-1">
          {card.title}
        </span>
        <span className="text-base leading-none">{card.mood}</span>
      </div>
      <div className="flex items-center gap-1.5 pl-2">
        <CardBadge
          label={card.priority}
          className={PRIORITY_COLORS[card.priority]}
        />
      </div>
    </div>
  );
}
