"use client";

import { useRef, useState } from "react";
import { ChevronDown, Plus, Check, Folder, FolderOpen, Globe, BarChart2, Tag, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AppData, AppView, Environment, Project } from "@/shared/types";

interface AppSidebarProps {
  isOpen: boolean;
  appData: AppData | null;
  activeEnv: Environment | null;
  activeProject: Project | null;
  envProjects: Project[];
  activeView: AppView;
  onAddEnv: (name: string) => void;
  onSetActiveEnv: (id: string) => void;
  onAddProject: (name: string) => void;
  onSetActiveProject: (id: string) => void;
  onNavigate: (view: AppView) => void;
}

export function AppSidebar({
  isOpen, appData, activeEnv, activeProject, envProjects,
  activeView, onAddEnv, onSetActiveEnv, onAddProject,
  onSetActiveProject, onNavigate,
}: AppSidebarProps) {
  return (
    <aside className={cn(
      "flex flex-col shrink-0 border-r border-border/50 bg-sidebar overflow-hidden",
      "transition-[width] duration-200 ease-in-out",
      isOpen ? "w-60" : "w-0"
    )}>
      <div className="flex flex-col h-full w-60 overflow-y-auto overflow-x-hidden">
        <div className="flex flex-col gap-0 p-3 flex-1">

          {/* ── Environment ─────────────────────────────── */}
          <SectionLabel>Environment</SectionLabel>
          <EnvSection
            environments={appData?.environments ?? []}
            activeEnv={activeEnv}
            onSelect={onSetActiveEnv}
            onAdd={onAddEnv}
          />

          {/* Env-level Labels link */}
          {activeEnv && (
            <NavItem
              icon={<Tag className="h-3.5 w-3.5" />}
              label="Env Labels"
              active={activeView === "labels"}
              onClick={() => onNavigate("labels")}
              className="mt-1.5"
            />
          )}

          <Divider />

          {/* ── Projects ────────────────────────────────── */}
          <SectionLabel>Projects</SectionLabel>
          <ProjectSection
            projects={envProjects}
            activeProject={activeProject}
            activeView={activeView}
            hasEnv={!!activeEnv}
            onSelectProject={(id) => { onSetActiveProject(id); onNavigate("feature"); }}
            onAdd={(name) => { if (activeEnv) onAddProject(name); }}
            onNavigate={onNavigate}
          />

          <div className="flex-1" />

          {/* ── Active summary ───────────────────────── */}
          <Divider />
          <ActiveSummary env={activeEnv} project={activeProject} />
        </div>
      </div>
    </aside>
  );
}

/* ── Helpers ─────────────────────────────────────────────────────── */

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 px-1 mb-1.5 mt-1">
      {children}
    </p>
  );
}

function Divider() {
  return <div className="my-3 border-t border-border/40" />;
}

function NavItem({ icon, label, active, onClick, className }: {
  icon: React.ReactNode; label: string; active: boolean;
  onClick: () => void; className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 rounded-md px-2 py-1.5 text-xs w-full text-left transition-colors",
        active
          ? "bg-primary/12 text-primary font-semibold"
          : "text-muted-foreground/70 hover:bg-muted hover:text-foreground",
        className
      )}
    >
      <span className={cn("shrink-0", active ? "text-primary" : "text-muted-foreground")}>
        {icon}
      </span>
      {label}
      {active && (
        <span className="ml-auto h-1.5 w-1.5 rounded-full shrink-0" style={{ background: "var(--primary)" }} />
      )}
    </button>
  );
}

/* ── Env section ──────────────────────────────────────────────── */

