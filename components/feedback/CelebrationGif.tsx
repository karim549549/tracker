"use client";

import { useEffect, useState, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

interface CelebrationGifProps {
  gifUrl: string | null;
  cardTitle: string;
  cardType: string;
  onDismiss: () => void;
}

const DURATION_MS = 5000;

export function CelebrationGif({ gifUrl, cardTitle, cardType, onDismiss }: CelebrationGifProps) {
  const [progress, setProgress] = useState(100);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    if (!gifUrl) return;
    setProgress(100);
    startRef.current = null;

    const tick = (ts: number) => {
      if (!startRef.current) startRef.current = ts;
      const elapsed = ts - startRef.current;
      const remaining = Math.max(0, 1 - elapsed / DURATION_MS);
      setProgress(remaining * 100);
      if (remaining > 0) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        onDismiss();
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gifUrl]);

  const label = cardType === "bug" ? "🐛 Bug squashed!" : "✨ Feature shipped!";

  return (
    <AnimatePresence>
      {gifUrl && (
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.85, y: 20 }}
          transition={{ type: "spring", stiffness: 340, damping: 26 }}
          className="fixed bottom-6 right-6 z-50 w-72 rounded-2xl overflow-hidden select-none"
          style={{
            background: "color-mix(in srgb, var(--card) 95%, transparent)",
            border: "1px solid color-mix(in srgb, var(--primary) 40%, transparent)",
            boxShadow:
              "0 0 0 1px color-mix(in srgb, var(--primary) 20%, transparent), 0 8px 32px rgb(0 0 0 / 55%), 0 0 24px color-mix(in srgb, var(--primary) 18%, transparent)",
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-3 py-2"
            style={{ background: "color-mix(in srgb, var(--primary) 12%, transparent)" }}
          >
            <div className="flex flex-col gap-0.5 min-w-0">
              <span
                className="text-[10px] font-bold tracking-widest uppercase"
                style={{ color: "var(--primary)", textShadow: "0 0 8px var(--primary)" }}
              >
                {label}
              </span>
              <span className="text-xs text-foreground/80 truncate leading-tight">
                {cardTitle}
              </span>
            </div>
            <button
              onClick={onDismiss}
              className="h-5 w-5 flex items-center justify-center rounded shrink-0 ml-2 text-muted-foreground/60 hover:text-foreground transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </div>

          {/* GIF */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={gifUrl}
            alt="celebration"
            className="w-full object-cover"
            style={{ maxHeight: 200 }}
          />

          {/* Countdown bar */}
          <div className="h-[3px] w-full" style={{ background: "var(--border)" }}>
            <div
              className="h-full transition-none"
              style={{
                width: `${progress}%`,
                background: "var(--primary)",
                boxShadow: "0 0 6px var(--primary)",
              }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
