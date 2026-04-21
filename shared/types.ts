export type Priority = "low" | "medium" | "high";
export type Mood = string;
export type BoardType = "feature" | "bug";
export type AppView = "feature" | "bug" | "performance" | "labels" | "daily-logs";

interface BaseCard {
  id: string;
  title: string;
  type: BoardType;
  priority: Priority;
  status: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;   // set when status → "done", cleared when moved out
  mood: Mood;
  labelIds: string[];     // references Label.id
}

export interface FeatureCard extends BaseCard {
  type: "feature";
  implementationPlan: string;
}

export interface BugCard extends BaseCard {
  type: "bug";
  reason: string;
  isCauseVerified: boolean;
}

export type Card = FeatureCard | BugCard;

export interface ColumnDef {
  id: string;
  label: string;
}

export interface BoardData {
  features: FeatureCard[];
  bugs: BugCard[];
}

export interface Environment {
  id: string;
  name: string;
}

export interface Project {
  id: string;
  envId: string;
  name: string;
  features: FeatureCard[];
  bugs: BugCard[];
}

export interface Label {
  id: string;
  envId: string;
  name: string;
  color: string;
}

export interface DailyLog {
  id: string;
  projectId: string;
  date: string;          // YYYY-MM-DD
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppData {
  environments: Environment[];
  projects: Project[];
  labels: Label[];
  dailyLogs: DailyLog[];
  activeEnvId: string | null;
  activeProjectId: string | null;
}

export interface IpcReadResult {
  ok: boolean;
  data?: AppData;
  error?: string;
}

export interface IpcWriteResult {
  ok: boolean;
  error?: string;
}

export interface TrackerBridge {
  loadBoard: () => Promise<IpcReadResult>;
  saveBoard: (data: AppData) => Promise<IpcWriteResult>;
}

declare global {
  interface Window {
    tracker: TrackerBridge;
  }
}
