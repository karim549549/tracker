"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { BarChart2, Activity, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";
import { FEATURE_COLUMNS, BUG_COLUMNS, COLUMN_NEON_COLOR } from "@/lib/constants";
import type { Project, Card } from "@/shared/types";

type SubTab = "overview" | "activity" | "insights";
type Period = "today" | "week" | "last-week" | "month" | "all";

const SUBTABS: { id: SubTab; label: string; icon: React.ReactNode }[] = [
  { id: "overview",  label: "Overview",  icon: <BarChart2  className="h-3.5 w-3.5" /> },
  { id: "activity",  label: "Activity",  icon: <Activity   className="h-3.5 w-3.5" /> },
  { id: "insights",  label: "Insights",  icon: <Lightbulb  className="h-3.5 w-3.5" /> },
];

const PERIODS: { id: Period; label: string }[] = [
  { id: "today",     label: "Today" },
  { id: "week",      label: "This Week" },
  { id: "last-week", label: "Last Week" },
  { id: "month",     label: "Month" },
  { id: "all",       label: "All Time" },
];

function getRange(period: Period): { start: Date; end: Date } {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  switch (period) {
    case "today":
      return { start: today, end: new Date(today.getTime() + 86400000) };
    case "week": {
      const dow = today.getDay();
      const mon = new Date(today.getTime() - (dow === 0 ? 6 : dow - 1) * 86400000);
      return { start: mon, end: new Date(now.getTime() + 86400000) };
    }
    case "last-week": {
      const dow = today.getDay();
      const thisMon = new Date(today.getTime() - (dow === 0 ? 6 : dow - 1) * 86400000);
      const lastMon = new Date(thisMon.getTime() - 7 * 86400000);
      return { start: lastMon, end: thisMon };
    }
    case "month": {
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      return { start, end: new Date(now.getTime() + 86400000) };
    }
    default:
      return { start: new Date(0), end: new Date(now.getTime() + 86400000) };
  }
}

function inRange(dateStr: string | undefined, range: { start: Date; end: Date }): boolean {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  return d >= range.start && d < range.end;
}

/* ── Root ───────────────────────────────────────────────────────────── */

