import { cn } from "@/lib/utils";

interface CardBadgeProps {
  label: string;
  className?: string;
  size?: "sm" | "md";
}

export function CardBadge({ label, className, size = "sm" }: CardBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border font-medium",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm",
        className
      )}
    >
      {label}
    </span>
  );
}
