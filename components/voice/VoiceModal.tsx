"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Mic, MicOff, RefreshCw, Paperclip, Bot, Square } from "lucide-react";
import { runAgentTurn, buildSystemPrompt, type AgentActions, type AttachmentForApi } from "@/lib/gemini-agent";
import { useVoiceRecognition, type VoiceState } from "@/hooks/useVoiceRecognition";
import type { ExecutedAction, GeminiContent } from "@/lib/chat-types";
import type { AppData } from "@/shared/types";
import { cn } from "@/lib/utils";

/* ── Types ──────────────────────────────────────────────────────────────── */

interface Attachment {
  mimeType: string;
  base64Data: string;
  previewUrl: string;
  name: string;
  isVideoFrame: boolean;
}

interface ConversationMsg {
  role: "user" | "assistant";
  text: string;
  actions?: ExecutedAction[];
  attachments?: Attachment[];
  isThinking?: boolean;
}

interface VoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  appData: AppData | null;
  activeEnvId: string | null;
  activeProjectId: string | null;
  agentActions: AgentActions;
}

/* ── File → Attachment ──────────────────────────────────────────────────── */

async function fileToAttachment(file: File): Promise<Attachment> {
  if (file.type.startsWith("image/")) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        resolve({
          mimeType: file.type,
          base64Data: dataUrl.split(",")[1],
          previewUrl: dataUrl,
          name: file.name,
          isVideoFrame: false,
        });
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });
  }

  if (file.type.startsWith("video/")) {
    return new Promise((resolve, reject) => {
      const objectUrl = URL.createObjectURL(file);
      const video = document.createElement("video");
      video.preload = "metadata";
      video.muted = true;
      video.src = objectUrl;

      video.onloadedmetadata = () => {
        video.currentTime = Math.min(0.5, video.duration / 2);
      };

      video.onseeked = () => {
        const canvas = document.createElement("canvas");
        const maxDim = 1280;
        let w = video.videoWidth || 640;
        let h = video.videoHeight || 480;
        const ratio = Math.min(maxDim / w, maxDim / h, 1);
        canvas.width = Math.round(w * ratio);
        canvas.height = Math.round(h * ratio);
        canvas.getContext("2d")!.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
        URL.revokeObjectURL(objectUrl);
        resolve({
          mimeType: "image/jpeg",
          base64Data: dataUrl.split(",")[1],
          previewUrl: dataUrl,
          name: file.name,
          isVideoFrame: true,
        });
      };

      video.onerror = () => { URL.revokeObjectURL(objectUrl); reject(new Error("Failed to load video")); };
    });
  }

  throw new Error(`Unsupported file type: ${file.type}`);
}

/* ── Animated mic circle ────────────────────────────────────────────────── */

function VoiceCircle({
  audioLevel, voiceState, isProcessing, isSpeaking,
}: {
  audioLevel: number;
  voiceState: VoiceState;
  isProcessing: boolean;
  isSpeaking: boolean;
}) {
  const isListening = voiceState.status === "listening";
  const isError = voiceState.status === "error";
  const scale = isListening ? 1 + audioLevel * 0.55 : 1;

  const bg = isError
    ? "color-mix(in srgb, var(--destructive) 60%, transparent)"
    : isProcessing || isSpeaking
    ? "color-mix(in srgb, var(--primary) 65%, #22d3ee)"
    : isListening
    ? "color-mix(in srgb, var(--primary) 80%, transparent)"
    : "color-mix(in srgb, var(--primary) 35%, transparent)";

  const glow = isError
    ? "0 0 32px color-mix(in srgb, var(--destructive) 45%, transparent)"
    : isProcessing || isSpeaking
    ? "0 0 48px color-mix(in srgb, var(--primary) 55%, #22d3ee)"
    : isListening
    ? `0 0 ${16 + Math.round(audioLevel * 48)}px color-mix(in srgb, var(--primary) ${35 + Math.round(audioLevel * 40)}%, transparent)`
    : "0 0 20px color-mix(in srgb, var(--primary) 20%, transparent)";

  return (
    <div className="relative flex items-center justify-center h-28 w-28">
      {isListening && (
        <>
          <div className="absolute rounded-full border animate-[voice-ring-pulse_2s_ease-out_infinite]"
            style={{ width: 96, height: 96, borderColor: "color-mix(in srgb, var(--primary) 35%, transparent)", animationDelay: "0s" }} />
          <div className="absolute rounded-full border animate-[voice-ring-pulse_2s_ease-out_infinite]"
            style={{ width: 112, height: 112, borderColor: "color-mix(in srgb, var(--primary) 20%, transparent)", animationDelay: "0.55s" }} />
        </>
      )}
      <div
        className={cn(
          "h-16 w-16 rounded-full flex items-center justify-center",
          isProcessing && "animate-spin",
          !isListening && !isProcessing && !isSpeaking && !isError && "animate-[voice-idle-breathe_3s_ease-in-out_infinite]"
        )}
        style={{
          transform: isListening ? `scale(${scale})` : undefined,
          transition: isListening ? "none" : "transform 0.4s ease, box-shadow 0.4s ease",
          background: bg,
          boxShadow: glow,
        }}
      >
        {isProcessing
          ? <RefreshCw className="h-6 w-6" style={{ color: "var(--primary-foreground)" }} />
          : isError
          ? <MicOff className="h-6 w-6" style={{ color: "var(--primary-foreground)" }} />
          : <Mic className="h-6 w-6" style={{ color: "var(--primary-foreground)" }} />}
      </div>
    </div>
  );
}

