// Public Giphy beta key — replace with your own from developers.giphy.com for higher rate limits
const GIPHY_KEY = "dc6zaTOxFJmzC";

const MOOD_QUERIES: Record<string, string> = {
  "🎯": "nailed it",
  "🔥": "on fire",
  "😊": "happy dance",
  "😤": "victory fist",
  "😴": "finally done",
  "🤔": "eureka",
  "😎": "smooth operator",
  "😬": "phew relief",
  "💪": "strong victory",
  "🚀": "rocket launch success",
};

const BUG_POOL = ["bug fixed", "bug squashed", "gotcha", "victory", "fixed it", "problem solved"];
const FEATURE_POOL = ["ship it", "we did it", "success", "level up", "launched", "nailed it"];
const HIGH_POOL = ["epic win", "clutch", "legendary", "mind blown"];

export function buildGifQuery(card: {
  type: string;
  priority: string;
  mood: string;
}): string {
  const moodQuery = MOOD_QUERIES[card.mood];
  if (moodQuery) return moodQuery;

  const base = card.type === "bug" ? BUG_POOL : FEATURE_POOL;
  const pool = card.priority === "high" ? [...base, ...HIGH_POOL] : base;
  return pool[Math.floor(Math.random() * pool.length)];
}

export async function fetchRandomGif(query: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://api.giphy.com/v1/gifs/random?api_key=${GIPHY_KEY}&tag=${encodeURIComponent(query)}&rating=g`
    );
    if (!res.ok) return null;
    const data = await res.json();
    return (data?.data?.images?.fixed_height?.url as string | undefined) ?? null;
  } catch {
    return null;
  }
}
