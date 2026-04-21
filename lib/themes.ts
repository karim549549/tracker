import { GEMINI_API_KEY, GEMINI_MODEL } from "./ai-config";
import { getFontVar, FONT_NAMES_FOR_PROMPT, FONT_OPTIONS } from "./fonts";

export type SystemThemeId =
  | "neon-violet"
  | "cyber-teal"
  | "synthwave"
  | "midnight-rose"
  | "deep-ocean"
  | "matrix";

/** Any string — system ID or custom UUID */
export type ThemeId = string;

export const CUSTOM_THEMES_KEY = "tracker-custom-themes";

export interface ThemeCSSVars {
  "--background": string;
  "--foreground": string;
  "--card": string;
  "--card-foreground": string;
  "--popover": string;
  "--popover-foreground": string;
  "--primary": string;
  "--primary-foreground": string;
  "--primary-alt": string;
  "--secondary": string;
  "--secondary-foreground": string;
  "--muted": string;
  "--muted-foreground": string;
  "--accent": string;
  "--accent-foreground": string;
  "--destructive": string;
  "--border": string;
  "--input": string;
  "--ring": string;
  "--sidebar": string;
  "--sidebar-foreground": string;
  "--sidebar-primary": string;
  "--sidebar-primary-foreground": string;
  "--sidebar-accent": string;
  "--sidebar-accent-foreground": string;
  "--sidebar-border": string;
  "--sidebar-ring": string;
}

export interface ThemePreview {
  background: string;
  headerBg: string;
  card: string;
  cardInner: string;
  border: string;
  primary: string;
  primaryAlt: string;
  col1: string;
  col2: string;
  col3: string;
}

export interface ThemeDefinition {
  id: ThemeId;
  name: string;
  description: string;
  fontName: string;   // display name, must match FONT_OPTIONS entry
  cssVars: ThemeCSSVars;
  preview: ThemePreview;
}

export interface CustomTheme extends ThemeDefinition {
  isPersonal: true;
  generatedAt: string;
}

