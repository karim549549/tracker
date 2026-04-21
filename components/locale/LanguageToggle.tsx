"use client";

import { useState } from "react";
import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { LOCALES, currentLocale, useTranslations } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function LanguageToggle() {
  const [open, setOpen] = useState(false);
  const s = useTranslations().language;

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 relative"
        onClick={() => setOpen(true)}
        title={s.toggleTitle}
      >
        <Globe className="h-4 w-4" />
        {/* Active locale badge */}
        <span className="absolute bottom-0 right-0 text-[8px] font-bold leading-none text-primary">
          {currentLocale.toUpperCase()}
        </span>
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="right"
          className="flex flex-col gap-0 p-0 w-[320px] sm:max-w-[320px]"
          showCloseButton={false}
        >
          <SheetHeader className="px-5 pt-5 pb-4 border-b border-border/50">
            <div className="flex items-center justify-between">
              <div>
                <SheetTitle className="text-base font-semibold">{s.sheetTitle}</SheetTitle>
                <SheetDescription className="text-xs mt-0.5">{s.sheetSubtitle}</SheetDescription>
              </div>
              <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => setOpen(false)}>
                ✕
              </Button>
            </div>
          </SheetHeader>

          <div className="flex flex-col gap-2 px-5 py-5">
            {LOCALES.map((locale) => {
              const isActive = locale.code === currentLocale;
              return (
                <button
                  key={locale.code}
                  disabled={!locale.available}
                  onClick={() => {
                    // TODO: wire to locale state when more languages are added
                    setOpen(false);
                  }}
                  className={cn(
                    "flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all",
                    isActive
                      ? "border-primary/40 bg-primary/8"
                      : "border-border/40 text-muted-foreground/50 cursor-not-allowed"
                  )}
                >
                  <span className="text-lg">{locale.flag}</span>
                  <div className="flex-1">
                    <p className={cn("text-sm font-medium", isActive ? "text-foreground" : "text-muted-foreground/50")}>
                      {locale.name}
                    </p>
                    {isActive && (
                      <p className="text-[10px] mt-0.5" style={{ color: "var(--primary)" }}>
                        Active
                      </p>
                    )}
                  </div>
                  {isActive && (
                    <span
                      className="h-2 w-2 rounded-full shrink-0"
                      style={{ background: "var(--primary)" }}
                    />
                  )}
                </button>
              );
            })}

            <p className="text-[11px] text-muted-foreground/40 text-center mt-2">
              {s.comingSoon}
            </p>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
