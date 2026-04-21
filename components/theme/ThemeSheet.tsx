"use client";

import { useState, useRef } from "react";
import { Palette, Check, Sparkles, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { THEMES, generateThemeWithAI, generateThemeAlgorithmically } from "@/lib/themes";
import type { ThemeDefinition, CustomTheme, ThemePreview } from "@/lib/themes";
import { useTheme } from "./ThemeProvider";
import { useTranslations } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function ThemeSheet() {
  const [open, setOpen] = useState(false);
  const [vibeOpen, setVibeOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [newlyAddedId, setNewlyAddedId] = useState<string | null>(null);
  const { theme, setTheme, customThemes, addCustomTheme, removeCustomTheme } = useTheme();
  const s = useTranslations().theme;

  const activePreview =
    THEMES.find((t) => t.id === theme)?.preview ??
    customThemes.find((t) => t.id === theme)?.preview;

  async function runGenerate(vibe?: string) {
    setVibeOpen(false);
    setIsGenerating(true);
    try {
      let newTheme: CustomTheme;
      try {
        newTheme = await generateThemeWithAI(vibe);
      } catch {
        newTheme = generateThemeAlgorithmically();
        toast.info(s.aiOfflineFallback);
      }
      addCustomTheme(newTheme);
      setNewlyAddedId(newTheme.id);
      toast.success(s.generateSuccess(newTheme.name));
      setTimeout(() => setNewlyAddedId(null), 1800);
    } catch {
      toast.error(s.generateError);
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <>
      {/* Palette trigger */}
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 relative"
        onClick={() => setOpen(true)}
        title="Switch theme"
      >
        <Palette className="h-4 w-4" />
        {activePreview && (
          <span
            className="absolute bottom-0.5 right-0.5 h-1.5 w-1.5 rounded-full"
            style={{ background: activePreview.primary }}
          />
        )}
      </Button>

      {/* ── Vibe dialog ─────────────────────────────────────────────────── */}
      <VibeDialog
        open={vibeOpen}
        isGenerating={isGenerating}
        onClose={() => setVibeOpen(false)}
        onGenerate={runGenerate}
        strings={s.vibeDialog}
      />

      {/* ── Theme picker sheet ──────────────────────────────────────────── */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="right"
          className="flex flex-col gap-0 p-0 w-[400px] sm:max-w-[400px]"
          showCloseButton={false}
        >
          <SheetHeader className="px-5 pt-5 pb-4 border-b border-border/50">
            <div className="flex items-center justify-between">
              <div>
                <SheetTitle className="text-base font-semibold">{s.sheetTitle}</SheetTitle>
                <SheetDescription className="text-xs mt-0.5">
                  {s.sheetMeta(THEMES.length, customThemes.length)}
                </SheetDescription>
              </div>
              <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => setOpen(false)}>
                ✕
              </Button>
            </div>
          </SheetHeader>

          <div className="overflow-y-auto flex-1 px-5 py-5 flex flex-col gap-5">

            {/* Theme of the Day button */}
            <button
              onClick={() => setVibeOpen(true)}
              disabled={isGenerating}
              className={cn(
                "w-full flex items-center justify-center gap-2.5 rounded-xl border-2 border-dashed py-3 text-sm font-medium transition-all duration-200",
                isGenerating
                  ? "border-primary/30 text-primary/60 cursor-not-allowed"
                  : "border-primary/40 text-primary hover:border-primary hover:bg-primary/8 active:scale-[0.98]"
              )}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {s.generating}
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  {s.generateBtn}
                </>
              )}
            </button>

            {/* System themes */}
            <div className="flex flex-col gap-3">
              <SectionLabel>{s.sectionSystem}</SectionLabel>
              <div className="grid grid-cols-2 gap-3">
                {THEMES.map((t) => (
                  <ThemeCard
                    key={t.id}
                    theme={t}
                    isSelected={theme === t.id}
                    onSelect={() => { setTheme(t.id); setOpen(false); }}
                  />
                ))}
              </div>
            </div>

            {/* Personal themes */}
            <div className="flex flex-col gap-3">
              <SectionLabel>{s.sectionPersonal}</SectionLabel>
              {customThemes.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border/30 py-6 text-center">
                  <p className="text-xs text-muted-foreground/50">{s.emptyPersonal}</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {customThemes.map((t) => (
                    <ThemeCard
                      key={t.id}
                      theme={t}
                      isSelected={theme === t.id}
                      isNew={newlyAddedId === t.id}
                      onSelect={() => { setTheme(t.id); setOpen(false); }}
                      onDelete={() => removeCustomTheme(t.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

/* ── Vibe dialog ────────────────────────────────────────────────────────── */

function VibeDialog({
  open,
  isGenerating,
  onClose,
  onGenerate,
  strings,
}: {
  open: boolean;
  isGenerating: boolean;
  onClose: () => void;
  onGenerate: (vibe?: string) => void;
  strings: ReturnType<typeof useTranslations>["theme"]["vibeDialog"];
}) {
  const [vibe, setVibe] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function handleGenerate() {
    onGenerate(vibe.trim() || undefined);
    setVibe("");
  }

  function handleRandom() {
    onGenerate(undefined);
    setVibe("");
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) { onClose(); setVibe(""); } }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" style={{ color: "var(--primary)" }} />
            {strings.title}
          </DialogTitle>
          <DialogDescription>{strings.subtitle}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 mt-1">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-foreground/80">
              {strings.vibeLabel}
            </label>
            <textarea
              ref={textareaRef}
              value={vibe}
              onChange={(e) => setVibe(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleGenerate();
                if (e.key === "Escape") { onClose(); setVibe(""); }
              }}
              placeholder={strings.vibePlaceholder}
              rows={3}
              autoFocus
              className="w-full rounded-lg px-3 py-2.5 text-sm bg-input border border-border/60 text-foreground placeholder:text-muted-foreground/40 outline-none focus:border-primary/60 resize-none leading-relaxed"
            />
            <p className="text-[11px] text-muted-foreground/50">{strings.vibeHint}</p>
          </div>

          <div className="flex items-center gap-2 justify-end">
            <button
              onClick={handleRandom}
              disabled={isGenerating}
              className="px-3 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-40"
            >
              {strings.randomBtn}
            </button>
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-all active:scale-[0.97] disabled:opacity-50"
              style={{ background: "var(--primary)" }}
            >
              {isGenerating ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Sparkles className="h-3.5 w-3.5" />
              )}
              {strings.generateBtn}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ── Section label ───────────────────────────────────────────────────────── */

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50 px-0.5">
      {children}
    </p>
  );
}

/* ── Theme card ──────────────────────────────────────────────────────────── */

function ThemeCard({
  theme,
  isSelected,
  isNew = false,
  onSelect,
  onDelete,
}: {
  theme: ThemeDefinition | CustomTheme;
  isSelected: boolean;
  isNew?: boolean;
  onSelect: () => void;
  onDelete?: () => void;
}) {
  const p = theme.preview;
  const isPersonal = "isPersonal" in theme && theme.isPersonal;

  return (
    <div className="relative group">
      <button
        onClick={onSelect}
        className={cn(
          "relative rounded-xl border-2 p-1.5 text-left transition-all duration-200 cursor-pointer w-full",
          "hover:scale-[1.02] active:scale-[0.98]",
          isSelected
            ? "border-[var(--sel-color)] shadow-[0_0_16px_var(--sel-glow)]"
            : "border-border/50 hover:border-border",
          isNew && "ring-2 ring-primary/60 animate-pulse"
        )}
        style={
          isSelected
            ? ({ "--sel-color": p.primary, "--sel-glow": `${p.primary}40` } as React.CSSProperties)
            : undefined
        }
      >
        <MiniKanban p={p} />

        <div className="mt-2 px-0.5">
          <div className="flex items-center gap-1.5">
            <p className="text-xs font-semibold text-foreground leading-tight truncate flex-1">
              {theme.name}
            </p>
            {isPersonal && (
              <span
                className="text-[9px] font-bold uppercase tracking-wider rounded px-1 py-0.5 shrink-0"
                style={{ background: `${p.primary}25`, color: p.primary }}
              >
                AI
              </span>
            )}
          </div>
          <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight truncate">
            {theme.description}
          </p>
          <p className="text-[9px] mt-1 leading-tight truncate" style={{ color: `${p.primary}99` }}>
            {theme.fontName}
          </p>
        </div>

        {isSelected && (
          <div
            className="absolute top-2 right-2 rounded-full h-4 w-4 flex items-center justify-center"
            style={{ background: p.primary }}
          >
            <Check className="h-2.5 w-2.5" style={{ color: p.background }} />
          </div>
        )}
      </button>

      {/* Delete button for personal themes */}
      {isPersonal && onDelete && (
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="absolute top-1.5 right-1.5 h-5 w-5 rounded-full flex items-center justify-center bg-black/60 text-white/70 hover:bg-destructive hover:text-white transition-colors opacity-0 group-hover:opacity-100 z-10"
          title="Remove theme"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}

/* ── Mini kanban skeleton ────────────────────────────────────────────────── */

function MiniKanban({ p }: { p: ThemePreview }) {
  return (
    <div className="rounded-lg overflow-hidden" style={{ background: p.background }}>
      <div style={{ background: p.headerBg, height: 13, borderBottom: `1px solid ${p.border}`, display: "flex", alignItems: "center", paddingLeft: 6, gap: 3 }}>
        <div style={{ width: 22, height: 4, borderRadius: 2, background: `linear-gradient(90deg, ${p.primary}, ${p.primaryAlt})` }} />
      </div>
      <div style={{ background: p.headerBg, height: 10, borderBottom: `1px solid ${p.border}`, display: "flex", alignItems: "flex-end", paddingLeft: 6, gap: 5 }}>
        <div style={{ width: 22, height: 7, borderRadius: "2px 2px 0 0", background: p.card, borderBottom: `2px solid ${p.primary}` }} />
        <div style={{ width: 18, height: 6, borderRadius: "2px 2px 0 0", background: "transparent" }} />
      </div>
      <div style={{ display: "flex", gap: 4, padding: "5px", background: p.background, minHeight: 72 }}>
        {([p.col1, p.col2, p.col3] as string[]).map((colColor, i) => (
          <div key={i} style={{ flex: 1, borderRadius: 4, background: p.card, border: `1px solid ${p.border}`, borderTopColor: colColor, borderTopWidth: 2, padding: "3px", display: "flex", flexDirection: "column", gap: 3 }}>
            <div style={{ height: 4, borderRadius: 2, background: p.cardInner, marginBottom: 1 }} />
            {Array.from({ length: i === 1 ? 1 : 2 }).map((_, j) => (
              <div key={j} style={{ height: 11, borderRadius: 3, background: p.cardInner, border: `1px solid ${p.border}`, display: "flex", overflow: "hidden" }}>
                <div style={{ width: 2, flexShrink: 0, background: j === 0 ? p.primary : colColor }} />
                <div style={{ flex: 1, margin: "3px", borderRadius: 1, background: p.border, opacity: 0.6 }} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
