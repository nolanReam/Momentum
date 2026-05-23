"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, SkipForward, CheckCircle2, X, Timer, Keyboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Task } from "@/lib/types";
import { cn, formatTime } from "@/lib/utils";
import { completeTask, addXP } from "@/lib/store";
import confetti from "canvas-confetti";

interface FocusModeProps {
  task: Task;
  onComplete: (task: Task) => void;
  onExit: () => void;
}

export function FocusMode({ task, onComplete, onExit }: FocusModeProps) {
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);

  const totalEstimated = (task.estimated_minutes || 25) * 60;

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        setTimeElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const handleComplete = useCallback(() => {
    completeTask(task.id);
    addXP(task.xp_reward);

    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.6 },
      colors: ["#7c3aed", "#06b6d4", "#10b981", "#f59e0b", "#ec4899"],
    });

    setTimeout(() => {
      onComplete(task);
    }, 1000);
  }, [task, onComplete]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        setIsRunning((prev) => !prev);
      } else if (e.code === "Escape") {
        onExit();
      } else if (e.code === "Enter") {
        handleComplete();
      } else if (e.code === "KeyH") {
        setShowShortcuts((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onExit, handleComplete]);

  const progress = totalEstimated > 0 ? Math.min((timeElapsed / totalEstimated) * 100, 100) : 0;
  const circumference = 2 * Math.PI * 45;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      {/* Ambient gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900" />
      <motion.div
        className="absolute inset-0 opacity-30"
        animate={{
          background: [
            "radial-gradient(ellipse at 20% 50%, rgba(124, 58, 237, 0.15) 0%, transparent 60%)",
            "radial-gradient(ellipse at 80% 50%, rgba(6, 182, 212, 0.15) 0%, transparent 60%)",
            "radial-gradient(ellipse at 50% 80%, rgba(124, 58, 237, 0.15) 0%, transparent 60%)",
          ],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Exit button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 text-white/40 hover:text-white/80 z-10"
        onClick={onExit}
      >
        <X className="h-5 w-5" />
      </Button>

      {/* Shortcuts toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 left-4 text-white/40 hover:text-white/80 z-10"
        onClick={() => setShowShortcuts(!showShortcuts)}
      >
        <Keyboard className="h-4 w-4" />
      </Button>

      {/* Keyboard shortcuts overlay */}
      <AnimatePresence>
        {showShortcuts && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-14 left-4 bg-white/10 backdrop-blur-xl rounded-xl p-4 text-xs text-white/60 space-y-1 z-10"
          >
            <p><kbd className="bg-white/10 px-1.5 py-0.5 rounded">Space</kbd> Play/Pause</p>
            <p><kbd className="bg-white/10 px-1.5 py-0.5 rounded">Enter</kbd> Complete</p>
            <p><kbd className="bg-white/10 px-1.5 py-0.5 rounded">Esc</kbd> Exit</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 w-full max-w-md px-6 text-center">
        {/* Current task */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <p className="text-white/40 text-xs uppercase tracking-wider mb-3">Currently focused on</p>
          <h2 className="text-xl sm:text-2xl font-bold text-white leading-relaxed">
            {task.title}
          </h2>
          {task.description && (
            <p className="text-white/50 text-sm mt-2 max-w-sm mx-auto">{task.description}</p>
          )}
        </motion.div>

        {/* Timer circle */}
        <motion.div
          className="relative w-56 h-56 mx-auto mb-12"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
        >
          <svg className="w-56 h-56 transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="3"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="url(#focus-gradient)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - progress / 100)}
              className="transition-all duration-1000 ease-out"
            />
            <defs>
              <linearGradient id="focus-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#7c3aed" />
                <stop offset="50%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <Timer className="h-4 w-4 text-white/30 mb-2" />
            <span className="text-4xl font-mono text-white font-bold tracking-wider">
              {formatTime(timeElapsed)}
            </span>
            {task.estimated_minutes && (
              <span className="text-xs text-white/30 mt-2">
                est. {task.estimated_minutes} min
              </span>
            )}
          </div>
        </motion.div>

        {/* Controls */}
        <motion.div
          className="flex items-center justify-center gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Button
            variant="ghost"
            size="icon"
            className="h-12 w-12 rounded-full text-white/40 hover:text-white hover:bg-white/10"
            onClick={onExit}
          >
            <SkipForward className="h-5 w-5" />
          </Button>

          <button
            className={cn(
              "h-16 w-16 rounded-full flex items-center justify-center shadow-lg transition-all duration-300",
              isRunning
                ? "bg-white/10 hover:bg-white/20 shadow-none"
                : "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-glow"
            )}
            onClick={() => setIsRunning(!isRunning)}
          >
            {isRunning ? (
              <Pause className="h-6 w-6 text-white" />
            ) : (
              <Play className="h-6 w-6 text-white ml-0.5" />
            )}
          </button>

          <Button
            variant="ghost"
            size="icon"
            className="h-12 w-12 rounded-full text-emerald-400 hover:text-emerald-300 hover:bg-emerald-400/10"
            onClick={handleComplete}
          >
            <CheckCircle2 className="h-6 w-6" />
          </Button>
        </motion.div>

        {/* Ambient message */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="mt-10 text-white/25 text-sm italic"
        >
          One step at a time. You&apos;re doing it.
        </motion.p>
      </div>
    </motion.div>
  );
}
