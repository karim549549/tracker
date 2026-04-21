"use client";

import { useState, useEffect, useRef } from "react";
import { RefreshCw, Sparkles } from "lucide-react";
import { BUILT_IN_QUOTES, GEMINI_QUOTES_PROMPT } from "@/lib/quotes";
import { GEMINI_API_KEY, GEMINI_MODEL } from "@/lib/ai-config";
import { cn } from "@/lib/utils";

async function fetchAIQuotes(): Promise<string[]> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: GEMINI_QUOTES_PROMPT }] }],
        generationConfig: { responseMimeType: "application/json", temperature: 1.3 },
      }),
    }
  );
  if (!res.ok) throw new Error(`Gemini ${res.status}`);
  const data = await res.json();
  const text: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "[]";
  const parsed = JSON.parse(text);
  if (!Array.isArray(parsed)) throw new Error("Not an array");
  return (parsed as unknown[]).filter((q) => typeof q === "string") as string[];
}

export function MarqueeBar() {
  const [quotes, setQuotes] = useState<string[]>(BUILT_IN_QUOTES);
  const [isFetching, setIsFetching] = useState(false);
  const [shuffleKey, setShuffleKey] = useState(0);

  const shuffledQuotes = useRef<string[]>([...BUILT_IN_QUOTES].sort(() => Math.random() - 0.5));

  useEffect(() => {
    shuffledQuotes.current = [...quotes].sort(() => Math.random() - 0.5);
  }, [quotes, shuffleKey]);

  function handleShuffle() {
    setShuffleKey((k) => k + 1);
  }

  async function handleAIRefresh() {
    setIsFetching(true);
    try {
      const fresh = await fetchAIQuotes();
      if (fresh.length > 0) setQuotes(fresh);
      setShuffleKey((k) => k + 1);
    } catch {
      setShuffleKey((k) => k + 1);
    } finally {
      setIsFetching(false);
    }
  }

  // Duplicate track for seamless loop
  const track = [...shuffledQuotes.current, ...shuffledQuotes.current];
  // ~5s per quote, min 60s total — slow, relaxed ticker pace
  const duration = Math.max(60, quotes.length * 5);

  return (
    <div
      className="flex items-center gap-2 border-b overflow-hidden shrink-0"
      style={{
        minHeight: 28,
        background: "color-mix(in srgb, var(--primary) 6%, var(--background))",
        borderColor: "color-mix(in srgb, var(--primary) 22%, transparent)",
        boxShadow: "0 1px 0 0 color-mix(in srgb, var(--primary) 18%, transparent)",
      }}
    >
      {/* Scrolling track */}
      <div className="flex-1 overflow-hidden relative">
        {/* Left fade */}
        <div
          className="absolute left-0 top-0 bottom-0 w-10 z-10 pointer-events-none"
          style={{
            background: "linear-gradient(to right, color-mix(in srgb, var(--primary) 6%, var(--background)), transparent)",
          }}
        />
        {/* Right fade */}
        <div
          className="absolute right-0 top-0 bottom-0 w-10 z-10 pointer-events-none"
          style={{
            background: "linear-gradient(to left, color-mix(in srgb, var(--primary) 6%, var(--background)), transparent)",
          }}
        />

        <div
          key={shuffleKey}
          className="flex items-center whitespace-nowrap"
          style={{
            animation: `marquee-scroll ${duration}s linear infinite`,
            width: "max-content",
          }}
        >
          {track.map((quote, i) => (
            <span key={i} className="flex items-center shrink-0">
              <span
                className="text-[11px] px-5 py-1.5 leading-none font-medium tracking-wide"
                style={{
                  color: "color-mix(in srgb, var(--primary) 40%, white)",
                  textShadow:
                    "0 0 6px var(--primary), 0 0 14px color-mix(in srgb, var(--primary) 55%, transparent)",
                }}
              >
                {quote}
              </span>
              <span
                className="h-[5px] w-[5px] rounded-full shrink-0"
                style={{
                  background: "var(--primary)",
                  boxShadow:
                    "0 0 5px var(--primary), 0 0 10px color-mix(in srgb, var(--primary) 50%, transparent)",
                  opacity: 0.85,
                }}
              />
            </span>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-0.5 px-2 shrink-0">
        <button
          onClick={handleShuffle}
          className="h-5 w-5 flex items-center justify-center rounded transition-colors"
          style={{ color: "color-mix(in srgb, var(--primary) 45%, var(--muted-foreground))" }}
          title="Shuffle quotes"
        >
          <RefreshCw className="h-3 w-3" />
        </button>
        <button
          onClick={handleAIRefresh}
          disabled={isFetching}
          className={cn(
            "h-5 w-5 flex items-center justify-center rounded transition-colors",
            isFetching ? "opacity-40 cursor-not-allowed" : ""
          )}
          style={{ color: "color-mix(in srgb, var(--primary) 70%, white)" }}
          title="Generate fresh quotes with AI"
        >
          <Sparkles
            className={cn("h-3 w-3", isFetching && "animate-pulse")}
            style={{
              filter: isFetching
                ? undefined
                : "drop-shadow(0 0 4px var(--primary))",
            }}
          />
        </button>
      </div>
    </div>
  );
}
