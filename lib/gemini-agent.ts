"use client";

import { GEMINI_API_KEY, GEMINI_MODEL } from "./ai-config";
import type { GeminiContent, GeminiPart, ExecutedAction } from "./chat-types";
import type { AppData, Card, FeatureCard, BugCard } from "@/shared/types";

/* ── Tool declarations ─────────────────────────────────────────────── */

export const AGENT_TOOLS = [
  {
    name: "add_feature",
    description: "Add a new feature card to the active project.",
    parameters: {
      type: "object",
      properties: {
        title: { type: "string", description: "Short feature title" },
        implementationPlan: { type: "string", description: "How to implement it" },
        priority: { type: "string", enum: ["low", "medium", "high"] },
        status: { type: "string", enum: ["open", "in-progress", "in-review", "done"], description: "Column to place it in (default: open)" },
        mood: { type: "string", description: "Emoji or short mood tag, e.g. '🚀'" },
        labelIds: { type: "array", items: { type: "string" }, description: "Optional label IDs to attach" },
      },
      required: ["title", "implementationPlan", "priority"],
    },
  },
  {
    name: "add_bug",
    description: "Add a new bug card to the active project.",
    parameters: {
      type: "object",
      properties: {
        title: { type: "string", description: "Short bug title" },
        reason: { type: "string", description: "What caused the bug" },
        priority: { type: "string", enum: ["low", "medium", "high"] },
        isCauseVerified: { type: "boolean", description: "Whether the root cause is confirmed" },
        status: { type: "string", enum: ["open", "in-progress", "in-review", "done"] },
        mood: { type: "string", description: "Emoji or short mood tag" },
        labelIds: { type: "array", items: { type: "string" } },
      },
      required: ["title", "reason", "priority", "isCauseVerified"],
    },
  },
  {
    name: "add_project",
    description: "Create a new project under the active environment.",
    parameters: {
      type: "object",
      properties: {
        name: { type: "string", description: "Project name" },
      },
      required: ["name"],
    },
  },
  {
    name: "add_label",
    description: "Create a new label in the active environment.",
    parameters: {
      type: "object",
      properties: {
        name: { type: "string", description: "Label name" },
        color: { type: "string", description: "Hex color, e.g. #ff6b6b" },
      },
      required: ["name", "color"],
    },
  },
  {
    name: "add_daily_log",
    description: "Add a daily log entry to the active project.",
    parameters: {
      type: "object",
      properties: {
        date: { type: "string", description: "Date in YYYY-MM-DD format" },
        content: { type: "string", description: "Log content (markdown supported)" },
      },
      required: ["date", "content"],
    },
  },
  {
    name: "move_card",
    description: "Move a card to a different status column.",
    parameters: {
      type: "object",
      properties: {
        id: { type: "string", description: "Card ID" },
        type: { type: "string", enum: ["feature", "bug"] },
        newStatus: { type: "string", enum: ["open", "in-progress", "in-review", "done"] },
      },
      required: ["id", "type", "newStatus"],
    },
  },
  {
    name: "delete_card",
    description: "Delete a card from the active project.",
    parameters: {
      type: "object",
      properties: {
        id: { type: "string", description: "Card ID" },
        type: { type: "string", enum: ["feature", "bug"] },
      },
      required: ["id", "type"],
    },
  },
  {
    name: "update_card",
    description: "Update fields on an existing card.",
    parameters: {
      type: "object",
      properties: {
        id: { type: "string", description: "Card ID" },
        type: { type: "string", enum: ["feature", "bug"] },
        title: { type: "string" },
        priority: { type: "string", enum: ["low", "medium", "high"] },
        status: { type: "string", enum: ["open", "in-progress", "in-review", "done"] },
        mood: { type: "string" },
        implementationPlan: { type: "string", description: "Feature cards only" },
        reason: { type: "string", description: "Bug cards only" },
        isCauseVerified: { type: "boolean", description: "Bug cards only" },
      },
      required: ["id", "type"],
    },
  },
];

/* ── System prompt ─────────────────────────────────────────────────── */

interface AppSnapshot {
  appData: AppData | null;
  activeEnvId: string | null;
  activeProjectId: string | null;
}

