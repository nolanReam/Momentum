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
import { Settings } from "@/components/settings";
import { MomentumRecovery } from "@/components/momentum-recovery";
import { AIDevPanel } from "@/components/ai-dev-panel";
import { getUser, signOut, fullSync, processSyncQueue } from "@/lib/store";
import { isSupabaseConfigured } from "@/lib/supabase";
import { UserProfile, Task, Mood } from "@/lib/types";

interface AppShellProps {
  onLogout: () => void;
}

type View = "dashboard" | "checkin" | "breakdown" | "focus" | "panic" | "reflection" | "settings" | "recovery";

export function AppShell({ onLogout }: AppShellProps) {
  const [view, setView] = useState<View>("dashboard");
  const [user, setUser] = useState<UserProfile | null>(null);
  const [focusTask, setFocusTask] = useState<Task | null>(null);
  const [completedTask, setCompletedTask] = useState<Task | null>(null);
  const [currentMood, setCurrentMood] = useState<Mood | undefined>();
  const [isOnline, setIsOnline] = useState(true);
  const [daysAway, setDaysAway] = useState(0);

  useEffect(() => {
    const u = getUser();
    setUser(u);

    // Check if user has been away (momentum recovery)
    if (u) {
      const lastActive = new Date(u.lastActive);
      const now = new Date();
      const diffDays = Math.floor((now.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays >= 3) {
        setDaysAway(diffDays);
        setView("recovery");
      }
    }

    // Track online status
    setIsOnline(typeof navigator !== "undefined" ? navigator.onLine : true);
    const handleOnline = () => {
      setIsOnline(true);
      console.log("[Momentum] Back online — syncing...");
      if (isSupabaseConfigured()) fullSync();
    };
    const handleOffline = () => {
      setIsOnline(false);
      console.log("[Momentum] Gone offline — using local storage");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    if (isSupabaseConfigured()) processSyncQueue();

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
    if (focusTask) setView("focus");
    else setView("dashboard");
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

  const handleLogout = async () => {
    await signOut();
    onLogout();
  };

  if (!user) return null;

  return (
    <div className="min-h-screen">
      {/* AI Dev Panel (floating) */}
      <AIDevPanel />

      <AnimatePresence mode="wait">
        {view === "recovery" && (
          <MomentumRecovery
            key="recovery"
            daysAway={daysAway}
            userName={user.name}
            onContinue={() => setView("dashboard")}
          />
        )}

        {view === "settings" && (
          <Settings
            key="settings"
            onClose={() => setView("dashboard")}
            onLogout={handleLogout}
          />
        )}

        {view === "checkin" && (
          <motion.div
            key="checkin"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex items-center justify-center p-6"
            style={{ background: "linear-gradient(165deg, #f8f7ff 0%, #f3f1ff 30%, #eef9fb 70%, #f7fafb 100%)" }}
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
            className="min-h-screen flex items-center justify-center p-6"
            style={{ background: "linear-gradient(165deg, #f8f7ff 0%, #f3f1ff 30%, #eef9fb 70%, #f7fafb 100%)" }}
          >
            <TaskBreakdown
              mood={currentMood}
              onClose={() => { refreshUser(); setView("dashboard"); }}
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
            className="min-h-screen flex items-center justify-center p-6"
            style={{ background: "linear-gradient(165deg, #f8f7ff 0%, #f3f1ff 30%, #eef9fb 70%, #f7fafb 100%)" }}
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
            className="min-h-screen flex items-center justify-center p-6"
            style={{ background: "linear-gradient(165deg, #f8f7ff 0%, #f3f1ff 30%, #eef9fb 70%, #f7fafb 100%)" }}
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
            className="min-h-screen"
            style={{ background: "linear-gradient(165deg, #f8f7ff 0%, #f3f1ff 30%, #eef9fb 70%, #f7fafb 100%)" }}
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
                    onClick={() => setView("panic")}
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

            <Dashboard
              user={user}
              onStartFocus={handleStartFocus}
              onBreakdown={() => setView("breakdown")}
              onSettings={() => setView("settings")}
              onRefresh={refreshUser}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
