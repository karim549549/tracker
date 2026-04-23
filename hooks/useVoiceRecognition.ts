"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/* ── Browser API type declarations ─────────────────────────────────────── */

interface SpeechRecognitionResultItem {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionResult {
  readonly length: number;
  isFinal: boolean;
  item(index: number): SpeechRecognitionResultItem;
  [index: number]: SpeechRecognitionResultItem;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: ((e: SpeechRecognitionEvent) => void) | null;
  onerror: ((e: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

function getSpeechRecognition(): SpeechRecognitionConstructor | null {
  if (typeof window === "undefined") return null;
  return (
    (window as unknown as { SpeechRecognition?: SpeechRecognitionConstructor }).SpeechRecognition ??
    (window as unknown as { webkitSpeechRecognition?: SpeechRecognitionConstructor }).webkitSpeechRecognition ??
    null
  );
}

/* ── Types ──────────────────────────────────────────────────────────────── */

export type VoiceState =
  | { status: "idle" }
  | { status: "listening" }
  | { status: "processing" }
  | { status: "error"; kind: "unsupported" | "permission-denied" | "network" | "no-speech" | "unknown"; message: string };

export interface UseVoiceRecognitionReturn {
  voiceState: VoiceState;
  transcript: string;
  audioLevel: number;
  isSupported: boolean;
  startListening: () => void;
  stopListening: () => void;
  cancelListening: () => void;
  setIdle: () => void;
  resetTranscript: () => void;
  cleanup: () => void;
}

const SILENCE_DELAY = 2500;

/* ── Hook ───────────────────────────────────────────────────────────────── */

export function useVoiceRecognition(): UseVoiceRecognitionReturn {
  const [voiceState, setVoiceState] = useState<VoiceState>({ status: "idle" });
  const [transcript, setTranscript] = useState("");
  const [audioLevel, setAudioLevel] = useState(0);

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafRef = useRef<number | null>(null);
  const isListeningRef = useRef(false);
  const transcriptRef = useRef("");

  const isSupported = !!getSpeechRecognition();

  const clearSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current !== null) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  }, []);

  const cleanup = useCallback(() => {
    isListeningRef.current = false;
    clearSilenceTimer();

    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (recognitionRef.current) {
      recognitionRef.current.onresult = null;
      recognitionRef.current.onerror = null;
      recognitionRef.current.onend = null;
      try { recognitionRef.current.stop(); } catch { /* already stopped */ }
      recognitionRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
      analyserRef.current = null;
    }
    setAudioLevel(0);
  }, [clearSilenceTimer]);

  const stopListening = useCallback(() => {
    isListeningRef.current = false;
    clearSilenceTimer();

    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch { /* already stopped */ }
    }
    if (audioContextRef.current?.state === "running") {
      audioContextRef.current.suspend().catch(() => {});
    }
    setAudioLevel(0);
    setVoiceState({ status: "processing" });
  }, [clearSilenceTimer]);

  const cancelListening = useCallback(() => {
    isListeningRef.current = false;
    clearSilenceTimer();
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch { /* already stopped */ }
    }
    if (audioContextRef.current?.state === "running") {
      audioContextRef.current.suspend().catch(() => {});
    }
    setAudioLevel(0);
    setVoiceState({ status: "idle" });
  }, [clearSilenceTimer]);

  const setIdle = useCallback(() => {
    setVoiceState({ status: "idle" });
  }, []);

  const resetTranscript = useCallback(() => {
    transcriptRef.current = "";
    setTranscript("");
  }, []);

  const startListening = useCallback(() => {
    const SpeechRecognition = getSpeechRecognition();
    if (!SpeechRecognition) {
      setVoiceState({ status: "error", kind: "unsupported", message: "Speech recognition is not supported in this browser." });
      return;
    }

    // Tear down previous instance before creating a new one
    if (recognitionRef.current) {
      recognitionRef.current.onresult = null;
      recognitionRef.current.onerror = null;
      recognitionRef.current.onend = null;
      try { recognitionRef.current.stop(); } catch { /* ok */ }
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognitionRef.current = recognition;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let accumulated = "";
      for (let i = 0; i < event.results.length; i++) {
        accumulated += event.results[i][0].transcript;
      }
      transcriptRef.current = accumulated;
      setTranscript(accumulated);

      // Reset silence timer on every result (interim or final)
      clearSilenceTimer();
      silenceTimerRef.current = setTimeout(() => {
        if (isListeningRef.current && transcriptRef.current.trim()) {
          stopListening();
        }
      }, SILENCE_DELAY);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      // "network" and "no-speech" are transient — Chrome fires them when the
      // recognition session expires or detects silence. onend will fire next
      // and our onend handler will restart the session automatically.
      // Don't kill the session for these.
      if (event.error === "network" || event.error === "no-speech") return;

      type ErrorKind = Extract<VoiceState, { status: "error" }>["kind"];
      const kindMap: Record<string, ErrorKind> = {
        "not-allowed": "permission-denied",
        "service-not-allowed": "permission-denied",
      };
      const kind: ErrorKind = kindMap[event.error] ?? "unknown";
      setVoiceState({ status: "error", kind, message: event.error });
      cleanup();
    };

    // Chromium fires onend even in continuous mode on brief pauses — restart if still meant to be listening
    recognition.onend = () => {
      if (isListeningRef.current) {
        try { recognition.start(); } catch { /* already starting */ }
      }
    };

    isListeningRef.current = true;
    setVoiceState({ status: "listening" });

    try {
      recognition.start();
    } catch {
      setVoiceState({ status: "error", kind: "unknown", message: "Could not start speech recognition." });
      return;
    }

    // Start audio visualizer via Web Audio API
    navigator.mediaDevices.getUserMedia({ audio: true, video: false })
      .then((stream) => {
        mediaStreamRef.current = stream;
        const ctx = new AudioContext();
        audioContextRef.current = ctx;
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        analyserRef.current = analyser;
        ctx.createMediaStreamSource(stream).connect(analyser);

        const data = new Uint8Array(analyser.frequencyBinCount);

        const tick = () => {
          if (!analyserRef.current || !isListeningRef.current) return;
          analyserRef.current.getByteFrequencyData(data);
          let sum = 0;
          for (let i = 0; i < data.length; i++) sum += data[i] * data[i];
          const rms = Math.sqrt(sum / data.length) / 128; // normalize 0–1
          setAudioLevel(Math.min(rms, 1));
          rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);
      })
      .catch(() => {
        // Audio visualizer is non-critical — speech recognition continues without it
        setAudioLevel(0);
      });
  }, [clearSilenceTimer, stopListening, cleanup]);

  // Cleanup on unmount
  useEffect(() => {
    return () => { cleanup(); };
  }, [cleanup]);

  return {
    voiceState,
    transcript,
    audioLevel,
    isSupported,
    startListening,
    stopListening,
    cancelListening,
    setIdle,
    resetTranscript,
    cleanup,
  };
}