export function buildSystemPrompt(snap: AppSnapshot): string {
  const { appData, activeEnvId, activeProjectId } = snap;
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  const activeEnv = appData?.environments.find((e) => e.id === activeEnvId);
  const activeProject = appData?.projects.find((p) => p.id === activeProjectId);
  const envLabels = appData?.labels.filter((l) => l.envId === activeEnvId) ?? [];
  const projectsInEnv = appData?.projects.filter((p) => p.envId === activeEnvId) ?? [];

  const featuresSnapshot = (activeProject?.features ?? []).slice(0, 20).map((c) =>
    `  [${c.id}] "${c.title}" — status: ${c.status}, priority: ${c.priority}`
  ).join("\n");

  const bugsSnapshot = (activeProject?.bugs ?? []).slice(0, 20).map((c) =>
    `  [${c.id}] "${c.title}" — status: ${c.status}, priority: ${c.priority}`
  ).join("\n");

  const labelsSnapshot = envLabels.map((l) => `  [${l.id}] "${l.name}" (${l.color})`).join("\n");
  const projectsSnapshot = projectsInEnv.map((p) => `  [${p.id}] "${p.name}"`).join("\n");

  return `You are an AI assistant embedded in Tracker, a personal kanban / project-management app.
Today is ${today}.

## Your capabilities
You can take actions in the app by calling the provided tools. You can:
- Add feature cards and bug cards to the active project
- Move cards between columns (open → in-progress → in-review → done)
- Update or delete existing cards
- Create new projects under the active environment
- Create labels for the active environment
- Add daily log entries

## Current app state

**Active environment:** ${activeEnv ? `"${activeEnv.name}" (id: ${activeEnv.id})` : "None"}
**Active project:** ${activeProject ? `"${activeProject.name}" (id: ${activeProject.id})` : "None"}

**Projects in this environment:**
${projectsSnapshot || "  (none)"}

**Labels in this environment:**
${labelsSnapshot || "  (none)"}

**Features in active project (up to 20):**
${featuresSnapshot || "  (none)"}

**Bugs in active project (up to 20):**
${bugsSnapshot || "  (none)"}

## Behavior rules
- When the user gives a list of items to add, call the appropriate tool once per item.
- When moving or deleting cards, use the exact IDs shown above.
- After completing all actions, summarize what you did in a friendly, concise message.
- If the user asks something unrelated to the app, answer helpfully as a general assistant.
- Never invent card IDs — only reference IDs shown in the state above.
- If no active project exists, tell the user they need to select one first before adding cards.
- Default status for new cards is "open" unless the user specifies otherwise.
- Default mood is "🚀" for features and "🐛" for bugs unless specified.
`;
}

/* ── App action callbacks ──────────────────────────────────────────── */

export interface AgentActions {
  addCard: (draft: Omit<Card, "id" | "createdAt" | "updatedAt">) => void;
  moveCard: (id: string, type: "feature" | "bug", newStatus: string) => void;
  deleteCard: (id: string, type: "feature" | "bug") => void;
  updateCard: (id: string, type: "feature" | "bug", patch: Partial<Card>) => void;
  addProject: (name: string) => void;
  addLabel: (name: string, color: string, envId: string) => void;
  addDailyLog: (projectId: string, date: string, content: string) => void;
  activeProjectId: string | null;
  activeEnvId: string | null;
}

