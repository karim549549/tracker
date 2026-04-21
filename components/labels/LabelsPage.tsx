"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Check, X, Tag } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Label } from "@/shared/types";

const PRESET_COLORS = [
  "#a855f7", "#8b5cf6", "#6366f1", "#3b82f6", "#06b6d4",
  "#10b981", "#84cc16", "#f59e0b", "#f97316", "#ef4444",
  "#ec4899", "#64748b",
];

interface LabelsPageProps {
  envId: string | null;
  labels: Label[];
  onAdd: (name: string, color: string, envId: string) => void;
  onUpdate: (id: string, patch: Partial<Pick<Label, "name" | "color">>) => void;
  onDelete: (id: string) => void;
  onDeleteMany: (ids: string[]) => void;
}

export function LabelsPage({ envId, labels, onAdd, onUpdate, onDelete, onDeleteMany }: LabelsPageProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState(PRESET_COLORS[0]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("");

  if (!envId) {
    return (
      <div className="flex-1 flex items-center justify-center h-full board-grid">
        <p className="text-muted-foreground/50 text-sm">Select an environment to manage labels.</p>
      </div>
    );
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function selectAll() {
    setSelected(selected.size === labels.length ? new Set() : new Set(labels.map((l) => l.id)));
  }

  function handleAdd() {
    const name = newName.trim();
    if (!name) return;
    onAdd(name, newColor, envId!);
    setNewName("");
    setNewColor(PRESET_COLORS[0]);
    setAdding(false);
  }

  function startEdit(lbl: Label) {
    setEditingId(lbl.id);
    setEditName(lbl.name);
    setEditColor(lbl.color);
  }

  function commitEdit() {
    if (editingId) {
      onUpdate(editingId, { name: editName.trim() || undefined, color: editColor });
    }
    setEditingId(null);
  }

  function handleDeleteMany() {
    onDeleteMany(Array.from(selected));
    setSelected(new Set());
  }

  return (
    <div className="h-full overflow-y-auto board-grid">
      <div className="max-w-3xl mx-auto px-6 py-6 flex flex-col gap-5">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-3">
            <h2 className="text-lg font-bold text-neon-gradient flex items-center gap-2">
              <Tag className="h-4 w-4" style={{ color: "var(--primary)" }} />
              Environment Labels
            </h2>
            <span className="text-xs text-muted-foreground/60 font-mono">{labels.length} labels</span>
          </div>
          <div className="flex items-center gap-2">
            {selected.size > 0 && (
              <button
                onClick={handleDeleteMany}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-destructive/20 text-destructive border border-destructive/30 hover:bg-destructive/30 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete {selected.size}
              </button>
            )}
            <button
              onClick={() => setAdding(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border border-border/50 hover:bg-muted transition-colors"
              style={{ color: "var(--primary)" }}
            >
              <Plus className="h-3.5 w-3.5" />
              New Label
            </button>
          </div>
        </div>

        {/* Add form */}
        <AnimatePresence>
          {adding && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="rounded-xl border border-border/50 bg-card/60 p-4 flex flex-col gap-3">
                <p className="text-xs font-semibold text-muted-foreground/60 uppercase tracking-wider">New label</p>
                <div className="flex items-center gap-3">
                  <input
                    autoFocus
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); if (e.key === "Escape") setAdding(false); }}
                    placeholder="Label name…"
                    className="flex-1 h-8 rounded-md px-3 text-sm bg-input border border-border/60 text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary/60"
                  />
                  <div
                    className="h-8 w-8 rounded-md border-2 border-border/60 shrink-0"
                    style={{ background: newColor }}
                  />
                </div>
                <ColorPicker value={newColor} onChange={setNewColor} />
                <div className="flex gap-2 justify-end">
                  <button onClick={() => setAdding(false)} className="px-3 py-1.5 rounded-md text-xs border border-border/50 text-muted-foreground hover:bg-muted transition-colors">
                    Cancel
                  </button>
                  <button
                    onClick={handleAdd}
                    disabled={!newName.trim()}
                    className="px-3 py-1.5 rounded-md text-xs font-medium text-white transition-colors disabled:opacity-40"
                    style={{ background: newColor }}
                  >
                    Create
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bulk select bar */}
        {labels.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={selectAll}
              className={cn(
                "h-4 w-4 rounded border flex items-center justify-center transition-colors shrink-0",
                selected.size === labels.length
                  ? "border-primary bg-primary/20"
                  : "border-border/60 hover:border-primary/60"
              )}
            >
              {selected.size === labels.length && <Check className="h-2.5 w-2.5" style={{ color: "var(--primary)" }} />}
            </button>
            <span className="text-xs text-muted-foreground/50">
              {selected.size > 0 ? `${selected.size} selected` : "Select all"}
            </span>
          </div>
        )}

        {/* Labels list */}
        {labels.length === 0 && !adding ? (
          <div className="rounded-xl border border-border/30 bg-card/40 p-8 text-center">
            <p className="text-sm text-muted-foreground/50">No labels yet. Create one to tag your cards.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <AnimatePresence initial={false}>
              {labels.map((lbl) => (
                <motion.div
                  key={lbl.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 8 }}
                  transition={{ duration: 0.15 }}
                  className={cn(
                    "flex items-center gap-3 rounded-xl border bg-card/60 px-4 py-3 transition-colors",
                    selected.has(lbl.id) ? "border-primary/40 bg-primary/5" : "border-border/40 hover:border-border/70"
                  )}
                >
                  {/* Checkbox */}
                  <button
                    onClick={() => toggleSelect(lbl.id)}
                    className={cn(
                      "h-4 w-4 rounded border flex items-center justify-center transition-colors shrink-0",
                      selected.has(lbl.id) ? "border-primary bg-primary/20" : "border-border/60 hover:border-primary/60"
                    )}
                  >
                    {selected.has(lbl.id) && <Check className="h-2.5 w-2.5" style={{ color: "var(--primary)" }} />}
                  </button>

                  {/* Color swatch */}
                  <div className="h-5 w-5 rounded-full shrink-0 border border-white/10" style={{ background: lbl.color }} />

                  {/* Name / edit */}
                  {editingId === lbl.id ? (
                    <div className="flex-1 flex items-center gap-2">
                      <input
                        autoFocus
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") commitEdit(); if (e.key === "Escape") setEditingId(null); }}
                        className="flex-1 h-7 rounded-md px-2 text-sm bg-input border border-border/60 text-foreground outline-none focus:border-primary/60"
                      />
                      <div className="flex flex-col gap-1">
                        <ColorPicker value={editColor} onChange={setEditColor} compact />
                      </div>
                      <button onClick={commitEdit} className="h-7 w-7 flex items-center justify-center rounded-md bg-primary/20 hover:bg-primary/30 text-primary transition-colors">
                        <Check className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => setEditingId(null)} className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-muted text-muted-foreground transition-colors">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <span
                        className="flex-1 text-sm font-medium text-foreground/80 cursor-pointer hover:text-foreground transition-colors"
                        onDoubleClick={() => startEdit(lbl)}
                      >
                        {lbl.name}
                      </span>
                      <span className="text-[10px] text-muted-foreground/40 font-mono">double-click to edit</span>
                      <button
                        onClick={() => onDelete(lbl.id)}
                        className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors ml-auto"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Color picker ───────────────────────────────────────────────────── */

function ColorPicker({ value, onChange, compact = false }: {
  value: string; onChange: (c: string) => void; compact?: boolean;
}) {
  return (
    <div className={cn("flex flex-wrap gap-1.5", compact && "max-w-[160px]")}>
      {PRESET_COLORS.map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => onChange(c)}
          className={cn(
            "h-5 w-5 rounded-full border-2 transition-transform hover:scale-110",
            value === c ? "border-white scale-110" : "border-transparent"
          )}
          style={{ background: c }}
        />
      ))}
    </div>
  );
}
