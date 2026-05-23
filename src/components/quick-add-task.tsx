"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, X, Calendar, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { addTask } from "@/lib/store";
import { TaskPriority } from "@/lib/types";
import { cn } from "@/lib/utils";

interface QuickAddTaskProps {
  onClose: () => void;
  onAdded: () => void;
}

const priorities: { value: TaskPriority; label: string; color: string }[] = [
  { value: "low", label: "Low", color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
  { value: "medium", label: "Medium", color: "text-amber-600 bg-amber-50 border-amber-200" },
  { value: "high", label: "High", color: "text-rose-600 bg-rose-50 border-rose-200" },
];

export function QuickAddTask({ onClose, onAdded }: QuickAddTaskProps) {
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [estimatedMinutes, setEstimatedMinutes] = useState("");

  const handleSubmit = () => {
    if (!title.trim()) return;

    addTask({
      title: title.trim(),
      description: null,
      status: "pending",
      priority,
      estimated_minutes: estimatedMinutes ? parseInt(estimatedMinutes) : null,
      xp_reward: priority === "high" ? 20 : priority === "medium" ? 15 : 10,
      parent_task_id: null,
      order_index: Date.now(),
    });

    console.log("[Momentum] Quick add task:", { title, priority, estimatedMinutes });
    onAdded();
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10, height: 0 }}
      animate={{ opacity: 1, y: 0, height: "auto" }}
      exit={{ opacity: 0, y: -10, height: 0 }}
      className="bg-white rounded-2xl border border-black/[0.06] p-5 shadow-glow mb-4"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold">Quick Add</h3>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-3">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder="What do you need to do?"
          className="w-full px-4 py-2.5 rounded-xl border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          autoFocus
        />

        <div className="flex items-center gap-3">
          {/* Priority */}
          <div className="flex items-center gap-1.5">
            <Flag className="h-3.5 w-3.5 text-muted-foreground" />
            <div className="flex gap-1">
              {priorities.map((p) => (
                <button
                  key={p.value}
                  onClick={() => setPriority(p.value)}
                  className={cn(
                    "px-2 py-0.5 rounded-md text-[11px] font-medium border transition-all",
                    priority === p.value ? p.color : "text-muted-foreground bg-transparent border-transparent hover:bg-muted"
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Time estimate */}
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="number"
              value={estimatedMinutes}
              onChange={(e) => setEstimatedMinutes(e.target.value)}
              placeholder="min"
              className="w-14 px-2 py-0.5 rounded-md border text-[11px] text-center focus:outline-none focus:ring-1 focus:ring-primary/30"
            />
          </div>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={!title.trim()}
          size="sm"
          className="w-full gradient-primary text-white gap-1.5"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Task
        </Button>
      </div>
    </motion.div>
  );
}