function dispatchTool(
  name: string,
  args: Record<string, unknown>,
  actions: AgentActions
): { success: boolean; result: string; desc: string } {
  try {
    if (name === "add_feature") {
      if (!actions.activeProjectId) return { success: false, result: "No active project", desc: "add feature" };
      const draft: Omit<FeatureCard, "id" | "createdAt" | "updatedAt"> = {
        type: "feature",
        title: args.title as string,
        implementationPlan: (args.implementationPlan as string) ?? "",
        priority: (args.priority as "low" | "medium" | "high") ?? "medium",
        status: (args.status as string) ?? "open",
        mood: (args.mood as string) ?? "🚀",
        labelIds: (args.labelIds as string[]) ?? [],
      };
      actions.addCard(draft);
      return { success: true, result: "Feature added", desc: `Add feature: "${args.title}"` };
    }

    if (name === "add_bug") {
      if (!actions.activeProjectId) return { success: false, result: "No active project", desc: "add bug" };
      const draft: Omit<BugCard, "id" | "createdAt" | "updatedAt"> = {
        type: "bug",
        title: args.title as string,
        reason: (args.reason as string) ?? "",
        priority: (args.priority as "low" | "medium" | "high") ?? "medium",
        isCauseVerified: (args.isCauseVerified as boolean) ?? false,
        status: (args.status as string) ?? "open",
        mood: (args.mood as string) ?? "🐛",
        labelIds: (args.labelIds as string[]) ?? [],
      };
      actions.addCard(draft);
      return { success: true, result: "Bug added", desc: `Add bug: "${args.title}"` };
    }

    if (name === "add_project") {
      if (!actions.activeEnvId) return { success: false, result: "No active environment", desc: "add project" };
      actions.addProject(args.name as string);
      return { success: true, result: "Project created", desc: `Create project: "${args.name}"` };
    }

    if (name === "add_label") {
      if (!actions.activeEnvId) return { success: false, result: "No active environment", desc: "add label" };
      actions.addLabel(args.name as string, args.color as string, actions.activeEnvId);
      return { success: true, result: "Label created", desc: `Create label: "${args.name}"` };
    }

    if (name === "add_daily_log") {
      if (!actions.activeProjectId) return { success: false, result: "No active project", desc: "add daily log" };
      actions.addDailyLog(actions.activeProjectId, args.date as string, args.content as string);
      return { success: true, result: "Log added", desc: `Add daily log for ${args.date}` };
    }

    if (name === "move_card") {
      actions.moveCard(args.id as string, args.type as "feature" | "bug", args.newStatus as string);
      return { success: true, result: "Card moved", desc: `Move card to ${args.newStatus}` };
    }

    if (name === "delete_card") {
      actions.deleteCard(args.id as string, args.type as "feature" | "bug");
      return { success: true, result: "Card deleted", desc: `Delete ${args.type} card` };
    }

    if (name === "update_card") {
      const { id, type, ...patch } = args as Record<string, unknown>;
      actions.updateCard(id as string, type as "feature" | "bug", patch as Partial<Card>);
      return { success: true, result: "Card updated", desc: `Update ${type} card` };
    }

    return { success: false, result: `Unknown tool: ${name}`, desc: name };
  } catch (e) {
    return { success: false, result: String(e), desc: name };
  }
}

/* ── Agent turn ────────────────────────────────────────────────────── */

export interface AgentTurnResult {
  responseText: string;
  updatedHistory: GeminiContent[];
  actions: ExecutedAction[];
}

export interface AttachmentForApi {
  mimeType: string;
  base64Data: string;
}

export async function runAgentTurn(
  history: GeminiContent[],
  userText: string,
  systemPrompt: string,
  actions: AgentActions,
  attachments?: AttachmentForApi[]
): Promise<AgentTurnResult> {
  const userParts: GeminiPart[] = [];
  if (userText) userParts.push({ text: userText });
  attachments?.forEach((a) => userParts.push({ inlineData: { mimeType: a.mimeType, data: a.base64Data } }));
  if (!userParts.length) userParts.push({ text: "" });

  const newHistory: GeminiContent[] = [
    ...history,
    { role: "user", parts: userParts },
  ];

  const executedActions: ExecutedAction[] = [];

  const callGemini = async (contents: GeminiContent[]): Promise<GeminiContent> => {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents,
          tools: [{ function_declarations: AGENT_TOOLS }],
          generationConfig: { temperature: 0.7 },
        }),
      }
    );
    if (!res.ok) throw new Error(`Gemini ${res.status}: ${await res.text()}`);
    const data = await res.json();
    const candidate = data.candidates?.[0];
    if (!candidate) throw new Error("No candidate in Gemini response");
    return candidate.content as GeminiContent;
  };

  let currentContents = newHistory;
  let finalText = "";
  const MAX_ROUNDS = 8;

  for (let round = 0; round < MAX_ROUNDS; round++) {
    const modelTurn = await callGemini(currentContents);
    currentContents = [...currentContents, modelTurn];

    const functionCalls = modelTurn.parts.filter((p: GeminiPart) => p.functionCall);
    if (functionCalls.length === 0) {
      finalText = modelTurn.parts.map((p: GeminiPart) => p.text ?? "").join("").trim();
      break;
    }

    const responseParts: GeminiPart[] = functionCalls.map((p: GeminiPart) => {
      const fn = p.functionCall!;
      const outcome = dispatchTool(fn.name, fn.args, actions);
      executedActions.push({ fn: fn.name, desc: outcome.desc, success: outcome.success });
      return {
        functionResponse: {
          name: fn.name,
          response: { result: outcome.result },
        },
      };
    });

    currentContents = [
      ...currentContents,
      { role: "user", parts: responseParts },
    ];
  }

  return {
    responseText: finalText || "Done.",
    updatedHistory: currentContents,
    actions: executedActions,
  };
}