export const THEMES: ThemeDefinition[] = [
  {
    id: "neon-violet",
    name: "Neon Violet",
    description: "Deep space · violet",
    fontName: "Space Grotesk",
    cssVars: {
      "--background": "#0b0c14",
      "--foreground": "#e8e9f0",
      "--card": "#131520",
      "--card-foreground": "#e8e9f0",
      "--popover": "#0e0f1a",
      "--popover-foreground": "#e8e9f0",
      "--primary": "#8b5cf6",
      "--primary-foreground": "#06030f",
      "--primary-alt": "#22d3ee",
      "--secondary": "#1a1c2a",
      "--secondary-foreground": "#c4c6d8",
      "--muted": "#181a28",
      "--muted-foreground": "#6b6e88",
      "--accent": "#1a1c2a",
      "--accent-foreground": "#c4c6d8",
      "--destructive": "#f87171",
      "--border": "rgb(42 45 68 / 60%)",
      "--input": "#1a1c2a",
      "--ring": "rgb(139 92 246 / 55%)",
      "--sidebar": "#0e0f1a",
      "--sidebar-foreground": "#e8e9f0",
      "--sidebar-primary": "#8b5cf6",
      "--sidebar-primary-foreground": "#06030f",
      "--sidebar-accent": "#1a1c2a",
      "--sidebar-accent-foreground": "#c4c6d8",
      "--sidebar-border": "rgb(42 45 68 / 40%)",
      "--sidebar-ring": "rgb(139 92 246 / 55%)",
    },
    preview: {
      background: "#0b0c14",
      headerBg: "#0e0f1a",
      card: "#131520",
      cardInner: "#1a1c2a",
      border: "#2a2d44",
      primary: "#8b5cf6",
      primaryAlt: "#22d3ee",
      col1: "#64748b",
      col2: "#8b5cf6",
      col3: "#10b981",
    },
  },
  {
    id: "cyber-teal",
    name: "Cyber Teal",
    description: "Deep ocean · cyan",
    fontName: "Rajdhani",
    cssVars: {
      "--background": "#081414",
      "--foreground": "#e0f0f0",
      "--card": "#0f1e1e",
      "--card-foreground": "#e0f0f0",
      "--popover": "#0c1a1a",
      "--popover-foreground": "#e0f0f0",
      "--primary": "#06b6d4",
      "--primary-foreground": "#020d0f",
      "--primary-alt": "#2dd4bf",
      "--secondary": "#142222",
      "--secondary-foreground": "#b0d8d8",
      "--muted": "#132020",
      "--muted-foreground": "#4d8080",
      "--accent": "#162626",
      "--accent-foreground": "#b0d8d8",
      "--destructive": "#f87171",
      "--border": "rgb(30 58 58 / 60%)",
      "--input": "#162626",
      "--ring": "rgb(6 182 212 / 55%)",
      "--sidebar": "#0c1a1a",
      "--sidebar-foreground": "#e0f0f0",
      "--sidebar-primary": "#06b6d4",
      "--sidebar-primary-foreground": "#020d0f",
      "--sidebar-accent": "#142222",
      "--sidebar-accent-foreground": "#b0d8d8",
      "--sidebar-border": "rgb(30 58 58 / 40%)",
      "--sidebar-ring": "rgb(6 182 212 / 55%)",
    },
    preview: {
      background: "#081414",
      headerBg: "#0c1a1a",
      card: "#0f1e1e",
      cardInner: "#162626",
      border: "#1e3a3a",
      primary: "#06b6d4",
      primaryAlt: "#2dd4bf",
      col1: "#64748b",
      col2: "#06b6d4",
      col3: "#14b8a6",
    },
  },
  {
    id: "synthwave",
    name: "Synthwave",
    description: "Retro future · magenta",
    fontName: "Orbitron",
    cssVars: {
      "--background": "#0d0814",
      "--foreground": "#f0e8f8",
      "--card": "#180d20",
      "--card-foreground": "#f0e8f8",
      "--popover": "#120d1a",
      "--popover-foreground": "#f0e8f8",
      "--primary": "#e879f9",
      "--primary-foreground": "#0a0010",
      "--primary-alt": "#fb923c",
      "--secondary": "#1c0e28",
      "--secondary-foreground": "#d8b8e8",
      "--muted": "#1a0e26",
      "--muted-foreground": "#7a4a8a",
      "--accent": "#1e1030",
      "--accent-foreground": "#d8b8e8",
      "--destructive": "#f87171",
      "--border": "rgb(45 26 64 / 60%)",
      "--input": "#200d2e",
      "--ring": "rgb(232 121 249 / 55%)",
      "--sidebar": "#120d1a",
      "--sidebar-foreground": "#f0e8f8",
      "--sidebar-primary": "#e879f9",
      "--sidebar-primary-foreground": "#0a0010",
      "--sidebar-accent": "#1c0e28",
      "--sidebar-accent-foreground": "#d8b8e8",
      "--sidebar-border": "rgb(45 26 64 / 40%)",
      "--sidebar-ring": "rgb(232 121 249 / 55%)",
    },
    preview: {
      background: "#0d0814",
      headerBg: "#120d1a",
      card: "#180d20",
      cardInner: "#1f1028",
      border: "#2d1a40",
      primary: "#e879f9",
      primaryAlt: "#fb923c",
      col1: "#8b5cf6",
      col2: "#e879f9",
      col3: "#f97316",
    },
  },
  {
    id: "midnight-rose",
    name: "Midnight Rose",
    description: "Dark · rose crimson",
    fontName: "Josefin Sans",
    cssVars: {
      "--background": "#120808",
      "--foreground": "#f8e8e8",
      "--card": "#1c0d0d",
      "--card-foreground": "#f8e8e8",
      "--popover": "#180b0b",
      "--popover-foreground": "#f8e8e8",
      "--primary": "#f43f5e",
      "--primary-foreground": "#0a0003",
      "--primary-alt": "#fb7185",
      "--secondary": "#1e0e0e",
      "--secondary-foreground": "#e8b8be",
      "--muted": "#1e0e0e",
      "--muted-foreground": "#7a3a45",
      "--accent": "#231010",
      "--accent-foreground": "#e8b8be",
      "--destructive": "#fca5a5",
      "--border": "rgb(61 21 21 / 60%)",
      "--input": "#231010",
      "--ring": "rgb(244 63 94 / 55%)",
      "--sidebar": "#180b0b",
      "--sidebar-foreground": "#f8e8e8",
      "--sidebar-primary": "#f43f5e",
      "--sidebar-primary-foreground": "#0a0003",
      "--sidebar-accent": "#1e0e0e",
      "--sidebar-accent-foreground": "#e8b8be",
      "--sidebar-border": "rgb(61 21 21 / 40%)",
      "--sidebar-ring": "rgb(244 63 94 / 55%)",
    },
    preview: {
      background: "#120808",
      headerBg: "#180b0b",
      card: "#1c0d0d",
      cardInner: "#231010",
      border: "#3d1515",
      primary: "#f43f5e",
      primaryAlt: "#fb7185",
      col1: "#64748b",
      col2: "#f43f5e",
      col3: "#fb923c",
    },
  },
  {
    id: "deep-ocean",
    name: "Deep Ocean",
    description: "Navy abyss · electric blue",
    fontName: "IBM Plex Sans",
    cssVars: {
      "--background": "#080c18",
      "--foreground": "#e8ecf8",
      "--card": "#0f1628",
      "--card-foreground": "#e8ecf8",
      "--popover": "#0b1020",
      "--popover-foreground": "#e8ecf8",
      "--primary": "#3b82f6",
      "--primary-foreground": "#010510",
      "--primary-alt": "#818cf8",
      "--secondary": "#121a30",
      "--secondary-foreground": "#b8c8e8",
      "--muted": "#121a30",
      "--muted-foreground": "#3a5070",
      "--accent": "#141d33",
      "--accent-foreground": "#b8c8e8",
      "--destructive": "#f87171",
      "--border": "rgb(30 45 80 / 60%)",
      "--input": "#141d33",
      "--ring": "rgb(59 130 246 / 55%)",
      "--sidebar": "#0b1020",
      "--sidebar-foreground": "#e8ecf8",
      "--sidebar-primary": "#3b82f6",
      "--sidebar-primary-foreground": "#010510",
      "--sidebar-accent": "#121a30",
      "--sidebar-accent-foreground": "#b8c8e8",
      "--sidebar-border": "rgb(30 45 80 / 40%)",
      "--sidebar-ring": "rgb(59 130 246 / 55%)",
    },
    preview: {
      background: "#080c18",
      headerBg: "#0b1020",
      card: "#0f1628",
      cardInner: "#141d33",
      border: "#1e2d50",
      primary: "#3b82f6",
      primaryAlt: "#818cf8",
      col1: "#64748b",
      col2: "#3b82f6",
      col3: "#6366f1",
    },
  },
  {
    id: "matrix",
    name: "Matrix",
    description: "Ghost shell · neon green",
    fontName: "Exo 2",
    cssVars: {
      "--background": "#060e08",
      "--foreground": "#e0f0e4",
      "--card": "#0c160e",
      "--card-foreground": "#e0f0e4",
      "--popover": "#08120a",
      "--popover-foreground": "#e0f0e4",
      "--primary": "#22c55e",
      "--primary-foreground": "#010a02",
      "--primary-alt": "#4ade80",
      "--secondary": "#0e1810",
      "--secondary-foreground": "#a0d8a8",
      "--muted": "#0e1810",
      "--muted-foreground": "#2e6838",
      "--accent": "#101d12",
      "--accent-foreground": "#a0d8a8",
      "--destructive": "#f87171",
      "--border": "rgb(26 48 32 / 60%)",
      "--input": "#101d12",
      "--ring": "rgb(34 197 94 / 55%)",
      "--sidebar": "#08120a",
      "--sidebar-foreground": "#e0f0e4",
      "--sidebar-primary": "#22c55e",
      "--sidebar-primary-foreground": "#010a02",
      "--sidebar-accent": "#0e1810",
      "--sidebar-accent-foreground": "#a0d8a8",
      "--sidebar-border": "rgb(26 48 32 / 40%)",
      "--sidebar-ring": "rgb(34 197 94 / 55%)",
    },
    preview: {
      background: "#060e08",
      headerBg: "#08120a",
      card: "#0c160e",
      cardInner: "#101d12",
      border: "#1a3020",
      primary: "#22c55e",
      primaryAlt: "#4ade80",
      col1: "#64748b",
      col2: "#22c55e",
      col3: "#10b981",
    },
  },
];

