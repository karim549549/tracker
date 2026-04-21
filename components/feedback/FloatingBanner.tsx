"use client";

import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

type BannerType = "success" | "info" | "warning";

const BANNER_COLORS: Record<BannerType, string> = {
  success: "bg-emerald-500/90 text-white",
  info: "bg-blue-500/90 text-white",
  warning: "bg-amber-500/90 text-white",
};

interface FloatingBannerProps {
  message: string | null;
  type: BannerType | null;
}

export function FloatingBanner({ message, type }: FloatingBannerProps) {
  return (
    <AnimatePresence>
      {message && type && (
        <motion.div
          key={message}
          initial={{ y: -64, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -64, opacity: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 28 }}
          className={cn(
            "fixed top-4 left-1/2 -translate-x-1/2 z-50",
            "px-5 py-2.5 rounded-full shadow-lg text-sm font-medium",
            BANNER_COLORS[type]
          )}
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
