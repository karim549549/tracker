/** Pre-loaded fonts available for theme assignment.
 *  Corresponding next/font imports live in app/layout.tsx.
 *  The cssVar must match the `variable` option used there.
 */
export const FONT_OPTIONS = [
  { name: "Space Grotesk", cssVar: "var(--font-space-grotesk)", style: "geometric · clean" },
  { name: "Rajdhani",      cssVar: "var(--font-rajdhani)",      style: "condensed · techy" },
  { name: "Orbitron",      cssVar: "var(--font-orbitron)",      style: "retro-future · bold" },
  { name: "Josefin Sans",  cssVar: "var(--font-josefin-sans)",  style: "elegant · geometric" },
  { name: "IBM Plex Sans", cssVar: "var(--font-ibm-plex-sans)", style: "technical · neutral" },
  { name: "Exo 2",         cssVar: "var(--font-exo-2)",         style: "angular · modern" },
  { name: "Oxanium",       cssVar: "var(--font-oxanium)",       style: "cyber · angular" },
  { name: "Syne",          cssVar: "var(--font-syne)",          style: "editorial · wide" },
] as const;

export type FontName = (typeof FONT_OPTIONS)[number]["name"];

export function getFontVar(name: string): string {
  return FONT_OPTIONS.find((f) => f.name === name)?.cssVar ?? "var(--font-space-grotesk)";
}

/** Names list formatted for AI prompt */
export const FONT_NAMES_FOR_PROMPT = FONT_OPTIONS.map((f) => `"${f.name}"`).join(", ");
