export const en = {
  theme: {
    sheetTitle: "Choose a theme",
    sheetMeta: (system: number, personal: number) =>
      `${system} system · ${personal} personal`,
    generateBtn: "Theme of the Day",
    generating: "Generating theme…",
    sectionSystem: "System",
    sectionPersonal: "Personal",
    emptyPersonal: 'No personal themes yet. Hit "Theme of the Day" to generate one.',
    aiOfflineFallback: "Generated offline theme (AI unavailable)",
    generateSuccess: (name: string) => `"${name}" added to your themes`,
    generateError: "Failed to generate theme",
    vibeDialog: {
      title: "Theme of the Day",
      subtitle: "Describe your vibe and we'll craft a unique palette just for you.",
      vibeLabel: "Describe your vibe",
      vibePlaceholder:
        "e.g. cyberpunk rainstorm, cozy autumn library, volcanic sunset, deep ocean abyss…",
      vibeHint: "Optional — leave blank for a random theme",
      generateBtn: "Generate Theme",
      randomBtn: "Skip · Random",
    },
  },
  language: {
    toggleTitle: "Language",
    sheetTitle: "Language",
    sheetSubtitle: "Choose your display language",
    comingSoon: "More languages coming soon",
  },
} as const;

export type Strings = typeof en;
