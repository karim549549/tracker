import { app } from "electron";
import * as fs from "fs/promises";
import * as path from "path";
import type { AppData } from "../shared/types";

const EMPTY: AppData = {
  environments: [],
  projects: [],
  labels: [],
  dailyLogs: [],
  activeEnvId: null,
  activeProjectId: null,
};

function getDataPath(): string {
  return path.join(app.getPath("userData"), "tracker-data.json");
}

function getTmpPath(): string {
  return getDataPath() + ".tmp";
}

export async function readAppData(): Promise<AppData> {
  try {
    const raw = await fs.readFile(getDataPath(), "utf-8");
    return JSON.parse(raw) as AppData;
  } catch {
    return EMPTY;
  }
}

export async function writeAppData(data: AppData): Promise<void> {
  const tmp = getTmpPath();
  await fs.writeFile(tmp, JSON.stringify(data, null, 2), "utf-8");
  await fs.rename(tmp, getDataPath());
}
