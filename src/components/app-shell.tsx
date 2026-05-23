"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SyncBadge } from "@/components/status-indicator";
import { Dashboard } from "@/components/dashboard/dashboard";
import { EmotionalCheckin } from "@/components/emotional-checkin";
import { TaskBreakdown } from "@/components/task-breakdown";
import { FocusMode } from "@/components/focus-mode";
import { PanicMode } from "@/components/panic-mode";
import { Reflection } from "@/components/reflection";
import { getUser, signOut, fullSync, processSyncQueue } from "@/lib/store";
import { isSupabaseConfigured } from "@/lib/supabase";
import { UserProfile, Task, Mood } from "@/lib/types";

interface AppShellProps {
  onLogout: () => void;
}

type View = "dashboard" | "checkin" | "breakdown" | "focus" | "panic" | "reflection";

export function AppShell({ onLogout }: AppShellProps) {
  const [view, setView] = useState<View>("dashboard");
  const [user, setUser] = useState<UserProfile | null>(null);
  const [focusTask, setFocusTask] = useState<Task | null>(null);
  const [completedTask, setCompletedTask] = useState<Task | null>(null);
  const [currentMood, setCurrentMood] = useState<Mood | undefined>();
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    setUser(getUser());

    // Track online status
    setIsOnline(navigator.onLine);
    const handleOnline = () => {
      setIsOnline(true);
      console.log("[Momentum] Back online — syncing...");
      if (isSupabaseConfigured()) {
        fullSync();
      }
    };
    const handleOffline = () => {
      setIsOnline(false);
      console.log("[Momentum] Gone offline — using local storage");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Process any queued sync operations
    if (isSupabaseConfigured()) {
      processSyncQueue();
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const refreshUser = () => {
    setUser(getUser());
  };

  const handleStartFocus = (task: Task) => {
    setFocusTask(task);
    setView("checkin");
  };

  const handleCheckinComplete = (mood: Mood) => {
    setCurrentMood(mood);
    if (focusTask) {
      setView("focus");
    } else {
      setView("dashboard");
    }
  };

  const handleBreakdown = () => {
    setView("breakdown");
  };

  const handleFocusComplete = (task: Task) => {
    setCompletedTask(task);
    refreshUser();
    setView("reflection");
  };

  const handleReflectionComplete = () => {
    setCompletedTask(null);
    setFocusTask(null);
    refreshUser();
    setView("dashboard");
  };

  const handlePanic = () => {
    setView("panic");
  };

  const handleLogout = async () => {
    await signOut();
    onLogout();
  };

  if (!user) return null;

  return (
    <div className="min-h-screen">
      <AnimatePresence mode="wait">
        {view === "checkin" && (
          <motion.div
            key="checkin"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex items-center justify-center p-6 gradient-calm"
          >
            <EmotionalCheckin
              onComplete={handleCheckinComplete}
              onSkip={() => {
                if (focusTask) setView("focus");
                else setView("dashboard");
              }}
            />
          </motion.div>
        )}

        {view === "breakdown" && (
          <motion.div
            key="breakdown"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex items-center justify-center p-6 gradient-calm"
          >
            <TaskBreakdown
              mood={currentMood}
              onClose={() => {
                refreshUser();
                setView("dashboard");
              }}
            />
          </motion.div>
        )}

        {view === "focus" && focusTask && (
          <FocusMode
            key="focus"
            task={focusTask}
            onComplete={handleFocusComplete}
            onExit={() => setView("dashboard")}
          />
        )}

        {view === "panic" && (
          <motion.div
            key="panic"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex items-center justify-center p-6 gradient-calm"
          >
            <PanicMode onClose={() => { refreshUser(); setView("dashboard"); }} />
          </motion.div>
        )}

        {view === "reflection" && completedTask && (
          <motion.div
            key="reflection"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex items-center justify-center p-6 gradient-calm"
          >
            <Reflection
              taskTitle={completedTask.title}
              xpEarned={completedTask.xp_reward}
              onComplete={handleReflectionComplete}
              onSkip={handleReflectionComplete}
            />
          </motion.div>
        )}

        {view === "dashboard" && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen gradient-calm"
          >
            {/* Header */}
            <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-black/[0.04]">
              <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <img
                    src="/momentum.png"
                    alt="Momentum"
                    className="w-7 h-7 rounded-lg hover:scale-105 transition-transform duration-300"
                  />
                  <span className="font-semibold text-[15px]">Momentum</span>
                  <SyncBadge isOnline={isOnline} hasSupabase={isSupabaseConfigured()} />
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePanic}
                    className="gap-1.5 text-xs border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                  >
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Panic Mode
                  </Button>
                  <Button variant="ghost" size="icon" onClick={handleLogout} className="text-muted-foreground h-8 w-8">
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </header>

            {/* Dashboard */}
            <Dashboard
              user={user}
              onStartFocus={handleStartFocus}
              onBreakdown={handleBreakdown}
              onRefresh={refreshUser}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
