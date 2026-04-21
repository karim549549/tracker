"use client";

import { useCallback, useEffect, useState } from "react";
import type { ChatSession, UIMessage, GeminiContent } from "@/lib/chat-types";

const STORAGE_KEY = "tracker-chat-sessions";

function generateId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function loadFromStorage(): ChatSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ChatSession[];
  } catch {
    return [];
  }
}

function saveToStorage(sessions: ChatSession[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  } catch {
    // quota exceeded — silently skip
  }
}

export function useChatSessions() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  useEffect(() => {
    const loaded = loadFromStorage();
    setSessions(loaded);
    if (loaded.length > 0) setActiveSessionId(loaded[loaded.length - 1].id);
  }, []);

  const persist = useCallback((updated: ChatSession[]) => {
    setSessions(updated);
    saveToStorage(updated);
  }, []);

  const createSession = useCallback((title?: string): ChatSession => {
    const session: ChatSession = {
      id: generateId(),
      title: title ?? `Session ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
      createdAt: new Date().toISOString(),
      messages: [],
      geminiHistory: [],
    };
    setSessions((prev) => {
      const updated = [...prev, session];
      saveToStorage(updated);
      return updated;
    });
    setActiveSessionId(session.id);
    return session;
  }, []);

  const deleteSession = useCallback((id: string) => {
    setSessions((prev) => {
      const updated = prev.filter((s) => s.id !== id);
      saveToStorage(updated);
      if (activeSessionId === id) {
        setActiveSessionId(updated.length > 0 ? updated[updated.length - 1].id : null);
      }
      return updated;
    });
  }, [activeSessionId]);

  const renameSession = useCallback((id: string, title: string) => {
    setSessions((prev) => {
      const updated = prev.map((s) => s.id === id ? { ...s, title } : s);
      saveToStorage(updated);
      return updated;
    });
  }, []);

  const appendMessage = useCallback((sessionId: string, msg: UIMessage) => {
    setSessions((prev) => {
      const updated = prev.map((s) =>
        s.id === sessionId ? { ...s, messages: [...s.messages, msg] } : s
      );
      saveToStorage(updated);
      return updated;
    });
  }, []);

  const updateSessionHistory = useCallback((
    sessionId: string,
    geminiHistory: GeminiContent[],
    lastMessagePatch?: Partial<UIMessage>
  ) => {
    setSessions((prev) => {
      const updated = prev.map((s) => {
        if (s.id !== sessionId) return s;
        const messages = lastMessagePatch
          ? s.messages.map((m, i) =>
              i === s.messages.length - 1 ? { ...m, ...lastMessagePatch } : m
            )
          : s.messages;
        return { ...s, geminiHistory, messages };
      });
      saveToStorage(updated);
      return updated;
    });
  }, []);

  const activeSession = sessions.find((s) => s.id === activeSessionId) ?? null;

  return {
    sessions,
    activeSession,
    activeSessionId,
    setActiveSessionId,
    createSession,
    deleteSession,
    renameSession,
    appendMessage,
    updateSessionHistory,
    persist,
  };
}
