"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Clock, Loader2, Send, CheckCircle2, ArrowLeft, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { addTask } from "@/lib/store";
import { Mood } from "@/lib/types";
import { cn } from "@/lib/utils";

interface TaskStep {
  title: string;
  description: string;
  estimated_minutes: number;
  priority: "low" | "medium" | "high";
  tip: string;
}

interface TaskBreakdownProps {
  mood?: Mood;
  onClose: () => void;
}

export function TaskBreakdown({ mood, onClose }: TaskBreakdownProps) {
  const [taskInput, setTaskInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [steps, setSteps] = useState<TaskStep[] | null>(null);
  const [encouragement, setEncouragement] = useState("");
  const [addedSteps, setAddedSteps] = useState<Set<number>>(new Set());

  const handleBreakdown = async () => {
    if (!taskInput.trim()) return;
    setIsLoading(true);

    try {
      const res = await fetch("/api/breakdown", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task: taskInput, mood, energyLevel: 3 }),
      });

      if (res.ok) {
        const data = await res.json();
        setSteps(data.steps);
        setEncouragement(data.encouragement || "");
      }
    } catch {
      // Fallback handled by API
    }

    setIsLoading(false);
  };

  const handleAddStep = (index: number, step: TaskStep) => {
    addTask({
      title: step.title,
      description: step.description,
      status: "pending",
      priority: step.priority,
      estimated_minutes: step.estimated_minutes,
      xp_reward: Math.max(5, Math.floor(step.estimated_minutes / 2)),
      parent_task_id: null,
      order_index: index,
    });
    setAddedSteps((prev) => new Set([...prev, index]));
  };

  const handleAddAll = () => {
    if (!steps) return;
    steps.forEach((step, index) => {
      if (!addedSteps.has(index)) {
        handleAddStep(index, step);
      }
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl mx-auto"
    >
      <div className="glass-strong rounded-2xl shadow-glow-lg overflow-hidden">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-border/50">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-primary/10">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-bold text-lg">AI Task Breakdown</h2>
              <p className="text-xs text-muted-foreground">
                Tell me what feels overwhelming. I&apos;ll make it manageable.
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {/* Input */}
          {!steps && (
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={taskInput}
                  onChange={(e) => setTaskInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !isLoading && handleBreakdown()}
                  placeholder='e.g., "Study for chemistry final" or "Write my thesis introduction"'
                  className="flex-1 px-4 py-3 rounded-xl border bg-white/50 dark:bg-white/5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 backdrop-blur-sm"
                  autoFocus
                  disabled={isLoading}
                />
                <Button
                  onClick={handleBreakdown}
                  disabled={isLoading || !taskInput.trim()}
                  className="px-4 gradient-primary text-white"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                I&apos;ll break this into small, achievable steps — starting with quick wins.
              </p>
            </div>
          )}

          {/* Loading state */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center py-12 gap-4"
            >
              <div className="relative">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <Sparkles className="h-4 w-4 text-primary absolute -top-1 -right-1 animate-pulse" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium">Breaking this down...</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Finding quick wins and manageable steps
                </p>
              </div>
            </motion.div>
          )}

          {/* Results */}
          {steps && (
            <div className="space-y-4">
              {/* Action bar */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => { setSteps(null); setAddedSteps(new Set()); setTaskInput(""); }}
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  New task
                </button>
                <Button
                  size="sm"
                  onClick={handleAddAll}
                  className="gap-1.5 gradient-primary text-white text-xs"
                >
                  <Plus className="h-3 w-3" />
                  Add All to Tasks
                </Button>
              </div>

              {/* Steps list */}
              <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                {steps.map((step, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={cn(
                      "rounded-xl border p-4 transition-all duration-300",
                      addedSteps.has(index)
                        ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800"
                        : "bg-white/50 dark:bg-white/5 hover:shadow-sm hover:border-primary/30"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        {addedSteps.has(index) ? (
                          <CheckCircle2 className="h-5 w-5 text-emerald-500 mt-0.5" />
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                            <span className="text-[10px] font-bold text-primary">{index + 1}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium">{step.title}</h4>
                        <p className="text-xs text-muted-foreground mt-1">{step.description}</p>
                        <p className="text-xs text-primary/70 mt-1.5 italic">💡 {step.tip}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {step.estimated_minutes} min
                          </span>
                          {!addedSteps.has(index) && (
                            <button
                              onClick={() => handleAddStep(index, step)}
                              className="text-xs text-primary hover:text-primary/80 font-medium"
                            >
                              + Add
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Encouragement */}
              {encouragement && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: steps.length * 0.1 + 0.3 }}
                  className="text-center p-4 rounded-xl bg-primary/5 border border-primary/10"
                >
                  <p className="text-sm text-foreground/70">✨ {encouragement}</p>
                </motion.div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border/50 flex justify-end">
          <Button variant="ghost" size="sm" onClick={onClose}>
            {steps && addedSteps.size > 0 ? "Done" : "Close"}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
