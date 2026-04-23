export interface GeminiPart {
  text?: string;
  functionCall?: { name: string; args: Record<string, unknown> };
  functionResponse?: { name: string; response: unknown };
  inlineData?: { mimeType: string; data: string };
}

export interface GeminiContent {
  role: "user" | "model";
  parts: GeminiPart[];
}

export interface ExecutedAction {
  fn: string;
  desc: string;
  success: boolean;
}

export interface UIMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  actions?: ExecutedAction[];
  ts: string;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  messages: UIMessage[];
  geminiHistory: GeminiContent[];
}
