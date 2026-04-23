"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Plus, Trash2, Send, Bot, ChevronDown, Loader2, Pencil } from "lucide-react";
import { runAgentTurn, buildSystemPrompt, type AgentActions } from "@/lib/gemini-agent";
import { useChatSessions } from "@/hooks/useChatSessions";
import type { UIMessage, ExecutedAction } from "@/lib/chat-types";
import type { AppData } from "@/shared/types";
import { cn } from "@/lib/utils";

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  appData: AppData | null;
  activeEnvId: string | null;
  activeProjectId: string | null;
  agentActions: AgentActions;
}

function generateMsgId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

/* ── Action badge ──────────────────────────────────────────────────── */
function ActionBadge({ action }: { action: ExecutedAction }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded font-mono",
        action.success
          ? "bg-emerald-500/15 text-emerald-400"
          : "bg-red-500/15 text-red-400"
      )}
    >
      {action.success ? "✓" : "✗"} {action.desc}
    </span>
  );
}

/* ── Message bubble ────────────────────────────────────────────────── */
function MessageBubble({ msg }: { msg: UIMessage }) {
  const isUser = msg.role === "user";
  return (
    <div className={cn("flex gap-2 text-sm w-full", isUser ? "flex-row-reverse" : "flex-row")}>
      {!isUser && (
        <div
          className="h-6 w-6 rounded-full shrink-0 flex items-center justify-center mt-0.5"
          style={{ background: "color-mix(in srgb, var(--primary) 20%, transparent)", border: "1px solid color-mix(in srgb, var(--primary) 40%, transparent)" }}
        >
          <Bot className="h-3 w-3" style={{ color: "var(--primary)" }} />
        </div>
      )}
      <div className={cn("flex flex-col gap-1 min-w-0 max-w-[85%]", isUser ? "items-end" : "items-start")}>
        <div
          className={cn("px-3 py-2 rounded-xl text-sm leading-relaxed whitespace-pre-wrap break-words w-full")}
          style={
            isUser
              ? { background: "color-mix(in srgb, var(--primary) 25%, transparent)", color: "var(--foreground)", border: "1px solid color-mix(in srgb, var(--primary) 40%, transparent)" }
              : { background: "var(--card)", color: "var(--card-foreground)", border: "1px solid var(--border)" }
          }
        >
          {msg.text || <span className="opacity-40 italic">Thinking…</span>}
        </div>
        {msg.actions && msg.actions.length > 0 && (
          <div className="flex flex-wrap gap-1 px-1">
            {msg.actions.map((a, i) => <ActionBadge key={i} action={a} />)}
          </div>
        )}
        <span className="text-[10px] text-muted-foreground/40 px-1">
          {new Date(msg.ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>
    </div>
  );
}

/* ── Session tab ───────────────────────────────────────────────────── */
function SessionTab({
  title,
  active,
  onSelect,
  onDelete,
  onRename,
}: {
  title: string;
  active: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onRename: (name: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(title);
  const inputRef = useRef<HTMLInputElement>(null);

  function commit() {
    const trimmed = val.trim();
    if (trimmed && trimmed !== title) onRename(trimmed);
    setEditing(false);
  }

  return (
    <div
      onClick={onSelect}
      className={cn(
        "group flex items-center gap-1.5 px-2.5 py-1.5 rounded-md cursor-pointer shrink-0 text-xs transition-colors min-w-0",
        active
          ? "text-foreground"
          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
      )}
      style={active ? { background: "color-mix(in srgb, var(--primary) 15%, transparent)", border: "1px solid color-mix(in srgb, var(--primary) 30%, transparent)" } : { border: "1px solid transparent" }}
    >
      {editing ? (
        <input
          ref={inputRef}
          value={val}
          autoFocus
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => setVal(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => { if (e.key === "Enter") commit(); if (e.key === "Escape") { setVal(title); setEditing(false); } }}
          className="bg-transparent outline-none w-24 text-xs"
        />
      ) : (
        <span className="truncate max-w-[100px]">{title}</span>
      )}
      <button
        onClick={(e) => { e.stopPropagation(); setVal(title); setEditing(true); setTimeout(() => inputRef.current?.select(), 10); }}
        className="opacity-0 group-hover:opacity-60 hover:!opacity-100 shrink-0 transition-opacity"
      >
        <Pencil className="h-2.5 w-2.5" />
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
        className="opacity-0 group-hover:opacity-60 hover:!opacity-100 shrink-0 transition-opacity"
      >
        <X className="h-2.5 w-2.5" />
      </button>
    </div>
  );
}

/* ── Main panel ────────────────────────────────────────────────────── */
export function ChatPanel({
  isOpen,
  onClose,
  appData,
  activeEnvId,
  activeProjectId,
  agentActions,
}: ChatPanelProps) {
  const {
    sessions,
    activeSession,
    activeSessionId,
    setActiveSessionId,
    createSession,
    deleteSession,
    renameSession,
    appendMessage,
    updateSessionHistory,
  } = useChatSessions();

  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen && sessions.length === 0) {
      createSession("Main session");
    }
  }, [isOpen, sessions.length, createSession]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeSession?.messages]);

  async function handleSend() {
    const text = input.trim();
    if (!text || isThinking) return;

    let sessionId = activeSessionId;
    if (!sessionId) {
      const s = createSession();
      sessionId = s.id;
    }

    setInput("");

    const userMsg: UIMessage = {
      id: generateMsgId(),
      role: "user",
      text,
      ts: new Date().toISOString(),
    };
    appendMessage(sessionId, userMsg);

    const thinkingMsg: UIMessage = {
      id: generateMsgId(),
      role: "assistant",
      text: "",
      ts: new Date().toISOString(),
    };
    appendMessage(sessionId, thinkingMsg);
    setIsThinking(true);

    try {
      const systemPrompt = buildSystemPrompt({ appData, activeEnvId, activeProjectId });
      const currentHistory = activeSession?.geminiHistory ?? [];

      const result = await runAgentTurn(currentHistory, text, systemPrompt, agentActions);

      const assistantMsg: UIMessage = {
        ...thinkingMsg,
        text: result.responseText,
        actions: result.actions,
      };

      updateSessionHistory(sessionId, result.updatedHistory, assistantMsg);
    } catch (err) {
      updateSessionHistory(sessionId, activeSession?.geminiHistory ?? [], {
        text: `Error: ${err instanceof Error ? err.message : String(err)}`,
      });
    } finally {
      setIsThinking(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  const messages = activeSession?.messages ?? [];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: 420, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 420, opacity: 0 }}
          transition={{ type: "spring", stiffness: 320, damping: 32 }}
          className="fixed right-0 top-0 bottom-0 z-40 flex flex-col"
          style={{
            width: 400,
            background: "var(--background)",
            borderLeft: "1px solid color-mix(in srgb, var(--primary) 25%, var(--border))",
            boxShadow: "-8px 0 32px rgb(0 0 0 / 40%), -1px 0 0 color-mix(in srgb, var(--primary) 12%, transparent)",
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3 shrink-0"
            style={{ borderBottom: "1px solid var(--border)", background: "color-mix(in srgb, var(--primary) 6%, var(--background))" }}
          >
            <div className="flex items-center gap-2">
              <div
                className="h-6 w-6 rounded-md flex items-center justify-center"
                style={{ background: "color-mix(in srgb, var(--primary) 20%, transparent)", border: "1px solid color-mix(in srgb, var(--primary) 40%, transparent)" }}
              >
                <Bot className="h-3.5 w-3.5" style={{ color: "var(--primary)", filter: "drop-shadow(0 0 4px var(--primary))" }} />
              </div>
              <span className="text-sm font-semibold" style={{ color: "var(--primary)", textShadow: "0 0 8px var(--primary)" }}>
                AI Assistant
              </span>
            </div>
            <button
              onClick={onClose}
              className="h-6 w-6 flex items-center justify-center rounded text-muted-foreground/60 hover:text-foreground transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Session tabs */}
          <div
            className="flex items-center gap-1 px-2 py-1.5 overflow-x-auto scrollbar-hide shrink-0"
            style={{ borderBottom: "1px solid var(--border)" }}
          >
            {sessions.map((s) => (
              <SessionTab
                key={s.id}
                title={s.title}
                active={s.id === activeSessionId}
                onSelect={() => setActiveSessionId(s.id)}
                onDelete={() => deleteSession(s.id)}
                onRename={(name) => renameSession(s.id, name)}
              />
            ))}
            <button
              onClick={() => createSession()}
              className="h-6 w-6 flex items-center justify-center rounded text-muted-foreground/50 hover:text-foreground hover:bg-muted/50 transition-colors shrink-0 ml-auto"
              title="New session"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-4 flex flex-col gap-4 chat-scroll">
            {messages.length === 0 && (
              <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center py-12">
                <div
                  className="h-12 w-12 rounded-xl flex items-center justify-center"
                  style={{ background: "color-mix(in srgb, var(--primary) 15%, transparent)", border: "1px solid color-mix(in srgb, var(--primary) 30%, transparent)" }}
                >
                  <Bot className="h-6 w-6" style={{ color: "var(--primary)", filter: "drop-shadow(0 0 6px var(--primary))" }} />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground/80">What can I help you with?</p>
                  <p className="text-xs text-muted-foreground/60 mt-1 max-w-56">
                    Add features, bugs, labels, move cards, create projects — just ask.
                  </p>
                </div>
                <div className="flex flex-col gap-1.5 mt-2 w-full max-w-64">
                  {[
                    "Add 3 bugs for the login flow",
                    "Move all in-progress features to in-review",
                    "Create a label called 'urgent' in red",
                  ].map((hint) => (
                    <button
                      key={hint}
                      onClick={() => setInput(hint)}
                      className="text-xs text-left px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                      style={{ background: "color-mix(in srgb, var(--primary) 8%, var(--muted))", border: "1px solid color-mix(in srgb, var(--primary) 20%, transparent)" }}
                    >
                      {hint}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((msg) => (
              <MessageBubble key={msg.id} msg={msg} />
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div
            className="shrink-0 px-3 pb-3 pt-2"
            style={{ borderTop: "1px solid var(--border)" }}
          >
            <div
              className="flex items-end gap-2 rounded-xl px-3 py-2"
              style={{
                background: "var(--input)",
                border: "1px solid color-mix(in srgb, var(--primary) 35%, var(--border))",
                boxShadow: "0 0 0 1px color-mix(in srgb, var(--primary) 10%, transparent)",
              }}
            >
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything… (Shift+Enter for newline)"
                rows={1}
                disabled={isThinking}
                className="flex-1 bg-transparent resize-none outline-none text-sm text-foreground placeholder:text-muted-foreground/40 max-h-40 overflow-y-auto leading-relaxed"
                style={{ minHeight: "1.5rem" }}
                onInput={(e) => {
                  const el = e.currentTarget;
                  el.style.height = "auto";
                  el.style.height = Math.min(el.scrollHeight, 160) + "px";
                }}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isThinking}
                className="h-7 w-7 flex items-center justify-center rounded-lg shrink-0 transition-all disabled:opacity-30"
                style={{ background: "var(--primary)", color: "var(--primary-foreground)", boxShadow: "0 0 8px color-mix(in srgb, var(--primary) 50%, transparent)" }}
              >
                {isThinking
                  ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  : <Send className="h-3.5 w-3.5" />
                }
              </button>
            </div>
            <p className="text-[10px] text-muted-foreground/30 text-center mt-1.5">
              Gemini can make mistakes. Review changes in the board.
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