export function PerformanceDashboard({ project }: { project: Project }) {
  const [tab, setTab] = useState<SubTab>("overview");
  const [period, setPeriod] = useState<Period>("week");

  const { features, bugs } = project;
  const all: Card[] = useMemo(() => [...features, ...bugs], [features, bugs]);

  return (
    <div className="h-full overflow-y-auto board-grid">
      <div className="max-w-5xl mx-auto px-6 py-6 flex flex-col gap-5">

        {/* Header */}
        <div className="flex items-baseline gap-3">
          <h2 className="text-lg font-bold text-neon-gradient">{project.name}</h2>
          <span className="text-xs text-muted-foreground/60 font-mono">Performance</span>
        </div>

        {/* Sub-tab bar */}
        <div className="flex items-center gap-1 rounded-xl border border-border/40 bg-card/40 p-1 w-fit">
          {SUBTABS.map(({ id, label, icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                tab === id
                  ? "bg-primary/15 text-primary border border-primary/30"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              {icon}
              {label}
            </button>
          ))}
        </div>

        {tab === "overview"  && <OverviewTab  all={all} features={features} bugs={bugs as import("@/shared/types").BugCard[]} />}
        {tab === "activity"  && <ActivityTab  all={all} period={period} onPeriod={setPeriod} />}
        {tab === "insights"  && <InsightsTab  all={all} features={features} bugs={bugs as import("@/shared/types").BugCard[]} />}
      </div>
    </div>
  );
}

/* ── Overview tab ───────────────────────────────────────────────────── */

function OverviewTab({ all, features, bugs }: {
  all: Card[]; features: import("@/shared/types").FeatureCard[]; bugs: import("@/shared/types").BugCard[];
}) {
  const total = all.length;
  const done = all.filter((c) => c.status === "done").length;
  const inProgress = all.filter((c) => c.status !== "done" && c.status !== "open").length;
  const completionPct = total > 0 ? Math.round((done / total) * 100) : 0;

  const high = all.filter((c) => c.priority === "high").length;
  const med  = all.filter((c) => c.priority === "medium").length;
  const low  = all.filter((c) => c.priority === "low").length;
  const maxP = Math.max(high, med, low, 1);

  return (
    <div className="flex flex-col gap-4">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Total"       value={total}        sub={`${features.length} feat · ${bugs.length} bugs`} color="var(--primary)" delay={0}    />
        <StatCard label="Completed"   value={done}         sub={`${completionPct}% done`}                         color="#10b981"        delay={0.06} />
        <StatCard label="In Progress" value={inProgress}   sub="active work"                                      color="#8b5cf6"        delay={0.12} />
        <StatCard label="Open"        value={all.filter((c) => c.status === "open").length} sub="not started"     color="#f59e0b"        delay={0.18} />
      </div>

      {/* Status panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <StatusPanel title="Features" cards={features} columns={FEATURE_COLUMNS} delay={0.1} />
        <StatusPanel title="Bugs"     cards={bugs}     columns={BUG_COLUMNS}     delay={0.2} />
      </div>

      {/* Priority + Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <PanelCard title="Priority Breakdown">
            <div className="flex flex-col gap-3 py-1">
              <PriorityBar label="High"   count={high} max={maxP} color="#f43f5e" delay={0.15} />
              <PriorityBar label="Medium" count={med}  max={maxP} color="#f59e0b" delay={0.20} />
              <PriorityBar label="Low"    count={low}  max={maxP} color="#10b981" delay={0.25} />
            </div>
          </PanelCard>
        </div>
        <PanelCard title="Completion Rate">
          <div className="flex items-center justify-center py-2">
            <CompletionDonut pct={completionPct} done={done} total={total} />
          </div>
        </PanelCard>
      </div>
    </div>
  );
}

/* ── Activity tab ───────────────────────────────────────────────────── */

function ActivityTab({ all, period, onPeriod }: {
  all: Card[]; period: Period; onPeriod: (p: Period) => void;
}) {
  const range = getRange(period);

  const periodCards = all.filter((c) => inRange(c.completedAt, range));

  /* Prime hours: bucket by hour of completedAt (0-23) */
  const hourBuckets = Array.from({ length: 24 }, (_, h) => ({
    hour: h,
    count: periodCards.filter((c) => {
      if (!c.completedAt) return false;
      return new Date(c.completedAt).getHours() === h;
    }).length,
  }));
  const maxHour = Math.max(...hourBuckets.map((b) => b.count), 1);

  /* Daily timeline: completed per day in range */
  const dayMap = new Map<string, number>();
  periodCards.forEach((c) => {
    if (!c.completedAt) return;
    const ds = c.completedAt.slice(0, 10);
    dayMap.set(ds, (dayMap.get(ds) ?? 0) + 1);
  });

  const days = buildDayRange(range.start, range.end);
  const maxDay = Math.max(...days.map((d) => dayMap.get(d) ?? 0), 1);

  const totalCompleted = periodCards.length;
  const avgPerDay = days.length > 0 ? (totalCompleted / days.length).toFixed(1) : "0";

  return (
    <div className="flex flex-col gap-5">
      {/* Period selector */}
      <div className="flex items-center gap-1 flex-wrap">
        {PERIODS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => onPeriod(id)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
              period === id
                ? "border-primary/50 text-primary bg-primary/12"
                : "border-border/40 text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Completed" value={totalCompleted} sub="in period"             color="var(--primary)" delay={0}    />
        <StatCard label="Avg/Day"   value={Number(avgPerDay)} sub="tasks per day"      color="#10b981"        delay={0.06} sub2={avgPerDay} />
        <StatCard label="Days Active" value={days.filter((d) => (dayMap.get(d) ?? 0) > 0).length} sub={`of ${days.length} days`} color="#8b5cf6" delay={0.12} />
      </div>

      {/* Daily timeline */}
      {days.length > 0 && (
        <PanelCard title={`Daily Completions · ${PERIODS.find(p => p.id === period)?.label}`}>
          <div className="flex items-end gap-1 h-32 pt-2">
            {days.map((d, i) => {
              const count = dayMap.get(d) ?? 0;
              const pct = (count / maxDay) * 100;
              const isToday = d === new Date().toISOString().slice(0, 10);
              return (
                <div key={d} className="flex-1 flex flex-col items-center gap-1 group relative">
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 hidden group-hover:flex text-[10px] font-mono text-foreground/60 bg-card border border-border/60 rounded px-1 py-0.5 whitespace-nowrap z-10">
                    {count} · {d.slice(5)}
                  </div>
                  <div className="flex-1 w-full flex items-end">
                    <motion.div
                      className="w-full rounded-t-sm"
                      style={{ background: isToday ? "var(--primary)" : "color-mix(in srgb, var(--primary) 55%, transparent)" }}
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.max(pct, count > 0 ? 4 : 0)}%` }}
                      transition={{ duration: 0.4, delay: i * 0.02, ease: "easeOut" }}
                    />
                  </div>
                  {days.length <= 14 && (
                    <span className={cn("text-[9px] font-mono shrink-0", isToday ? "text-primary" : "text-muted-foreground/40")}>
                      {new Date(d).toLocaleDateString("en-US", { weekday: "short" }).slice(0, 1)}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </PanelCard>
      )}

      {/* Prime hours */}
      <PanelCard title="Prime Work Hours (tasks completed by hour)">
        {totalCompleted === 0 ? (
          <p className="text-xs text-muted-foreground/40 py-2">No completed tasks in this period.</p>
        ) : (
          <div className="flex flex-col gap-1.5">
            {/* 24-bar chart */}
            <div className="flex items-end gap-0.5 h-20">
              {hourBuckets.map(({ hour, count }) => {
                const pct = (count / maxHour) * 100;
                const isWorkHour = hour >= 8 && hour <= 20;
                return (
                  <div key={hour} className="flex-1 flex flex-col items-center gap-0.5 group relative">
                    {count > 0 && (
                      <div className="absolute -top-5 left-1/2 -translate-x-1/2 hidden group-hover:flex text-[10px] font-mono text-foreground/60 bg-card border border-border/60 rounded px-1 py-0.5 whitespace-nowrap z-10">
                        {count} @ {hour}:00
                      </div>
                    )}
                    <div className="flex-1 w-full flex items-end">
                      <motion.div
                        className="w-full rounded-t-sm"
                        style={{
                          background: count > 0
                            ? (isWorkHour ? "var(--primary)" : "color-mix(in srgb, var(--primary) 45%, transparent)")
                            : "transparent",
                          minHeight: count > 0 ? 2 : 0,
                        }}
                        initial={{ height: 0 }}
                        animate={{ height: `${Math.max(pct, count > 0 ? 6 : 0)}%` }}
                        transition={{ duration: 0.4, delay: hour * 0.015, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            {/* Hour labels */}
            <div className="flex items-center">
              {[0, 6, 12, 18, 23].map((h) => (
                <span
                  key={h}
                  className="text-[9px] font-mono text-muted-foreground/40"
                  style={{ marginLeft: `${(h / 23) * 100}%` }}
                >
                  {h}h
                </span>
              ))}
            </div>
            {/* Prime hour annotation */}
            {(() => {
              const peak = hourBuckets.reduce((a, b) => (b.count > a.count ? b : a));
              if (peak.count === 0) return null;
              return (
                <p className="text-xs text-muted-foreground/60 pt-1">
                  Peak hour: <span style={{ color: "var(--primary)" }} className="font-semibold">{peak.hour}:00 – {peak.hour + 1}:00</span>
                  {" "}({peak.count} task{peak.count > 1 ? "s" : ""})
                </p>
              );
            })()}
          </div>
        )}
      </PanelCard>
    </div>
  );
}

/* ── Insights tab ───────────────────────────────────────────────────── */

function InsightsTab({ all, features, bugs }: {
  all: Card[]; features: import("@/shared/types").FeatureCard[]; bugs: import("@/shared/types").BugCard[];
}) {
  const total = all.length;
  const done  = all.filter((c) => c.status === "done").length;
  const completionPct = total > 0 ? Math.round((done / total) * 100) : 0;
  const verifiedBugs = bugs.filter((b) => b.isCauseVerified).length;
  const bugVerifyPct = bugs.length > 0 ? Math.round((verifiedBugs / bugs.length) * 100) : 0;

  /* Mood breakdown */
  const moodMap = new Map<string, number>();
  all.forEach((c) => moodMap.set(c.mood, (moodMap.get(c.mood) ?? 0) + 1));
  const topMoods = Array.from(moodMap.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5);

  /* Throughput: done by week (last 8 weeks) */
  const weeks: { label: string; feat: number; bug: number }[] = [];
  for (let i = 7; i >= 0; i--) {
    const now = new Date();
    const end = new Date(now.getTime() - i * 7 * 86400000);
    const start = new Date(end.getTime() - 7 * 86400000);
    const label = `W${end.toLocaleDateString("en-US", { month: "numeric", day: "numeric" })}`;
    weeks.push({
      label,
      feat: features.filter((c) => c.completedAt && new Date(c.completedAt) >= start && new Date(c.completedAt) < end).length,
      bug:  bugs.filter((c) => c.completedAt && new Date(c.completedAt) >= start && new Date(c.completedAt) < end).length,
    });
  }
  const maxWeek = Math.max(...weeks.map((w) => w.feat + w.bug), 1);

  return (
    <div className="flex flex-col gap-4">
      {/* Top row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Completion"   value={completionPct}  sub={`${done}/${total} done`}         color="#10b981" delay={0}    suffix="%" />
        <StatCard label="Bug Verified" value={bugVerifyPct}   sub={`${verifiedBugs}/${bugs.length}`} color="#f43f5e" delay={0.06} suffix="%" />
        <StatCard label="Feature Split" value={features.length} sub={`${bugs.length} bugs`}         color="var(--primary)" delay={0.12} />
        <StatCard label="Avg Priority"  value={0}             sub={priorityAvgLabel(all)}           color="#f59e0b" delay={0.18} hideval />
      </div>

      {/* Weekly throughput */}
      <PanelCard title="Weekly Throughput (last 8 weeks)">
        <div className="flex items-end gap-1.5 h-28 pt-2">
          {weeks.map(({ label, feat, bug }, i) => {
            const total = feat + bug;
            const featPct = (feat / maxWeek) * 100;
            const bugPct  = (bug  / maxWeek) * 100;
            return (
              <div key={label} className="flex-1 flex flex-col items-center gap-1 group relative">
                {total > 0 && (
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 hidden group-hover:flex text-[10px] font-mono text-foreground/60 bg-card border border-border/60 rounded px-1 py-0.5 whitespace-nowrap z-10">
                    {feat}f · {bug}b
                  </div>
                )}
                <div className="flex-1 w-full flex items-end flex-col-reverse gap-0">
                  <motion.div
                    className="w-full rounded-t-sm"
                    style={{ background: "color-mix(in srgb, var(--primary) 55%, transparent)" }}
                    initial={{ height: 0 }}
                    animate={{ height: `${featPct}%` }}
                    transition={{ duration: 0.4, delay: i * 0.04, ease: "easeOut" }}
                  />
                  <motion.div
                    className="w-full"
                    style={{ background: "#f43f5e80" }}
                    initial={{ height: 0 }}
                    animate={{ height: `${bugPct}%` }}
                    transition={{ duration: 0.4, delay: i * 0.04 + 0.1, ease: "easeOut" }}
                  />
                </div>
                <span className="text-[9px] font-mono text-muted-foreground/40 truncate w-full text-center">{label}</span>
              </div>
            );
          })}
        </div>
        <div className="flex items-center gap-3 pt-1">
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-3 rounded-sm" style={{ background: "color-mix(in srgb, var(--primary) 55%, transparent)" }} />
            <span className="text-[10px] text-muted-foreground/60">Features</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-3 rounded-sm" style={{ background: "#f43f5e80" }} />
            <span className="text-[10px] text-muted-foreground/60">Bugs</span>
          </div>
        </div>
      </PanelCard>

      {/* Moods */}
      {topMoods.length > 0 && (
        <PanelCard title="Top Moods">
          <div className="flex items-center gap-4 flex-wrap py-1">
            {topMoods.map(([emoji, count]) => (
              <div key={emoji} className="flex flex-col items-center gap-1">
                <span className="text-2xl">{emoji}</span>
                <span className="text-xs font-mono text-muted-foreground/60">{count}</span>
              </div>
            ))}
          </div>
        </PanelCard>
      )}
    </div>
  );
}

/* ── Helpers ────────────────────────────────────────────────────────── */

function buildDayRange(start: Date, end: Date): string[] {
  const days: string[] = [];
  const cur = new Date(start);
  const limit = Math.min(90, Math.ceil((end.getTime() - start.getTime()) / 86400000));
  for (let i = 0; i < limit; i++) {
    days.push(cur.toISOString().slice(0, 10));
    cur.setDate(cur.getDate() + 1);
  }
  return days;
}

function priorityAvgLabel(all: Card[]): string {
  if (all.length === 0) return "no cards";
  const map = { high: 3, medium: 2, low: 1 };
  const avg = all.reduce((s, c) => s + (map[c.priority] ?? 2), 0) / all.length;
  if (avg >= 2.5) return "skewed high";
  if (avg >= 1.5) return "balanced";
  return "skewed low";
}

/* ── Shared sub-components ──────────────────────────────────────────── */

function StatCard({ label, value, sub, color, delay, suffix = "", hideval = false, sub2 }: {
  label: string; value: number; sub: string; color: string; delay: number;
  suffix?: string; hideval?: boolean; sub2?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay }}
      className="rounded-xl border border-border/50 bg-card/60 p-4 flex flex-col gap-2"
      style={{ borderTopColor: color, borderTopWidth: 2 }}
    >
      <p className="text-xs font-medium text-muted-foreground/70 uppercase tracking-wider">{label}</p>
      {!hideval && (
        <p className="text-3xl font-bold tracking-tight tabular-nums" style={{ color }}>
          {sub2 ?? value}{suffix}
        </p>
      )}
      <p className="text-xs text-muted-foreground/60">{sub}</p>
    </motion.div>
  );
}

function PanelCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border/50 bg-card/60 p-4 flex flex-col gap-3">
      <p className="text-xs font-semibold text-muted-foreground/60 uppercase tracking-wider">{title}</p>
      {children}
    </div>
  );
}

function StatusPanel({ title, cards, columns, delay }: {
  title: string; cards: Card[]; columns: { id: string; label: string }[]; delay: number;
}) {
  const total = Math.max(cards.length, 1);
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay }}>
      <PanelCard title={`${title} (${cards.length})`}>
        {cards.length === 0 ? (
          <p className="text-xs text-muted-foreground/40 py-2">No cards yet.</p>
        ) : (
          <div className="flex flex-col gap-2.5">
            {columns.map((col, i) => {
              const count = cards.filter((c) => c.status === col.id).length;
              const pct = (count / total) * 100;
              const color = COLUMN_NEON_COLOR[col.id] ?? "#64748b";
              return (
                <div key={col.id} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground/70 font-medium">{col.label}</span>
                    <span className="font-mono tabular-nums" style={{ color }}>{count}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted/60 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.5, delay: delay + i * 0.05, ease: "easeOut" }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </PanelCard>
    </motion.div>
  );
}

function PriorityBar({ label, count, max, color, delay }: {
  label: string; count: number; max: number; color: string; delay: number;
}) {
  const pct = max > 0 ? (count / max) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs font-medium text-muted-foreground/70 w-14 shrink-0">{label}</span>
      <div className="flex-1 h-2 rounded-full bg-muted/60 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, delay, ease: "easeOut" }}
        />
      </div>
      <span className="text-xs font-mono tabular-nums w-5 text-right shrink-0" style={{ color }}>{count}</span>
    </div>
  );
}

function CompletionDonut({ pct, done, total }: { pct: number; done: number; total: number }) {
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const dash = (pct / 100) * circumference;
  return (
    <div className="relative flex items-center justify-center">
      <svg width={112} height={112} className="-rotate-90">
        <circle cx={56} cy={56} r={radius} fill="none" stroke="var(--muted)" strokeWidth={10} />
        <motion.circle
          cx={56} cy={56} r={radius} fill="none" stroke="var(--primary)"
          strokeWidth={10} strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - dash }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          style={{ filter: "drop-shadow(0 0 6px var(--primary))" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-2xl font-bold tabular-nums" style={{ color: "var(--primary)" }}>{pct}%</span>
        <span className="text-[10px] text-muted-foreground/60 mt-0.5">{done}/{total}</span>
      </div>
    </div>
  );
}
