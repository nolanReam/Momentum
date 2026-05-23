"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Plus, Settings as SettingsIcon } from "lucide-react";
import { StreakCard } from "./streak-card";
import { XPCard } from "./xp-card";
import { TaskList } from "./task-list";
import { MotivationCard } from "./motivation-card";
import { QuickAddTask } from "@/components/quick-add-task";
import { Button } from "@/components/ui/button";
import { getTasks } from "@/lib/store";
import { UserProfile, Task } from "@/lib/types";
import { getGreeting } from "@/lib/utils";

interface DashboardProps {
  user: UserProfile;
  onStartFocus: (task: Task) => void;
  onBreakdown: () => void;
  onSettings: () => void;
  onRefresh: () => void;
}

export function Dashboard({ user, onStartFocus, onBreakdown, onSettings, onRefresh }: DashboardProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  useEffect(() => {
    setTasks(getTasks());
  }, []);

  const refreshTasks = () => {
    setTasks(getTasks());
    onRefresh();
  };

  const pendingCount = tasks.filter((t) => t.status !== "completed").length;

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Greeting */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">
              {getGreeting()}, {user.name}
            </h1>
            <p className="text-muted-foreground mt-1 text-[15px]">
              {pendingCount === 0
                ? "No tasks yet. Ready to break something down?"
                : pendingCount === 1
                  ? "1 task waiting. You got this."
                  : `${pendingCount} tasks waiting. One step at a time.`}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onSettings}
            className="text-muted-foreground h-9 w-9"
          >
            <SettingsIcon className="h-4 w-4" />
          </Button>
        </div>
      </motion.div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <StreakCard streak={user.streak} longestStreak={user.longestStreak} />
        <XPCard xp={user.xp} level={user.level} />
      </div>

      {/* Motivation */}
      <div className="mb-8">
        <MotivationCard userName={user.name} />
      </div>

      {/* Quick Actions — two distinct flows */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex flex-wrap gap-3 mb-6"
      >
        <Button
          onClick={onBreakdown}
          className="gap-2 gradient-primary text-white shadow-glow hover:opacity-90 transition-opacity"
        >
          <Sparkles className="h-4 w-4" />
          AI Breakdown
        </Button>
        <Button
          variant="outline"
          onClick={() => setShowQuickAdd(!showQuickAdd)}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Quick Add
        </Button>
      </motion.div>

      {/* Quick Add Form (inline) */}
      <AnimatePresence>
        {showQuickAdd && (
          <QuickAddTask
            onClose={() => setShowQuickAdd(false)}
            onAdded={refreshTasks}
          />
        )}
      </AnimatePresence>

      {/* Tasks */}
      <TaskList
        tasks={tasks}
        onStartFocus={onStartFocus}
        onRefresh={refreshTasks}
      />
    </main>
  );
}
