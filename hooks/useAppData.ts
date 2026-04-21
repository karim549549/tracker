"use client";

import { useCallback, useEffect, useState } from "react";
import type { AppData, Environment, Label, DailyLog, Project } from "@/shared/types";
import { generateId, now } from "@/lib/utils";
import { useIpc } from "./useIpc";

const EMPTY_APP: AppData = {
  environments: [],
  projects: [],
  labels: [],
  dailyLogs: [],
  activeEnvId: null,
  activeProjectId: null,
};

function migrateCard<T extends { labelIds?: string[]; labels?: string[] }>(c: T): T {
  return { ...c, labelIds: c.labelIds ?? [] };
}

function migrate(raw: AppData): AppData {
  return {
    ...raw,
    labels: raw.labels ?? [],
    dailyLogs: raw.dailyLogs ?? [],
    projects: (raw.projects ?? []).map((p) => ({
      ...p,
      features: (p.features ?? []).map(migrateCard),
      bugs: (p.bugs ?? []).map(migrateCard),
    })),
  };
}

export function useAppData() {
  const [appData, setAppData] = useState<AppData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { load, save } = useIpc();

  useEffect(() => {
    load()
      .then((r) => setAppData(r.ok && r.data ? migrate(r.data) : EMPTY_APP))
      .catch(() => setAppData(EMPTY_APP))
      .finally(() => setIsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const persist = useCallback(
    async (data: AppData) => {
      setAppData(data);
      await save(data);
    },
    [save]
  );

  /* ── Environments ──────────────────────────────────────────────── */

  const addEnvironment = useCallback((name: string) => {
    setAppData((prev) => {
      const base = prev ?? EMPTY_APP;
      const env: Environment = { id: generateId(), name };
      const updated: AppData = {
        ...base,
        environments: [...base.environments, env],
        activeEnvId: base.environments.length === 0 ? env.id : base.activeEnvId,
      };
      save(updated);
      return updated;
    });
  }, [save]);

  const setActiveEnv = useCallback((id: string) => {
    setAppData((prev) => {
      if (!prev) return prev;
      const inEnv = prev.projects.filter((p) => p.envId === id);
      const keep = inEnv.some((p) => p.id === prev.activeProjectId);
      const updated: AppData = {
        ...prev,
        activeEnvId: id,
        activeProjectId: keep ? prev.activeProjectId : (inEnv[0]?.id ?? null),
      };
      save(updated);
      return updated;
    });
  }, [save]);

  /* ── Projects ──────────────────────────────────────────────────── */

  const addProject = useCallback((name: string, envId: string) => {
    setAppData((prev) => {
      const base = prev ?? EMPTY_APP;
      const project: Project = { id: generateId(), envId, name, features: [], bugs: [] };
      const isFirst = !base.projects.some((p) => p.envId === envId);
      const updated: AppData = {
        ...base,
        projects: [...base.projects, project],
        activeProjectId: isFirst ? project.id : base.activeProjectId,
      };
      save(updated);
      return updated;
    });
  }, [save]);

  const setActiveProject = useCallback((id: string) => {
    setAppData((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, activeProjectId: id };
      save(updated);
      return updated;
    });
  }, [save]);

  /* ── Labels ────────────────────────────────────────────────────── */

  const addLabel = useCallback((name: string, color: string, envId: string) => {
    setAppData((prev) => {
      const base = prev ?? EMPTY_APP;
      const label: Label = { id: generateId(), envId, name, color };
      const updated = { ...base, labels: [...base.labels, label] };
      save(updated);
      return updated;
    });
  }, [save]);

  const updateLabel = useCallback((id: string, patch: Partial<Pick<Label, "name" | "color">>) => {
    setAppData((prev) => {
      if (!prev) return prev;
      const updated = {
        ...prev,
        labels: prev.labels.map((l) => (l.id === id ? { ...l, ...patch } : l)),
      };
      save(updated);
      return updated;
    });
  }, [save]);

  const deleteLabel = useCallback((id: string) => {
    setAppData((prev) => {
      if (!prev) return prev;
      const updated = {
        ...prev,
        labels: prev.labels.filter((l) => l.id !== id),
        // remove from all card labelIds
        projects: prev.projects.map((p) => ({
          ...p,
          features: p.features.map((c) => ({ ...c, labelIds: c.labelIds.filter((lid) => lid !== id) })),
          bugs: p.bugs.map((c) => ({ ...c, labelIds: c.labelIds.filter((lid) => lid !== id) })),
        })),
      };
      save(updated);
      return updated;
    });
  }, [save]);

  const deleteLabels = useCallback((ids: string[]) => {
    const idSet = new Set(ids);
    setAppData((prev) => {
      if (!prev) return prev;
      const updated = {
        ...prev,
        labels: prev.labels.filter((l) => !idSet.has(l.id)),
        projects: prev.projects.map((p) => ({
          ...p,
          features: p.features.map((c) => ({ ...c, labelIds: c.labelIds.filter((lid) => !idSet.has(lid)) })),
          bugs: p.bugs.map((c) => ({ ...c, labelIds: c.labelIds.filter((lid) => !idSet.has(lid)) })),
        })),
      };
      save(updated);
      return updated;
    });
  }, [save]);

  /* ── Daily Logs ────────────────────────────────────────────────── */

  const addDailyLog = useCallback((projectId: string, date: string, content: string) => {
    setAppData((prev) => {
      const base = prev ?? EMPTY_APP;
      const log: DailyLog = { id: generateId(), projectId, date, content, createdAt: now(), updatedAt: now() };
      const updated = { ...base, dailyLogs: [...base.dailyLogs, log] };
      save(updated);
      return updated;
    });
  }, [save]);

  const updateDailyLog = useCallback((id: string, content: string) => {
    setAppData((prev) => {
      if (!prev) return prev;
      const updated = {
        ...prev,
        dailyLogs: prev.dailyLogs.map((l) => l.id === id ? { ...l, content, updatedAt: now() } : l),
      };
      save(updated);
      return updated;
    });
  }, [save]);

  const deleteDailyLog = useCallback((id: string) => {
    setAppData((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, dailyLogs: prev.dailyLogs.filter((l) => l.id !== id) };
      save(updated);
      return updated;
    });
  }, [save]);

  /* ── Derived ───────────────────────────────────────────────────── */

  const activeEnv = appData?.environments?.find((e) => e.id === appData.activeEnvId) ?? null;
  const activeProject = appData?.projects?.find((p) => p.id === appData.activeProjectId) ?? null;
  const envProjects = appData?.projects?.filter((p) => p.envId === (appData.activeEnvId ?? "")) ?? [];
  const envLabels = appData?.labels?.filter((l) => l.envId === (appData.activeEnvId ?? "")) ?? [];

  return {
    appData, isLoading,
    activeEnv, activeProject, envProjects, envLabels,
    persist, setAppData,
    addEnvironment, setActiveEnv,
    addProject, setActiveProject,
    addLabel, updateLabel, deleteLabel, deleteLabels,
    addDailyLog, updateDailyLog, deleteDailyLog,
  };
}