/* ── Message bubble ─────────────────────────────────────────────────────── */

function MessageBubble({ msg }: { msg: ConversationMsg }) {
  const isUser = msg.role === "user";
  return (
    <div className={cn("flex gap-2 items-end", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <div className="h-7 w-7 rounded-full shrink-0 flex items-center justify-center mb-0.5"
          style={{ background: "color-mix(in srgb, var(--primary) 20%, transparent)" }}>
          <Bot className="h-3.5 w-3.5" style={{ color: "var(--primary)" }} />
        </div>
      )}
      <div
        className={cn(
          "max-w-xs rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
          isUser
            ? "rounded-br-sm"
            : "rounded-bl-sm",
          msg.isThinking && "animate-pulse opacity-60"
        )}
        style={isUser
          ? { background: "color-mix(in srgb, var(--primary) 22%, transparent)", color: "var(--foreground)" }
          : { background: "color-mix(in srgb, var(--muted) 80%, transparent)", color: "var(--foreground)" }}
      >
        {/* Attachment thumbnails */}
        {msg.attachments && msg.attachments.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {msg.attachments.map((a, i) => (
              <div key={i} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={a.previewUrl} alt={a.name} className="h-20 w-20 rounded-lg object-cover" />
                {a.isVideoFrame && (
                  <span className="absolute bottom-1 right-1 text-[9px] bg-black/60 text-white px-1 rounded">
                    video
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {msg.isThinking ? (
          <span className="tracking-widest text-base">···</span>
        ) : (
          <p>{msg.text}</p>
        )}

        {msg.actions && msg.actions.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {msg.actions.map((a, i) => (
              <span
                key={i}
                className={cn(
                  "inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded font-mono",
                  a.success ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"
                )}
              >
                {a.success ? "✓" : "✗"} {a.desc}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Attachment thumbnail (pending) ─────────────────────────────────────── */

function PendingThumb({ attachment, onRemove }: { attachment: Attachment; onRemove: () => void }) {
  return (
    <div className="relative shrink-0">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={attachment.previewUrl} alt={attachment.name} className="h-14 w-14 rounded-lg object-cover" />
      {attachment.isVideoFrame && (
        <span className="absolute bottom-0.5 right-0.5 text-[8px] bg-black/60 text-white px-0.5 rounded">
          vid
        </span>
      )}
      <button
        onClick={onRemove}
        className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center text-[10px] font-bold leading-none"
      >
        ×
      </button>
    </div>
  );
}

/* ── Main component ─────────────────────────────────────────────────────── */

export function VoiceModal({
  isOpen, onClose, appData, activeEnvId, activeProjectId, agentActions,
}: VoiceModalProps) {
  const {
    voiceState, transcript, audioLevel,
    startListening, stopListening, cancelListening, setIdle,
    resetTranscript, cleanup, isSupported,
  } = useVoiceRecognition();

  const [messages, setMessages] = useState<ConversationMsg[]>([]);
  const [pendingAttachments, setPendingAttachments] = useState<Attachment[]>([]);
  const [geminiHistory, setGeminiHistory] = useState<GeminiContent[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isMountedRef = useRef(true);
  const previewUrlsRef = useRef<string[]>([]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, transcript]);

  // Open / close
  useEffect(() => {
    if (isOpen) {
      if (!isSupported) {
        setMessages([{ role: "assistant", text: "Speech recognition is not supported in this browser. Please use the desktop app." }]);
        return;
      }
      setMessages([{ role: "assistant", text: "Hi! I'm listening. Tell me what you'd like to do — add a ticket, move a card, update a description, anything." }]);
      setGeminiHistory([]);
      setPendingAttachments([]);
      setIsProcessing(false);
      setIsSpeaking(false);
      startListening();
    } else {
      cleanup();
      window.speechSynthesis?.cancel();
      // Revoke all preview URLs
      previewUrlsRef.current.forEach((u) => URL.revokeObjectURL(u));
      previewUrlsRef.current = [];
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // AI trigger: fires when voiceState becomes "processing"
  useEffect(() => {
    if (voiceState.status !== "processing") return;

    const text = transcript.trim();
    const hasAttachments = pendingAttachments.length > 0;

    if (!text && !hasAttachments) {
      // Nothing to send — go back to idle (fixes the "stop does nothing" bug)
      setIdle();
      return;
    }

    // Snapshot attachments before clearing
    const attachmentsSnap = [...pendingAttachments];

    // Add user message to chat
    setMessages((prev) => [
      ...prev,
      { role: "user", text: text || "(attached files)", attachments: attachmentsSnap },
      { role: "assistant", text: "", isThinking: true },
    ]);
    resetTranscript();
    setPendingAttachments([]);
    setIsProcessing(true);

    const systemPrompt = buildSystemPrompt({ appData, activeEnvId, activeProjectId });
    const apiAttachments: AttachmentForApi[] = attachmentsSnap.map((a) => ({
      mimeType: a.mimeType,
      base64Data: a.base64Data,
    }));

    runAgentTurn(geminiHistory, text, systemPrompt, agentActions, apiAttachments.length ? apiAttachments : undefined)
      .then((result) => {
        if (!isMountedRef.current) return;

        setGeminiHistory(result.updatedHistory);
        // Replace the thinking placeholder with the real response
        setMessages((prev) => {
          const copy = [...prev];
          const idx = copy.findLastIndex((m) => m.isThinking);
          if (idx !== -1) copy[idx] = { role: "assistant", text: result.responseText, actions: result.actions };
          return copy;
        });

        // TTS
        if ("speechSynthesis" in window) {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(result.responseText);
          setIsSpeaking(true);
          const isQuestion = result.responseText.trim().endsWith("?");
          const noActions = result.actions.length === 0;
          utterance.onend = () => {
            if (!isMountedRef.current) return;
            setIsSpeaking(false);
            if (isQuestion && noActions) startListening();
          };
          window.speechSynthesis.speak(utterance);
        }
      })
      .catch((err) => {
        if (!isMountedRef.current) return;
        setMessages((prev) => {
          const copy = [...prev];
          const idx = copy.findLastIndex((m) => m.isThinking);
          if (idx !== -1) copy[idx] = { role: "assistant", text: `Error: ${err instanceof Error ? err.message : String(err)}` };
          return copy;
        });
      })
      .finally(() => {
        if (isMountedRef.current) setIsProcessing(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voiceState.status]);

  async function handleFilePick(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    const results = await Promise.allSettled(files.map(fileToAttachment));
    const attachments: Attachment[] = [];
    for (const r of results) {
      if (r.status === "fulfilled") {
        // Only track object URLs (not data URLs) for revocation
        if (r.value.previewUrl.startsWith("blob:")) {
          previewUrlsRef.current.push(r.value.previewUrl);
        }
        attachments.push(r.value);
      }
    }
    setPendingAttachments((prev) => [...prev, ...attachments]);
  }

  function handleClose() {
    cancelListening();
    window.speechSynthesis?.cancel();
    onClose();
  }

  function handleStop() {
    stopListening(); // → voiceState becomes "processing" → triggers AI effect
  }

  function handleSpeakAgain() {
    resetTranscript();
    startListening();
  }

  const isListening = voiceState.status === "listening";
  const isIdle = voiceState.status === "idle";
  const isError = voiceState.status === "error";
  const errorKind = isError ? (voiceState as Extract<typeof voiceState, { status: "error" }>).kind : null;

  const statusText = isError
    ? {
        "unsupported": "Not supported in this browser",
        "permission-denied": "Microphone access denied",
        "network": "Connection error",
        "no-speech": "No speech detected",
        "unknown": "Something went wrong",
      }[errorKind ?? "unknown"]
    : isProcessing
    ? "Thinking…"
    : isSpeaking
    ? "Speaking…"
    : isListening
    ? "Listening…"
    : "Tap to speak";

  const showSpeakAgain = !isListening && !isProcessing && !isSpeaking;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col"
          style={{ background: "var(--background)" }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.2 }}
        >
          {/* ── Header ── */}
          <div
            className="shrink-0 flex items-center justify-between px-5 py-3.5 border-b"
            style={{ borderColor: "color-mix(in srgb, var(--border) 60%, transparent)" }}
          >
            <div className="flex items-center gap-2">
              <div
                className="h-6 w-6 rounded-md flex items-center justify-center"
                style={{ background: "color-mix(in srgb, var(--primary) 20%, transparent)" }}
              >
                <Mic className="h-3.5 w-3.5" style={{ color: "var(--primary)" }} />
              </div>
              <span className="text-sm font-semibold">Voice Chat</span>
            </div>
            <button
              onClick={handleClose}
              className="h-7 w-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* ── Messages ── */}
          <div className="flex-1 overflow-y-auto chat-scroll px-5 py-4 space-y-3">
            {messages.map((msg, i) => (
              <MessageBubble key={i} msg={msg} />
            ))}

            {/* Live transcript ghost bubble */}
            {isListening && transcript && (
              <div className="flex justify-end">
                <div
                  className="max-w-xs rounded-2xl rounded-br-sm px-4 py-2.5 text-sm leading-relaxed italic opacity-50 border border-dashed"
                  style={{
                    borderColor: "color-mix(in srgb, var(--primary) 40%, transparent)",
                    color: "var(--foreground)",
                  }}
                >
                  {transcript}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* ── Pending attachments row ── */}
          {pendingAttachments.length > 0 && (
            <div
              className="shrink-0 flex items-center gap-2 px-5 py-2 border-t overflow-x-auto"
              style={{ borderColor: "color-mix(in srgb, var(--border) 40%, transparent)" }}
            >
              <span className="text-xs text-muted-foreground shrink-0">Attachments:</span>
              {pendingAttachments.map((a, i) => (
                <PendingThumb
                  key={i}
                  attachment={a}
                  onRemove={() => setPendingAttachments((prev) => prev.filter((_, idx) => idx !== i))}
                />
              ))}
            </div>
          )}

          {/* ── Mic area + controls ── */}
          <div
            className="shrink-0 border-t"
            style={{ borderColor: "color-mix(in srgb, var(--border) 50%, transparent)" }}
          >
            {/* Circle */}
            <div className="flex justify-center pt-4 pb-1">
              <VoiceCircle
                audioLevel={audioLevel}
                voiceState={voiceState}
                isProcessing={isProcessing}
                isSpeaking={isSpeaking}
              />
            </div>

            {/* Status */}
            <p
              className="text-center text-xs pb-3 transition-all"
              style={{ color: isError ? "var(--destructive)" : "color-mix(in srgb, var(--foreground) 50%, transparent)" }}
            >
              {statusText}
            </p>

            {/* Controls row */}
            <div
              className="flex items-center justify-center gap-3 px-5 pb-5"
            >
              {/* Attach */}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
                title="Attach image or video"
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors disabled:opacity-40"
                style={{
                  background: "color-mix(in srgb, var(--muted) 60%, transparent)",
                  color: "color-mix(in srgb, var(--foreground) 70%, transparent)",
                  border: "1px solid color-mix(in srgb, var(--border) 60%, transparent)",
                }}
              >
                <Paperclip className="h-3.5 w-3.5" />
                Attach
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                multiple
                className="hidden"
                onChange={handleFilePick}
              />

              {/* Stop — always visible when listening */}
              {isListening && (
                <button
                  onClick={handleStop}
                  title="Stop and send"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-colors"
                  style={{
                    background: "color-mix(in srgb, var(--destructive) 20%, transparent)",
                    color: "var(--destructive)",
                    border: "1px solid color-mix(in srgb, var(--destructive) 40%, transparent)",
                  }}
                >
                  <Square className="h-3.5 w-3.5 fill-current" />
                  Stop
                </button>
              )}

              {/* Speak again */}
              {showSpeakAgain && !isProcessing && (
                <button
                  onClick={handleSpeakAgain}
                  title="Start speaking again"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-colors"
                  style={{
                    background: "color-mix(in srgb, var(--primary) 18%, transparent)",
                    color: "var(--primary)",
                    border: "1px solid color-mix(in srgb, var(--primary) 35%, transparent)",
                  }}
                >
                  <Mic className="h-3.5 w-3.5" />
                  Speak again
                </button>
              )}

              {/* During processing/speaking: visual indicator only (no clickable) */}
              {(isProcessing || isSpeaking) && (
                <span className="text-xs animate-pulse" style={{ color: "var(--primary)" }}>
                  {isProcessing ? "Processing…" : "Speaking…"}
                </span>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
