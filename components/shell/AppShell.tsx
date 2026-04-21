"use client";

import { useState } from "react";
import { Menu, Bot } from "lucide-react";
import { Board } from "@/components/board/Board";
import { BoardTabs } from "./BoardTabs";
import { CardDrawer } from "@/components/drawer/CardDrawer";
import { CardFullView } from "@/components/dialog/CardFullView";
import { FloatingBanner } from "@/components/feedback/FloatingBanner";
import { AppSidebar } from "@/components/sidebar/AppSidebar";
import { ThemeSheet } from "@/components/theme/ThemeSheet";
import { useAppData } from "@/hooks/useAppData";
import { useCardMutations } from "@/hooks/useCardMutations";
import { useDrawerCard } from "@/hooks/useDrawerCard";
import { useFloatingBanner } from "@/hooks/useFloatingBanner";
import { PerformanceDashboard } from "@/components/performance/PerformanceDashboard";
import { LabelsPage } from "@/components/labels/LabelsPage";
import { DailyLogsPage } from "@/components/dailylogs/DailyLogsPage";
import { LanguageToggle } from "@/components/locale/LanguageToggle";
import { MarqueeBar } from "@/components/shell/MarqueeBar";
import { CelebrationGif } from "@/components/feedback/CelebrationGif";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { buildGifQuery, fetchRandomGif } from "@/lib/gif-service";
import type { Card } from "@/shared/types";
import { FEATURE_COLUMNS, BUG_COLUMNS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { AppView, BoardType } from "@/shared/types";
import type { ViewMode } from "@/components/shell/BoardTabs";

export function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeView, setActiveView] = useState<AppView>("feature");
  const [boardTabView, setBoardTabView] = useState<ViewMode>("feature");
  const [addToColumn, setAddToColumn] = useState<string>("open");
  const [celebrationGif, setCelebrationGif] = useState<{ url: string; title: string; type: string } | null>(null);
  const [chatOpen, setChatOpen] = useState(false);

  const {
    appData, isLoading,
    activeEnv, activeProject, envProjects, envLabels,
    persist,
    addEnvironment, setActiveEnv,
    addProject, setActiveProject,
    addLabel, updateLabel, deleteLabel, deleteLabels,
    addDailyLog, updateDailyLog, deleteDailyLog,
  } = useAppData();

  const mutations = useCardMutations(appData, activeProject?.id ?? null, persist);
  const drawer = useDrawerCard();
  const banner = useFloatingBanner();

  const agentActions = {
    addCard: mutations.addCard,
    moveCard: mutations.moveCard,
    deleteCard: mutations.deleteCard,
    updateCard: mutations.updateCard,
    addProject: (name: string) => { if (activeEnv) addProject(name, activeEnv.id); },
    addLabel: (name: string, color: string, envId: string) => addLabel(name, color, envId),
    addDailyLog: (projectId: string, date: string, content: string) => addDailyLog(projectId, date, content),
    activeProjectId: activeProject?.id ?? null,
    activeEnvId: activeEnv?.id ?? null,
  };

  function handleAddCard(columnId: string) {
    setAddToColumn(columnId);
    drawer.openCard(null);
  }

  function handleNavigate(view: AppView) {
    setActiveView(view);
    if (view === "feature" || view === "bug") {
      setBoardTabView(view as ViewMode);
    }
  }

  async function handleCardDone(card: Card) {
    const query = buildGifQuery(card);
    const url = await fetchRandomGif(query);
    if (url) setCelebrationGif({ url, title: card.title, type: card.type });
  }

  const boardType: BoardType = boardTabView;

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-muted-foreground text-sm animate-pulse">Loading…</p>
      </div>
    );
  }

  const features = activeProject?.features ?? [];
  const bugs = activeProject?.bugs ?? [];
  const cards = boardType === "feature" ? features : bugs;
  const columns = boardType === "feature" ? FEATURE_COLUMNS : BUG_COLUMNS;

  const isBoardView = activeView === "feature" || activeView === "bug";

  return (
    <div className="flex h-screen overflow-hidden">
      {/* ── Left sidebar ──────────────────────────────────── */}
      <AppSidebar
        isOpen={sidebarOpen}
        appData={appData}
        activeEnv={activeEnv}
        activeProject={activeProject}
        envProjects={envProjects}
        activeView={activeView}
        onAddEnv={addEnvironment}
        onSetActiveEnv={setActiveEnv}
        onAddProject={(name) => { if (activeEnv) addProject(name, activeEnv.id); }}
        onSetActiveProject={setActiveProject}
        onNavigate={handleNavigate}
      />

      {/* ── Main content ──────────────────────────────────── */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <FloatingBanner message={banner.bannerMessage} type={banner.bannerType} />

        {/* Header */}
        <header className="header-glow px-4 py-3.5 flex items-center justify-between shrink-0 bg-background/80 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen((o) => !o)}
              className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              title={sidebarOpen ? "Close sidebar" : "Open sidebar"}
            >
              <Menu className="h-4 w-4" />
            </button>

            <span className="text-lg font-bold tracking-tight text-neon-gradient">
              Tracker
            </span>
            <span className="text-muted-foreground/30 text-sm">—</span>

            <ActiveBreadcrumb
              envName={activeEnv?.name ?? null}
              projectName={activeProject?.name ?? null}
              sidebarOpen={sidebarOpen}
            />
          </div>

          <div className="flex items-center gap-1">
            <LanguageToggle />
            <button
              onClick={() => setChatOpen((o) => !o)}
              title="AI Assistant"
              className={cn(
                "h-7 w-7 flex items-center justify-center rounded-md transition-colors",
                chatOpen
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
              style={chatOpen ? { background: "color-mix(in srgb, var(--primary) 20%, transparent)", color: "var(--primary)" } : undefined}
            >
              <Bot className="h-4 w-4" />
            </button>
            <ThemeSheet />
          </div>
        </header>

        {/* Motivational quotes marquee */}
        <MarqueeBar />

        {/* Board tabs — only shown for kanban views */}
        {isBoardView && activeProject && (
          <BoardTabs
            active={boardTabView}
            onChange={(tab) => { setBoardTabView(tab); setActiveView(tab); }}
            featureCount={features.length}
            bugCount={bugs.length}
          />
        )}

        <main className="flex-1 overflow-hidden">
          {!activeProject && activeView !== "labels" ? (
            <EmptyState
              hasEnv={!!activeEnv}
              sidebarOpen={sidebarOpen}
              onOpenSidebar={() => setSidebarOpen(true)}
            />
          ) : activeView === "performance" ? (
            <PerformanceDashboard project={activeProject!} />
          ) : activeView === "labels" ? (
            <LabelsPage
              envId={activeEnv?.id ?? null}
              labels={envLabels}
              onAdd={addLabel}
              onUpdate={updateLabel}
              onDelete={deleteLabel}
              onDeleteMany={deleteLabels}
            />
          ) : activeView === "daily-logs" ? (
            <DailyLogsPage
              projectId={activeProject!.id}
              logs={appData?.dailyLogs.filter((l) => l.projectId === activeProject!.id) ?? []}
              onAdd={(date, content) => addDailyLog(activeProject!.id, date, content)}
              onUpdate={updateDailyLog}
              onDelete={deleteDailyLog}
            />
          ) : (
            <Board
              key={`${activeProject!.id}-${boardType}`}
              columns={columns}
              cards={cards}
              boardType={boardType}
              mutations={mutations}
              onEditCard={drawer.openCard}
              onAddCard={handleAddCard}
              onCardDone={handleCardDone}
            />
          )}
        </main>
      </div>

      {/* ── Overlays ──────────────────────────────────────── */}
      <CardDrawer
        isOpen={drawer.isDrawerOpen}
        activeCard={drawer.activeCard}
        boardType={boardType}
        initialColumnId={addToColumn}
        mutations={mutations}
        labels={envLabels}
        onClose={drawer.closeDrawer}
        onExpand={() => {
          drawer.openFullView();
          banner.showBanner("Expanded view", "info");
        }}
      />

      <CardFullView
        card={drawer.activeCard}
        isOpen={drawer.isFullViewOpen}
        labels={envLabels}
        onClose={drawer.closeFullView}
      />

      <CelebrationGif
        gifUrl={celebrationGif?.url ?? null}
        cardTitle={celebrationGif?.title ?? ""}
        cardType={celebrationGif?.type ?? "feature"}
        onDismiss={() => setCelebrationGif(null)}
      />

      <ChatPanel
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        appData={appData}
        activeEnvId={activeEnv?.id ?? null}
        activeProjectId={activeProject?.id ?? null}
        agentActions={agentActions}
      />
    </div>
  );
}

/* ── Breadcrumb ─────────────────────────────────────────────────────── */

function ActiveBreadcrumb({
  envName, projectName, sidebarOpen,
}: {
  envName: string | null; projectName: string | null; sidebarOpen: boolean;
}) {
  if (!envName && !projectName) return null;

  return (
    <div className={cn(
      "flex items-center gap-1.5 text-sm transition-opacity duration-200",
      sidebarOpen ? "opacity-0 pointer-events-none" : "opacity-100"
    )}>
      {envName && <span className="text-muted-foreground/70 font-mono text-xs">{envName}</span>}
      {envName && projectName && <span className="text-muted-foreground/30">·</span>}
      {projectName && <span className="text-foreground/80 font-medium text-xs">{projectName}</span>}
    </div>
  );
}

/* ── Empty state ────────────────────────────────────────────────────── */

function EmptyState({
  hasEnv, sidebarOpen, onOpenSidebar,
}: {
  hasEnv: boolean; sidebarOpen: boolean; onOpenSidebar: () => void;
}) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center board-grid h-full">
      <div className="flex flex-col items-center gap-2">
        <div
          className="h-12 w-12 rounded-xl flex items-center justify-center mb-1"
          style={{ background: "color-mix(in srgb, var(--primary) 15%, transparent)" }}
        >
          <span className="text-2xl">{hasEnv ? "📁" : "🌐"}</span>
        </div>
        <p className="text-sm font-semibold text-foreground/80">
          {hasEnv ? "No project selected" : "No environment yet"}
        </p>
        <p className="text-xs text-muted-foreground/60 max-w-48">
          {hasEnv
            ? "Select or create a project in the sidebar to start tracking."
            : "Open the sidebar and create your first environment to get started."}
        </p>
        {!sidebarOpen && (
          <button
            onClick={onOpenSidebar}
            className="mt-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
            style={{
              background: "color-mix(in srgb, var(--primary) 20%, transparent)",
              color: "var(--primary)",
              border: "1px solid color-mix(in srgb, var(--primary) 40%, transparent)",
            }}
          >
            Open sidebar
          </button>
        )}
      </div>
    </div>
  );
}
