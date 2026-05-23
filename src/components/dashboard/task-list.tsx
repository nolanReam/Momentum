"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Circle, Clock, Play, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Task } from "@/lib/types";
import { cn } from "@/lib/utils";
import { completeTask, deleteTask, getTasks, addXP } from "@/lib/store";
import confetti from "canvas-confetti";

interface TaskListProps {
  tasks: Task[];
  onStartFocus: (task: Task) => void;
  onRefresh: () => void;
}

const priorityColors = {
  low: "border-l-emerald-400",
  medium: "border-l-amber-400",
  high: "border-l-rose-400",
};

export function TaskList({ tasks, onStartFocus, onRefresh }: TaskListProps) {
  const pendingTasks = tasks.filter((t) => t.status !== "completed");
  const completedTasks = tasks.filter((t) => t.status === "completed");

  const handleComplete = (task: Task) => {
    completeTask(task.id);
    addXP(task.xp_reward);
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.7 },
      colors: ["#7c3aed", "#06b6d4", "#10b981", "#f59e0b"],
    });
    onRefresh();
  };

  const handleDelete = (taskId: string) => {
    deleteTask(taskId);
    onRefresh();
  };

  if (tasks.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass rounded-2xl p-12 text-center"
      >
        <div className="text-4xl mb-4">🌱</div>
        <h3 className="font-semibold mb-2">No tasks yet</h3>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          Use &quot;Break Down a Task&quot; above to get started. Enter something like
          &quot;Study for chemistry final&quot; and let the AI help you plan.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="space-y-6"
    >
      {/* Pending tasks */}
      {pendingTasks.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-muted-foreground mb-3 px-1">
            Active Tasks ({pendingTasks.length})
          </h2>
          <div className="space-y-2">
            {pendingTasks.map((task, index) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  "glass rounded-xl p-4 border-l-4 hover:shadow-glow transition-all duration-300 group",
                  priorityColors[task.priority]
                )}
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleComplete(task)}
                    className="flex-shrink-0 text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Circle className="h-5 w-5" />
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{task.title}</p>
                    {task.description && (
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {task.description}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-1.5">
                      {task.estimated_minutes && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {task.estimated_minutes} min
                        </span>
                      )}
                      <span className="text-xs text-primary/70 font-medium">
                        +{task.xp_reward} XP
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-red-500"
                      onClick={() => handleDelete(task.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-primary"
                      onClick={() => onStartFocus(task)}
                    >
                      <Play className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Completed tasks */}
      {completedTasks.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-muted-foreground mb-3 px-1">
            Completed ({completedTasks.length})
          </h2>
          <div className="space-y-2">
            {completedTasks.slice(0, 5).map((task) => (
              <div
                key={task.id}
                className="glass rounded-xl p-3 opacity-60"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                  <p className="text-sm line-through text-muted-foreground truncate">
                    {task.title}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
