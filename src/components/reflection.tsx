"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Star, Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ReflectionProps {
  taskTitle: string;
  xpEarned: number;
  onComplete: () => void;
  onSkip: () => void;
}

export function Reflection({ taskTitle, xpEarned, onComplete, onSkip }: ReflectionProps) {
  const [step, setStep] = useState(0);
  const [difficulty, setDifficulty] = useState(0);
  const [confidence, setConfidence] = useState(0);
  const [notes, setNotes] = useState("");
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleDifficulty = (level: number) => {
    setDifficulty(level);
    setStep(1);
  };

  const handleConfidence = (level: number) => {
    setConfidence(level);
    setStep(2);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/reflection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskTitle, difficulty, confidence, notes }),
      });
      if (res.ok) {
        const data = await res.json();
        setAiResponse(data.encouragement || data.feedback);
      }
    } catch {}
    setIsLoading(false);
    setStep(3);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-lg mx-auto"
    >
      <div className="glass-strong rounded-2xl shadow-glow-lg overflow-hidden">
        {/* Success header */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 gradient-primary opacity-90" />
          <div className="relative p-8 text-center text-white">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            >
              <Star className="h-14 w-14 mx-auto mb-3 fill-white/30" />
            </motion.div>
            <h3 className="text-xl font-bold">Task Completed!</h3>
            <p className="text-sm text-white/70 mt-1 max-w-xs mx-auto">{taskTitle}</p>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded-full bg-white/20 text-sm font-bold"
            >
              <Sparkles className="h-3.5 w-3.5" />
              +{xpEarned} XP
            </motion.div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {step >= 0 && step < 3 && (
            <>
              {/* Difficulty */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-2"
              >
                <p className="text-sm font-medium">How difficult did that feel?</p>
                <div className="flex gap-2">
                  {[
                    { level: 1, label: "Easy" },
                    { level: 2, label: "Mild" },
                    { level: 3, label: "Medium" },
                    { level: 4, label: "Hard" },
                    { level: 5, label: "Tough" },
                  ].map(({ level, label }) => (
                    <button
                      key={level}
                      onClick={() => handleDifficulty(level)}
                      className={cn(
                        "flex-1 py-2 rounded-xl border text-xs font-medium transition-all",
                        difficulty === level
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-transparent bg-white/50 dark:bg-white/5 hover:border-primary/30"
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </motion.div>

              {/* Confidence */}
              {step >= 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-2"
                >
                  <p className="text-sm font-medium">How confident do you feel?</p>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <button
                        key={level}
                        onClick={() => handleConfidence(level)}
                        className={cn(
                          "flex-1 py-2 rounded-xl border text-xs font-medium transition-all",
                          confidence === level
                            ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                            : "border-transparent bg-white/50 dark:bg-white/5 hover:border-emerald-300"
                        )}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-muted-foreground text-center">
                    1 = not sure → 5 = totally got it
                  </p>
                </motion.div>
              )}

              {/* Notes */}
              {step >= 2 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-2"
                >
                  <p className="text-sm font-medium">Anything to note? (optional)</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                      placeholder="e.g., Need to review section 3 again..."
                      className="flex-1 px-4 py-2.5 rounded-xl border bg-white/50 dark:bg-white/5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                    <Button onClick={handleSubmit} disabled={isLoading} className="gradient-primary text-white">
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              )}
            </>
          )}

          {/* AI Response */}
          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-4"
            >
              {aiResponse && (
                <p className="text-sm text-foreground/80 leading-relaxed p-4 rounded-xl bg-primary/5 border border-primary/10">
                  ✨ {aiResponse}
                </p>
              )}
              <p className="text-sm text-muted-foreground">
                Every session makes the next one easier.
              </p>
              <Button onClick={onComplete} className="gradient-primary text-white gap-2">
                Back to Dashboard
              </Button>
            </motion.div>
          )}

          {step < 3 && (
            <div className="flex justify-center">
              <Button variant="ghost" size="sm" onClick={onSkip} className="text-xs text-muted-foreground">
                Skip reflection
              </Button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
