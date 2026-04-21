import type { AppData, IpcReadResult, IpcWriteResult } from "@/shared/types";

const EMPTY_APP: AppData = {
  environments: [],
  projects: [],
  labels: [],
  dailyLogs: [],
  activeEnvId: null,
  activeProjectId: null,
};

function isValidAppData(d: unknown): d is AppData {
  return (
    typeof d === "object" &&
    d !== null &&
    Array.isArray((d as AppData).environments) &&
    Array.isArray((d as AppData).projects)
  );
}

export function useIpc() {
  const isElectron = typeof window !== "undefined" && "tracker" in window;

  async function load(): Promise<IpcReadResult> {
    if (!isElectron) {
      try {
        const stored = localStorage.getItem("tracker-data");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (isValidAppData(parsed)) return { ok: true, data: parsed };
          // stale format — clear it
          localStorage.removeItem("tracker-data");
        }
      } catch {}
      return { ok: true, data: EMPTY_APP };
    }
    const result = await window.tracker.loadBoard();
    if (result.ok && !isValidAppData(result.data)) {
      return { ok: true, data: EMPTY_APP };
    }
    return result;
  }

  async function save(data: AppData): Promise<IpcWriteResult> {
    if (!isElectron) {
      try {
        localStorage.setItem("tracker-data", JSON.stringify(data));
        return { ok: true };
      } catch (e) {
        return { ok: false, error: String(e) };
      }
    }
    return window.tracker.saveBoard(data);
  }

  return { load, save };
}