/* ── CSS var application ─────────────────────────────────────────────── */

/** Apply a theme's CSS vars directly to document root by system theme ID */
export function applyThemeCSSVars(id: ThemeId, customThemes: CustomTheme[] = []): void {
  const theme = THEMES.find((t) => t.id === id) ?? customThemes.find((t) => t.id === id);
  if (!theme) return;
  applyThemeObject(id, theme.cssVars, theme.fontName);
}

/** Apply cssVars (and optionally a font) from any theme object directly */
export function applyThemeObject(id: string, cssVars: ThemeCSSVars, fontName?: string): void {
  const root = document.documentElement;
  root.setAttribute("data-theme", id);
  for (const [prop, value] of Object.entries(cssVars)) {
    root.style.setProperty(prop, value);
  }
  if (fontName) {
    root.style.setProperty("--font-sans", getFontVar(fontName));
  }
}

/* ── Gemini AI theme generation ──────────────────────────────────────── */

const GEMINI_PROMPT = `You are an expert dark UI theme designer with deep knowledge of color theory, accessibility, and visual atmosphere. Today is {DATE}.

TASK: Design a single UNIQUE, HIGH-QUALITY dark UI theme with a matching font that feels professional, atmospheric, and instantly recognizable.

DESIGN PROCESS (follow these steps internally):
1. Choose an evocative atmosphere (e.g. "molten forge", "arctic aurora", "ancient bronze", "deep sea trench")
2. Pick a PRIMARY hue that captures that atmosphere — must be vibrant and memorable
3. Build the BACKGROUND from the same hue family but extremely dark and desaturated
4. Derive all other tokens from these two anchor points

CONCRETE VALUE RANGES (you must stay within these):
- --background:         hsl(H, 10–18%, 7–10%)   ← very dark, slight hue tint
- --card:               hsl(H, 10–16%, 12–16%)  ← clearly lighter than background (+4–6% lightness)
- --popover:            hsl(H, 10–16%, 9–12%)   ← between background and card
- --primary:            hsl(H, 78–90%, 60–68%)  ← vivid, saturated, the star of the show
- --primary-alt:        hsl(H±150, 65–80%, 55–65%) ← complementary or split-complementary
- --primary-foreground: hsl(H, 85–100%, 4–8%)   ← near-black, readable on primary
- --foreground:         hsl(H, 6–12%, 90–95%)   ← near-white with hue tint
- --muted:              hsl(H, 10–16%, 14–18%)  ← slightly lighter than card
- --muted-foreground:   hsl(H, 10–20%, 44–54%)  ← mid-brightness, clearly readable
- --secondary:          hsl(H, 10–16%, 15–20%)  ← similar to muted
- --secondary-foreground: hsl(H, 8–14%, 70–80%)
- --accent:             same as --secondary or 1–2% lighter
- --accent-foreground:  same as --secondary-foreground
- --border:             hsl(H, 16–26%, 20–28%)  ← subtle but visible
- --input:              hsl(H, 10–16%, 15–19%)  ← form fields
- --ring:               hsl(H, 78–90%, 60–68%)  ← same hue as primary, used for focus rings
- --destructive:        hsl(0, 70–80%, 60–68%)  ← always a warm red, don't theme this
- --sidebar:            hsl(H, 10–18%, 8–12%)   ← same family as background, slightly darker or same
- --sidebar-foreground: same as --foreground
- --sidebar-primary:    same as --primary
- --sidebar-primary-foreground: same as --primary-foreground
- --sidebar-accent:     same as --secondary
- --sidebar-accent-foreground: same as --secondary-foreground
- --sidebar-border:     hsl(H, 16–24%, 18–24%)
- --sidebar-ring:       same as --ring

FORBIDDEN primary hues (already used by system themes):
- 250–280° (violet/purple) — Neon Violet
- 175–200° (cyan/teal) — Cyber Teal
- 290–315° (magenta/fuchsia) — Synthwave
- 340–360° / 0–10° (rose/red) — Midnight Rose
- 210–240° (blue) — Deep Ocean
- 130–160° (green) — Matrix

GOOD primary hue candidates to explore: 25–45° (amber/gold), 50–70° (yellow), 170–175° (turquoise edge), 315–340° (hot pink edge), 15–25° (orange), 240–250° (indigo edge), 95–130° (lime/chartreuse), 200–210° (sky)

MARQUEE BAR NOTE: The app has a neon quotes ticker bar at the top. It uses --primary as a text-shadow glow color (text-shadow: 0 0 6px var(--primary), 0 0 14px ...) and as separator dot color. This means --primary must be vivid and saturated enough to produce a beautiful neon glow — pale or gray primaries will look dead. Aim for saturation 78–90% and lightness 60–68%.

QUALITY CHECKS before outputting:
✓ card lightness is at least 4% higher than background
✓ foreground on background passes WCAG AA (foreground ~92%, background ~8% → always passes)
✓ muted-foreground is between 40–56% lightness (readable but secondary)
✓ primary is vibrant and saturated (78–90% saturation) so it glows beautifully in neon effects
✓ the overall palette feels COHESIVE — one hue family throughout

OUTPUT: Return ONLY this JSON structure, no markdown, no explanation, nothing else:
{
  "name": "Two or three evocative words",
  "description": "One sentence capturing the atmosphere and feel",
  "fontName": "Exactly one of: {FONT_NAMES}",
  "cssVars": {
    "--background": "hsl(...)",
    "--foreground": "hsl(...)",
    "--card": "hsl(...)",
    "--card-foreground": "hsl(...)",
    "--popover": "hsl(...)",
    "--popover-foreground": "hsl(...)",
    "--primary": "hsl(...)",
    "--primary-foreground": "hsl(...)",
    "--primary-alt": "hsl(...)",
    "--secondary": "hsl(...)",
    "--secondary-foreground": "hsl(...)",
    "--muted": "hsl(...)",
    "--muted-foreground": "hsl(...)",
    "--accent": "hsl(...)",
    "--accent-foreground": "hsl(...)",
    "--destructive": "hsl(0, 72%, 63%)",
    "--border": "hsl(...)",
    "--input": "hsl(...)",
    "--ring": "hsl(...)",
    "--sidebar": "hsl(...)",
    "--sidebar-foreground": "hsl(...)",
    "--sidebar-primary": "hsl(...)",
    "--sidebar-primary-foreground": "hsl(...)",
    "--sidebar-accent": "hsl(...)",
    "--sidebar-accent-foreground": "hsl(...)",
    "--sidebar-border": "hsl(...)",
    "--sidebar-ring": "hsl(...)"
  },
  "preview": {
    "background": "#rrggbb",
    "headerBg": "#rrggbb",
    "card": "#rrggbb",
    "cardInner": "#rrggbb",
    "border": "#rrggbb",
    "primary": "#rrggbb",
    "primaryAlt": "#rrggbb",
    "col1": "#rrggbb",
    "col2": "#rrggbb",
    "col3": "#rrggbb"
  }
}

Note: preview hex values must visually match the hsl cssVars. col1/col2/col3 are kanban column accent colors — make them varied (e.g. col1: muted border, col2: primary, col3: primary-alt).
fontName personality guide: Space Grotesk=clean sci-fi, Rajdhani=techy condensed, Orbitron=retro-future, Josefin Sans=elegant, IBM Plex Sans=technical neutral, Exo 2=angular modern, Oxanium=cyber angular, Syne=editorial wide.`;

