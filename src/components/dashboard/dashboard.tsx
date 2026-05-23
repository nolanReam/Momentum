"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles, Plus } from "lucide-react";
import { StreakCard } from "./streak-card";
import { XPCard } from "./xp-card";
import { TaskList } from "./task-list";
import { MotivationCard } from "./motivation-card";
import { Button } from "@/components/ui/button";
import { getUser, getTasks } from "@/lib/store";
import { UserProfile, Task } from "@/lib/types";
import { getGreeting } from "@/lib/utils";

interface DashboardProps {
  user: UserProfile;
  onStartFocus: (task: Task) => void;
  onBreakdown: () => void;
  onRefresh: () => void;
}

export function Dashboard({ user, onStartFocus, onBreakdown, onRefresh }: DashboardProps) {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    setTasks(getTasks());
  }, []);

  const refreshTasks = () => {
    setTasks(getTasks());
  };

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Greeting */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl sm:text-3xl font-bold">
          {getGreeting()}, {user.name} ✨
        </h1>
        <p className="text-muted-foreground mt-1">
          Let&apos;s make today feel manageable.
        </p>
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

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex flex-wrap gap-3 mb-8"
      >
        <Button
          onClick={onBreakdown}
          className="gap-2 gradient-primary text-white shadow-glow hover:opacity-90 transition-opacity"
        >
          <Sparkles className="h-4 w-4" />
          Break Down a Task
        </Button>
        <Button
          variant="outline"
          onClick={onBreakdown}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Task Manually
        </Button>
      </motion.div>

      {/* Tasks */}
      <TaskList
        tasks={tasks}
        onStartFocus={onStartFocus}
        onRefresh={refreshTasks}
      />
    </main>
  );
}
