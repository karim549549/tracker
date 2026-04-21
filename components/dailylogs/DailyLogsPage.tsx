"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Calendar, Plus, Trash2, Check, X, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DailyLog } from "@/shared/types";

function localDateStr(dt: Date): string {
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, "0");
  const d = String(dt.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function parseLocal(ds: string): Date {
  const [y, m, d] = ds.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function todayStr() {
  return localDateStr(new Date());
}

function fmtDate(d: string) {
  return parseLocal(d).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
}

function prevDay(d: string) {
  const dt = parseLocal(d);
  dt.setDate(dt.getDate() - 1);
  return localDateStr(dt);
}

function nextDay(d: string) {
  const dt = parseLocal(d);
  dt.setDate(dt.getDate() + 1);
  return localDateStr(dt);
}

interface DailyLogsPageProps {
  projectId: string;
  logs: DailyLog[];
  onAdd: (date: string, content: string) => void;
  onUpdate: (id: string, content: string) => void;
  onDelete: (id: string) => void;
}

export function DailyLogsPage({ projectId, logs, onAdd, onUpdate, onDelete }: DailyLogsPageProps) {
  const [currentDate, setCurrentDate] = useState(todayStr());
  const [addingContent, setAddingContent] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  const today = todayStr();
  const dayLogs = logs.filter((l) => l.date === currentDate);
  const isToday = currentDate === today;
  const isFuture = currentDate > today;

  const datesWithLogs = new Set(logs.map((l) => l.date));

  function handleAdd() {
    const content = addingContent.trim();
    if (!content) return;
    onAdd(currentDate, content);
    setAddingContent("");
    setIsAdding(false);
  }

  function startEdit(log: DailyLog) {
    setEditingId(log.id);
    setEditContent(log.content);
  }

  function commitEdit() {
    if (editingId && editContent.trim()) {
      onUpdate(editingId, editContent.trim());
    }
    setEditingId(null);
  }

  return (
    <div className="h-full overflow-y-auto board-grid">
      <div className="max-w-3xl mx-auto px-6 py-6 flex flex-col gap-5">

        {/* Header */}
        <div className="flex items-baseline gap-3">
          <h2 className="text-lg font-bold text-neon-gradient flex items-center gap-2">
            <BookOpen className="h-4 w-4" style={{ color: "var(--primary)" }} />
            Daily Logs
          </h2>
          <span className="text-xs text-muted-foreground/60 font-mono">{logs.length} total entries</span>
        </div>

        {/* Date navigation */}
        <div className="rounded-xl border border-border/50 bg-card/60 p-4 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentDate(prevDay(currentDate))}
              className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors border border-border/40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <div className="flex-1 text-center">
              <p className="text-sm font-semibold text-foreground/90">{fmtDate(currentDate)}</p>
              {isToday && (
                <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: "var(--primary)" }}>
                  Today
                </span>
              )}
            </div>

            <button
              onClick={() => setCurrentDate(nextDay(currentDate))}
              disabled={isToday}
              className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors border border-border/40 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-4 w-4" />
            </button>

            {!isToday && (
              <button
                onClick={() => setCurrentDate(today)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border border-border/50 hover:bg-muted transition-colors"
                style={{ color: "var(--primary)" }}
              >
                <Calendar className="h-3 w-3" />
                Today
              </button>
            )}
          </div>

          {/* Dots for nearby days that have logs */}
          <div className="flex items-center justify-center gap-1">
            {Array.from({ length: 7 }, (_, i) => {
              const dt = parseLocal(currentDate);
              dt.setDate(dt.getDate() - 3 + i);
              const ds = localDateStr(dt);
              const isCurrent = ds === currentDate;
              const hasLog = datesWithLogs.has(ds);
              const future = ds > today;
              return (
                <button
                  key={ds}
                  onClick={() => !future && setCurrentDate(ds)}
                  disabled={future}
                  className={cn(
                    "flex flex-col items-center gap-0.5 px-2 py-1 rounded-md transition-colors",
                    isCurrent ? "bg-primary/15" : "hover:bg-muted",
                    future && "opacity-30 cursor-not-allowed"
                  )}
                >
                  <span className={cn("text-[10px] font-mono", isCurrent ? "text-foreground" : "text-muted-foreground/60")}>
                    {dt.toLocaleDateString("en-US", { weekday: "short" }).slice(0, 2)}
                  </span>
                  <span className={cn("text-xs font-bold", isCurrent ? "text-foreground" : "text-muted-foreground/50")}>
                    {dt.getDate()}
                  </span>
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ background: hasLog ? "var(--primary)" : "transparent", opacity: 0.7 }}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* Add entry */}
        {!isFuture && (
          <AnimatePresence>
            {isAdding ? (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="rounded-xl border border-border/50 bg-card/60 p-4 flex flex-col gap-3">
                  <p className="text-xs font-semibold text-muted-foreground/60 uppercase tracking-wider">New entry</p>
                  <textarea
                    autoFocus
                    value={addingContent}
                    onChange={(e) => setAddingContent(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Escape") { setIsAdding(false); setAddingContent(""); }
                      if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleAdd();
                    }}
                    placeholder="What did you work on today?…"
                    rows={4}
                    className="w-full rounded-md px-3 py-2 text-sm bg-input border border-border/60 text-foreground placeholder:text-muted-foreground/40 outline-none focus:border-primary/60 resize-none"
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground/40">Ctrl+Enter to save · Esc to cancel</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setIsAdding(false); setAddingContent(""); }}
                        className="px-3 py-1.5 rounded-md text-xs border border-border/50 text-muted-foreground hover:bg-muted transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAdd}
                        disabled={!addingContent.trim()}
                        className="px-3 py-1.5 rounded-md text-xs font-medium text-white transition-colors disabled:opacity-40"
                        style={{ background: "var(--primary)" }}
                      >
                        Save Entry
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <button
                onClick={() => setIsAdding(true)}
                className="flex items-center gap-2 rounded-xl border border-dashed border-border/40 px-4 py-3 text-sm text-muted-foreground/60 hover:text-muted-foreground hover:border-border/70 hover:bg-muted/30 transition-colors w-full"
              >
                <Plus className="h-4 w-4" />
                Add log entry for {isToday ? "today" : fmtDate(currentDate).split(",")[0]}
              </button>
            )}
          </AnimatePresence>
        )}

        {/* Logs list */}
        {dayLogs.length === 0 && !isAdding ? (
          <div className="rounded-xl border border-border/30 bg-card/40 p-8 text-center">
            <p className="text-sm text-muted-foreground/50">
              {isFuture ? "Can't add entries for future dates." : "No entries for this day yet."}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <AnimatePresence initial={false}>
              {dayLogs.map((log, idx) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.15, delay: idx * 0.04 }}
                  className="rounded-xl border border-border/40 bg-card/60 p-4 flex flex-col gap-2 group"
                  style={{ borderLeftColor: "var(--primary)", borderLeftWidth: 2 }}
                >
                  <div className="flex items-start gap-2">
                    <div className="flex-1">
                      {editingId === log.id ? (
                        <textarea
                          autoFocus
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Escape") setEditingId(null);
                            if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) commitEdit();
                          }}
                          rows={4}
                          className="w-full rounded-md px-3 py-2 text-sm bg-input border border-border/60 text-foreground outline-none focus:border-primary/60 resize-none"
                        />
                      ) : (
                        <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
                          {log.content}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {editingId === log.id ? (
                        <>
                          <button
                            onClick={commitEdit}
                            className="h-7 w-7 flex items-center justify-center rounded-md bg-primary/20 hover:bg-primary/30 text-primary transition-colors"
                          >
                            <Check className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-muted text-muted-foreground transition-colors"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => startEdit(log)}
                            className="h-7 px-2 flex items-center justify-center rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors text-xs"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => onDelete(log.id)}
                            className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  <p className="text-[10px] text-muted-foreground/40 font-mono">
                    {new Date(log.updatedAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                    {log.updatedAt !== log.createdAt && " · edited"}
                  </p>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
