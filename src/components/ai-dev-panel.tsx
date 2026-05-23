"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Code2, X, Zap, Clock, Hash, Server } from "lucide-react";
import { cn } from "@/lib/utils";

interface AILogEntry {
  id: string;
  timestamp: string;
  endpoint: string;
  source: "groq" | "fallback";
  duration?: number;
  tokens?: number;
  status: "success" | "error" | "fallback";
}

// Global log store (in-memory for dev panel)
const aiLogs: AILogEntry[] = [];

export function logAIRequest(entry: Omit<AILogEntry, "id" | "timestamp">) {
  aiLogs.unshift({
    ...entry,
    id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
    timestamp: new Date().toISOString(),
  });
  if (aiLogs.length > 20) aiLogs.pop();
  // Dispatch custom event to notify panel
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("momentum-ai-log"));
  }
}

export function AIDevPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [logs, setLogs] = useState<AILogEntry[]>([]);

  useEffect(() => {
    const handleLog = () => setLogs([...aiLogs]);
    window.addEventListener("momentum-ai-log", handleLog);
    return () => window.removeEventListener("momentum-ai-log", handleLog);
  }, []);

  // Only show in development
  if (process.env.NODE_ENV !== "development" && !isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-50 w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
        title="AI Dev Panel"
      >
        <Code2 className="h-4 w-4" />
      </button>
    );
  }

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 z-50 w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
        title="AI Dev Panel"
      >
        <Code2 className="h-4 w-4" />
      </button>

      {/* Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-16 right-4 z-50 w-80 max-h-[60vh] bg-gray-900 text-gray-100 rounded-2xl shadow-2xl border border-gray-700 overflow-hidden"
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="h-3.5 w-3.5 text-purple-400" />
                <span className="text-xs font-semibold">Momentum AI Panel</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Model Info */}
            <div className="px-4 py-2 border-b border-gray-800 flex items-center gap-4 text-[10px] text-gray-400">
              <div className="flex items-center gap-1">
                <Server className="h-3 w-3" />
                <span>llama-3.3-70b-versatile</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Groq Cloud</span>
              </div>
            </div>

            {/* Logs */}
            <div className="overflow-y-auto max-h-[40vh] p-2 space-y-1.5">
              {logs.length === 0 && (
                <p className="text-center text-xs text-gray-500 py-8">
                  No AI requests yet. Try breaking down a task.
                </p>
              )}
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="px-3 py-2 rounded-lg bg-gray-800/50 text-[11px] space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-purple-300">{log.endpoint}</span>
                    <span className={cn(
                      "px-1.5 py-0.5 rounded text-[9px] font-bold uppercase",
                      log.source === "groq" ? "bg-emerald-900 text-emerald-300" : "bg-amber-900 text-amber-300"
                    )}>
                      {log.source}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-400">
                    {log.duration && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-2.5 w-2.5" />
                        {log.duration}ms
                      </span>
                    )}
                    {log.tokens && (
                      <span className="flex items-center gap-1">
                        <Hash className="h-2.5 w-2.5" />
                        {log.tokens} tokens
                      </span>
                    )}
                    <span className="text-gray-500">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
