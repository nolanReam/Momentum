"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Loader2, Clock, ArrowLeft, CheckCircle2, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusIndicator } from "@/components/status-indicator";
import { addTask } from "@/lib/store";
import { cn } from "@/lib/utils";

interface PanicStep {
  title: string;
  duration: string;
  description: string;
  priority: "critical" | "important" | "if_time";
}

interface PanicPlan {
  plan: PanicStep[];
  reassurance: string;
  realistic_assessment: string;
}

interface PanicModeProps {
  onClose: () => void;
}

const priorityConfig: Record<string, { label: string; color: string }> = {
  critical: { label: "Do First", color: "border-l-rose-400 bg-rose-950/40" },
  important: { label: "Important", color: "border-l-amber-400 bg-amber-950/40" },
  if_time: { label: "If Time", color: "border-l-blue-400 bg-blue-950/40" },
};

export function PanicMode({ onClose }: PanicModeProps) {
  const [step, setStep] = useState(0);
  const [assignment, setAssignment] = useState("");
  const [deadline, setDeadline] = useState("");
  const [currentProgress, setCurrentProgress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [plan, setPlan] = useState<PanicPlan | null>(null);
  const [addedSteps, setAddedSteps] = useState<Set<number>>(new Set());
  const [aiSource, setAiSource] = useState<"groq" | "fallback" | null>(null);

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/panic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignment, deadline, currentProgress }),
      });
      if (res.ok) {
        const data = await res.json();
        setPlan(data);
        setAiSource(data.source || "fallback");
        setStep(1);
        console.log("[PanicMode] Received response:", { source: data.source, steps: data.plan?.length });
      }
    } catch (e) {
      console.error(e);
    }
    setIsLoading(false);
  };

  const handleAddStep = (index: number, panicStep: PanicStep) => {
    const priorityMap: Record<string, "high" | "medium" | "low"> = {
      critical: "high",
      important: "medium",
      if_time: "low",
    };
    addTask({
      title: panicStep.title,
      description: panicStep.description,
      status: "pending",
      priority: priorityMap[panicStep.priority] || "medium",
      estimated_minutes: parseInt(panicStep.duration) || 15,
      xp_reward: panicStep.priority === "critical" ? 20 : 10,
      parent_task_id: null,
      order_index: index,
    });
    setAddedSteps((prev) => new Set([...prev, index]));
  };

  const handleAddAll = () => {
    if (!plan) return;
    plan.plan.forEach((s, i) => {
      if (!addedSteps.has(i)) handleAddStep(i, s);
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl mx-auto"
    >
      <div className="bg-card rounded-2xl border border-border shadow-glow-lg overflow-hidden">
        <div className="p-6 pb-4 border-b border-border bg-rose-950/30">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-rose-900/50">
              <AlertTriangle className="h-5 w-5 text-rose-600" />
            </div>
            <div>
              <h2 className="font-bold text-lg">Panic Mode</h2>
              <p className="text-xs text-muted-foreground">
                Breathe. Let&apos;s figure out what&apos;s actually possible.
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div
                key="input"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="flex items-start gap-2 p-3 rounded-xl bg-blue-950/30 border border-blue-800">
                  <Shield className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-blue-300">
                    You&apos;re not the first student to be here. Let&apos;s focus on what&apos;s possible, not what&apos;s perfect.
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">What&apos;s the assignment?</label>
                    <input
                      type="text"
                      value={assignment}
                      onChange={(e) => setAssignment(e.target.value)}
                      placeholder="e.g., 10-page research paper on climate policy"
                      className="w-full px-4 py-3 rounded-xl border bg-white/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">When is it due?</label>
                    <input
                      type="text"
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                      placeholder="e.g., Tomorrow at 11:59 PM or In 6 hours"
                      className="w-full px-4 py-3 rounded-xl border bg-white/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Where are you at right now?</label>
                    <input
                      type="text"
                      value={currentProgress}
                      onChange={(e) => setCurrentProgress(e.target.value)}
                      placeholder="e.g., Haven't started or Have an outline"
                      className="w-full px-4 py-3 rounded-xl border bg-white/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                </div>

                <Button
                  onClick={handleGenerate}
                  disabled={isLoading || !assignment.trim() || !deadline.trim()}
                  className="w-full gap-2 gradient-primary text-white py-6"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating your recovery plan...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      Generate Recovery Plan
                    </span>
                  )}
                </Button>
              </motion.div>
            )}

            {step === 1 && plan && (
              <motion.div
                key="plan"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-800">
                  <p className="text-sm text-emerald-300 font-medium">
                    {plan.reassurance}
                  </p>
                  <p className="text-xs text-emerald-400/70 mt-1">
                    {plan.realistic_assessment}
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setStep(0)}
                      className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" />
                      Back
                    </button>
                    {aiSource && (
                      <StatusIndicator type={aiSource === "groq" ? "ai-generated" : "fallback"} />
                    )}
                  </div>
                  <Button size="sm" onClick={handleAddAll} className="text-xs gap-1">
                    Add All
                  </Button>
                </div>

                <div className="space-y-3 max-h-[45vh] overflow-y-auto pr-1">
                  {plan.plan.map((panicStep, index) => {
                    const config = priorityConfig[panicStep.priority] || priorityConfig.important;
                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={cn(
                          "rounded-xl border-l-4 p-4 transition-all",
                          addedSteps.has(index) ? "bg-emerald-950/40 border-l-emerald-400" : config.color
                        )}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="text-sm font-medium">{panicStep.title}</h4>
                              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-black/5 text-muted-foreground">
                                {config.label}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground">{panicStep.description}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">{panicStep.duration}</span>
                            </div>
                          </div>
                          {addedSteps.has(index) ? (
                            <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                          ) : (
                            <button
                              onClick={() => handleAddStep(index, panicStep)}
                              className="text-xs text-primary hover:text-primary/80 font-medium flex-shrink-0"
                            >
                              + Add
                            </button>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="px-6 py-4 border-t border-border/50 flex justify-end">
          <Button variant="ghost" size="sm" onClick={onClose}>
            {plan && addedSteps.size > 0 ? "Done" : "Close"}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
