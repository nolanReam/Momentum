"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Mood } from "@/lib/types";
import { saveCheckin } from "@/lib/store";
import { cn } from "@/lib/utils";

interface EmotionalCheckinProps {
  onComplete: (mood: Mood) => void;
  onSkip: () => void;
}

const moods: { value: Mood; label: string; emoji: string; description: string; color: string }[] = [
  { value: "anxious", label: "Anxious", emoji: "😰", description: "Worried or nervous", color: "border-blue-300 bg-blue-50" },
  { value: "overwhelmed", label: "Overwhelmed", emoji: "🌊", description: "Too much going on", color: "border-purple-300 bg-purple-50" },
  { value: "tired", label: "Tired", emoji: "😴", description: "Low energy", color: "border-gray-300 bg-gray-50" },
  { value: "neutral", label: "Neutral", emoji: "😐", description: "Feeling okay", color: "border-yellow-300 bg-yellow-50" },
  { value: "motivated", label: "Motivated", emoji: "💪", description: "Ready to work", color: "border-green-300 bg-green-50" },
  { value: "energized", label: "Energized", emoji: "⚡", description: "Feeling great", color: "border-orange-300 bg-orange-50" },
];

const hardestParts = [
  "Getting started is the hardest",
  "I don\u2019t know where to begin",
  "It feels like too much",
  "I\u2019m afraid of doing it wrong",
  "I can\u2019t focus today",
  "I\u2019m not sure it matters",
];

export function EmotionalCheckin({ onComplete, onSkip }: EmotionalCheckinProps) {
  const [step, setStep] = useState(0);
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [energyLevel, setEnergyLevel] = useState(3);

  const handleMoodSelect = (mood: Mood) => {
    setSelectedMood(mood);
    setStep(1);
  };

  const handleEnergySelect = (level: number) => {
    setEnergyLevel(level);
    setStep(2);
  };

  const handleComplete = (hardestPart: string) => {
    if (selectedMood) {
      saveCheckin({
        mood: selectedMood,
        energy_level: energyLevel,
        hardest_part: hardestPart,
        timestamp: new Date().toISOString(),
      });
      onComplete(selectedMood);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-lg mx-auto"
    >
      <div className="glass-strong rounded-2xl p-8 shadow-glow">
        <div className="text-center mb-6">
          <img src="/momentum.svg" alt="" className="w-10 h-10 mx-auto mb-3" />
          <h2 className="text-xl font-bold">How are you feeling?</h2>
          <p className="text-sm text-muted-foreground mt-1">
            This helps me adapt. No judgment here.
          </p>
        </div>

        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="mood"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="grid grid-cols-2 gap-3"
            >
              {moods.map((mood) => (
                <button
                  key={mood.value}
                  onClick={() => handleMoodSelect(mood.value)}
                  className={cn(
                    "flex flex-col items-center gap-1.5 p-4 rounded-xl border-2 border-transparent transition-all duration-200 hover:scale-[1.02]",
                    selectedMood === mood.value ? mood.color : "bg-white/50 dark:bg-white/5 hover:bg-white/80"
                  )}
                >
                  <span className="text-2xl">{mood.emoji}</span>
                  <span className="text-sm font-medium">{mood.label}</span>
                  <span className="text-xs text-muted-foreground">{mood.description}</span>
                </button>
              ))}
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="energy"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <p className="text-center text-sm text-muted-foreground">
                How&apos;s your energy right now?
              </p>
              <div className="flex justify-center gap-3">
                {[1, 2, 3, 4, 5].map((level) => (
                  <button
                    key={level}
                    onClick={() => handleEnergySelect(level)}
                    className={cn(
                      "w-12 h-12 rounded-full border-2 flex items-center justify-center text-sm font-bold transition-all hover:scale-110",
                      level <= energyLevel
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-muted text-muted-foreground"
                    )}
                  >
                    {level}
                  </button>
                ))}
              </div>
              <p className="text-center text-xs text-muted-foreground">
                1 = barely awake → 5 = full power
              </p>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="hardest"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-3"
            >
              <p className="text-center text-sm text-muted-foreground">
                What feels hardest right now?
              </p>
              <div className="space-y-2">
                {hardestParts.map((option) => (
                  <button
                    key={option}
                    onClick={() => handleComplete(option)}
                    className="w-full text-left p-3 rounded-xl border border-transparent bg-white/50 dark:bg-white/5 hover:border-primary/30 hover:bg-primary/5 transition-all text-sm"
                  >
                    {option}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-6 flex justify-center">
          <Button variant="ghost" size="sm" onClick={onSkip} className="text-muted-foreground text-xs">
            Skip for now
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