function validateCustomTheme(obj: unknown): obj is Omit<CustomTheme, "id" | "isPersonal" | "generatedAt"> {
  if (typeof obj !== "object" || obj === null) return false;
  const t = obj as Record<string, unknown>;
  if (typeof t.name !== "string" || !t.name) return false;
  if (typeof t.description !== "string") return false;
  if (typeof t.cssVars !== "object" || t.cssVars === null) return false;
  if (typeof t.preview !== "object" || t.preview === null) return false;
  const vars = t.cssVars as Record<string, unknown>;
  const required = ["--background", "--foreground", "--primary", "--card", "--sidebar"];
  if (!required.every((k) => typeof vars[k] === "string")) return false;
  return true;
}

/** Extract JSON from a string that may contain extra prose (e.g. from grounding) */
function extractJSON(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    // Gemini with grounding sometimes wraps JSON in prose — extract the first {...} block
    const match = text.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error("No JSON found in Gemini response");
  }
}

export async function generateThemeWithAI(vibe?: string): Promise<CustomTheme> {
  const date = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  const hasVibe = vibe && vibe.trim().length > 0;

  let prompt = GEMINI_PROMPT
    .replace("{DATE}", date)
    .replaceAll("{FONT_NAMES}", FONT_NAMES_FOR_PROMPT);

  if (hasVibe) {
    const vibeDirective = `\
══════════════════════════════════════════════════════════
CRITICAL DIRECTIVE — VIBE / BRAND MATCH (read this first)
══════════════════════════════════════════════════════════
The user wants a theme that captures: "${vibe.trim()}"

STEP 1 — IDENTIFY WHAT THIS IS:
• If it names a brand, product, or website (Firebase, GitHub, Stripe, Discord, VS Code,
  Linear, Vercel, Supabase, Notion, Figma, etc.):
    → Use web search to find "[${vibe.trim()}] brand colors" and "[${vibe.trim()}] color palette"
    → Extract the PRIMARY HUE from the brand's real color identity (e.g. Firebase = orange ~hsl(33,100%,50%), GitHub = dark gray, Stripe = indigo ~hsl(245,65%,58%))
    → Use those actual hues as your anchor — precision matters here
    → The "FORBIDDEN primary hues" list below does NOT apply when brand-matching — override it
    → Name the theme after the brand (e.g. "Firebase Ember", "Linear Pulse", "Stripe Midnight")

• If it describes a mood, place, or aesthetic (cyberpunk, sunset, ocean floor, neon tokyo, etc.):
    → Let it fully drive your hue choice, atmosphere, and font
    → The forbidden hue list still applies to avoid duplicating system themes

STEP 2 — COLOR AUTHORITY:
The vibe OVERRIDES the "GOOD primary hue candidates" list and the HSL ranges in CONCRETE VALUE RANGES.
Those ranges are GUIDELINES for spontaneous generation only. For vibe matching, hit the brand's real colors first, then adapt the rest of the palette to work around them.

══════════════════════════════════════════════════════════
STRUCTURAL PROMPT (apply after resolving the vibe above):
══════════════════════════════════════════════════════════
`;
    prompt = vibeDirective + prompt;
  }

  // Use Google Search grounding when a vibe is provided, so Gemini can look up
  // color associations, aesthetic references, and visual cues for the description.
  const body: Record<string, unknown> = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: hasVibe ? 1.0 : 1.2,
      // responseMimeType is omitted when using grounding tools to avoid conflicts
      ...(hasVibe ? {} : { responseMimeType: "application/json" }),
    },
    ...(hasVibe ? { tools: [{ google_search: {} }] } : {}),
  };

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );

  if (!res.ok) throw new Error(`Gemini API error: ${res.status}`);

  const data = await res.json();
  // Collect all text parts (grounding may produce multiple parts)
  const parts: { text?: string }[] = data?.candidates?.[0]?.content?.parts ?? [];
  const text = parts.map((p) => p.text ?? "").join("");
  const parsed = extractJSON(text);

  if (!validateCustomTheme(parsed)) throw new Error("Invalid theme shape from AI");

  const base = parsed as Omit<CustomTheme, "id" | "isPersonal" | "generatedAt">;
  const knownFont = FONT_OPTIONS.find((f) => f.name === base.fontName);
  return {
    ...base,
    fontName: knownFont ? base.fontName : FONT_OPTIONS[0].name,
    id: crypto.randomUUID(),
    isPersonal: true,
    generatedAt: new Date().toISOString(),
  };
}