function EnvSection({ environments, activeEnv, onSelect, onAdd }: {
  environments: Environment[]; activeEnv: Environment | null;
  onSelect: (id: string) => void; onAdd: (name: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function submit() {
    const n = newName.trim();
    if (n) { onAdd(n); setNewName(""); setAdding(false); }
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1">
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex-1 flex items-center gap-2 rounded-md px-2 py-1.5 text-sm bg-muted/60 hover:bg-muted text-foreground/90 border border-border/40 text-left transition-colors"
        >
          <Globe className="h-3.5 w-3.5 shrink-0 text-primary" />
          <span className="flex-1 truncate font-medium">{activeEnv ? activeEnv.name : "Select environment"}</span>
          <ChevronDown className={cn("h-3 w-3 shrink-0 text-muted-foreground transition-transform duration-150", open && "rotate-180")} />
        </button>
        <button
          onClick={() => { setAdding(true); setOpen(false); setTimeout(() => inputRef.current?.focus(), 50); }}
          className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors border border-border/40"
          title="Add environment"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>

      {open && environments.length > 0 && (
        <div className="flex flex-col rounded-md border border-border/50 bg-popover overflow-hidden shadow-lg">
          {environments.map((env) => (
            <button key={env.id} onClick={() => { onSelect(env.id); setOpen(false); }}
              className={cn("flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors hover:bg-accent hover:text-accent-foreground", env.id === activeEnv?.id && "bg-primary/10 text-primary")}
            >
              <Globe className="h-3 w-3 shrink-0" />
              <span className="flex-1 truncate">{env.name}</span>
              {env.id === activeEnv?.id && <Check className="h-3 w-3 shrink-0" />}
            </button>
          ))}
        </div>
      )}

      {adding && (
        <form onSubmit={(e) => { e.preventDefault(); submit(); }} className="flex items-center gap-1">
          <input ref={inputRef} value={newName} onChange={(e) => setNewName(e.target.value)}
            placeholder="Env name…"
            className="flex-1 h-7 rounded-md px-2 text-xs bg-input border border-border/60 text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary/60"
            onKeyDown={(e) => e.key === "Escape" && setAdding(false)}
          />
          <button type="submit" className="h-7 w-7 flex items-center justify-center rounded-md bg-primary/20 hover:bg-primary/30 text-primary transition-colors">
            <Check className="h-3.5 w-3.5" />
          </button>
        </form>
      )}
      {environments.length === 0 && !adding && (
        <p className="text-xs text-muted-foreground/50 px-1">No environments yet.</p>
      )}
    </div>
  );
}

/* ── Project section ──────────────────────────────────────────── */

const PROJECT_SUBNAV: { view: AppView; label: string; icon: React.ReactNode }[] = [
  { view: "performance", label: "Performance", icon: <BarChart2 className="h-3 w-3" /> },
  { view: "daily-logs",  label: "Daily Logs",  icon: <BookOpen  className="h-3 w-3" /> },
];

function ProjectSection({ projects, activeProject, activeView, hasEnv, onSelectProject, onAdd, onNavigate }: {
  projects: Project[]; activeProject: Project | null; activeView: AppView;
  hasEnv: boolean; onSelectProject: (id: string) => void;
  onAdd: (name: string) => void; onNavigate: (v: AppView) => void;
}) {
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");

  function submit() {
    const n = newName.trim();
    if (n) { onAdd(n); setNewName(""); setAdding(false); }
  }

  if (!hasEnv) return <p className="text-xs text-muted-foreground/40 px-1">Create an environment first.</p>;

  return (
    <div className="flex flex-col gap-0.5">
      {projects.map((project) => {
        const isActive = project.id === activeProject?.id;
        const inKanban = activeView === "feature" || activeView === "bug";
        return (
          <div key={project.id}>
            <button
              onClick={() => onSelectProject(project.id)}
              className={cn(
                "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-left w-full transition-colors",
                isActive && inKanban
                  ? "bg-primary/12 text-primary"
                  : isActive
                  ? "bg-muted/50 text-foreground"
                  : "text-foreground/70 hover:bg-muted hover:text-foreground"
              )}
            >
              {isActive ? <FolderOpen className="h-3.5 w-3.5 shrink-0" /> : <Folder className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />}
              <span className="flex-1 truncate font-medium">{project.name}</span>
              {isActive && inKanban && (
                <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: "var(--primary)" }} />
              )}
            </button>

            {/* Sub-nav — only shown under active project */}
            {isActive && (
              <div className="ml-4 mt-0.5 flex flex-col gap-0.5 border-l border-border/40 pl-2">
                {PROJECT_SUBNAV.map(({ view, label, icon }) => (
                  <NavItem
                    key={view}
                    icon={icon}
                    label={label}
                    active={activeView === view}
                    onClick={() => onNavigate(view)}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}

      {adding ? (
        <form onSubmit={(e) => { e.preventDefault(); submit(); }} className="flex items-center gap-1 mt-0.5">
          <input value={newName} onChange={(e) => setNewName(e.target.value)}
            placeholder="Project name…"
            className="flex-1 h-7 rounded-md px-2 text-xs bg-input border border-border/60 text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary/60"
            onKeyDown={(e) => e.key === "Escape" && setAdding(false)}
            autoFocus
          />
          <button type="submit" className="h-7 w-7 flex items-center justify-center rounded-md bg-primary/20 hover:bg-primary/30 text-primary transition-colors">
            <Check className="h-3.5 w-3.5" />
          </button>
        </form>
      ) : (
        <button onClick={() => setAdding(true)}
          className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs text-muted-foreground/60 hover:text-muted-foreground hover:bg-muted transition-colors w-full mt-0.5"
        >
          <Plus className="h-3 w-3" />Add project
        </button>
      )}
    </div>
  );
}

/* ── Active summary ───────────────────────────────────────────── */

function ActiveSummary({ env, project }: { env: Environment | null; project: Project | null }) {
  return (
    <div className="flex flex-col gap-1 px-1 pb-1">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50 mb-0.5">Active</p>
      <Row label="ENV"     value={env?.name ?? "—"} />
      <Row label="PROJECT" value={project?.name ?? "—"} />
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  const dim = value === "—";
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] font-mono font-semibold text-muted-foreground/50 w-14 shrink-0">{label}</span>
      <span className={cn("text-xs font-medium truncate", dim ? "text-muted-foreground/30" : "text-foreground/80")}>{value}</span>
      {!dim && <span className="h-1.5 w-1.5 rounded-full shrink-0 ml-auto" style={{ background: "var(--primary)", opacity: 0.7 }} />}
    </div>
  );
}