/* ── Algorithmic fallback (no network needed) ────────────────────────── */

const FALLBACK_HUES = [25, 55, 170, 200, 320, 15, 240, 100];
const FALLBACK_NAMES = [
  ["Amber", "Forge"], ["Solar", "Dust"], ["Jade", "Mist"], ["Arctic", "Flow"],
  ["Crimson", "Silk"], ["Copper", "Ash"], ["Cobalt", "Dream"], ["Lime", "Surge"],
];

function hsl(h: number, s: number, l: number): string {
  return `hsl(${h}, ${s}%, ${l}%)`;
}

function hslHex(h: number, s: number, l: number): string {
  // Approximate hex conversion for preview colors
  const sN = s / 100, lN = l / 100;
  const a = sN * Math.min(lN, 1 - lN);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = lN - a * Math.max(-1, Math.min(k - 3, Math.min(9 - k, 1)));
    return Math.round(255 * color).toString(16).padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

export function generateThemeAlgorithmically(): CustomTheme {
  const idx = Math.floor(Math.random() * FALLBACK_HUES.length);
  const h = FALLBACK_HUES[idx];
  const h2 = (h + 150) % 360;
  const h3 = (h + 60) % 360;
  const [adj, noun] = FALLBACK_NAMES[idx];
  const date = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const fontName = FONT_OPTIONS[idx % FONT_OPTIONS.length].name;

  const cssVars: ThemeCSSVars = {
    "--background":              hsl(h, 14,  8),
    "--foreground":              hsl(h,  6, 93),
    "--card":                    hsl(h, 12, 12),
    "--card-foreground":         hsl(h,  6, 93),
    "--popover":                 hsl(h, 13, 10),
    "--popover-foreground":      hsl(h,  6, 93),
    "--primary":                 hsl(h, 82, 63),
    "--primary-foreground":      hsl(h, 90,  5),
    "--primary-alt":             hsl(h2, 75, 60),
    "--secondary":               hsl(h, 14, 16),
    "--secondary-foreground":    hsl(h,  8, 75),
    "--muted":                   hsl(h, 13, 15),
    "--muted-foreground":        hsl(h, 12, 45),
    "--accent":                  hsl(h, 15, 18),
    "--accent-foreground":       hsl(h,  8, 78),
    "--destructive":             hsl(0, 70, 65),
    "--border":                  hsl(h, 18, 22),
    "--input":                   hsl(h, 14, 16),
    "--ring":                    hsl(h, 82, 63),
    "--sidebar":                 hsl(h, 14, 10),
    "--sidebar-foreground":      hsl(h,  6, 93),
    "--sidebar-primary":         hsl(h, 82, 63),
    "--sidebar-primary-foreground": hsl(h, 90, 5),
    "--sidebar-accent":          hsl(h, 14, 16),
    "--sidebar-accent-foreground": hsl(h, 8, 75),
    "--sidebar-border":          hsl(h, 18, 20),
    "--sidebar-ring":            hsl(h, 82, 63),
  };

  const preview: ThemePreview = {
    background: hslHex(h, 14,  8),
    headerBg:   hslHex(h, 14, 10),
    card:       hslHex(h, 12, 12),
    cardInner:  hslHex(h, 14, 16),
    border:     hslHex(h, 18, 22),
    primary:    hslHex(h, 82, 63),
    primaryAlt: hslHex(h2, 75, 60),
    col1:       hslHex(h,  18, 35),
    col2:       hslHex(h,  82, 63),
    col3:       hslHex(h3, 70, 58),
  };

  return {
    id: crypto.randomUUID(),
    name: `${adj} ${noun}`,
    description: `Generated · ${date}`,
    fontName,
    cssVars,
    preview,
    isPersonal: true,
    generatedAt: new Date().toISOString(),
  };
}
