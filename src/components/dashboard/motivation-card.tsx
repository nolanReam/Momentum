"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, RefreshCw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const messages = [
  "You don't have to do it all. Just start with one small step.",
  "Progress over perfection. Every minute counts.",
  "The hardest part is starting. You've already done that by being here.",
  "Small consistent actions beat big irregular ones every time.",
  "You're building momentum. Each task completed is proof you can do this.",
  "It's okay to start small. Tiny wins build big confidence.",
  "Your future self will thank you for starting today.",
  "You don't need to feel ready. You just need to begin.",
  "Done is better than perfect. Let go of the pressure.",
  "One step. That's all. Just one step forward.",
];

interface MotivationCardProps {
  userName: string;
}

export function MotivationCard({ userName }: MotivationCardProps) {
  const [messageIndex, setMessageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setMessageIndex(Math.floor(Math.random() * messages.length));
  }, []);

  const refreshMessage = async () => {
    setIsLoading(true);
    // Try API first, fall back to local messages
    try {
      const res = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mood: undefined, streak: undefined, task: undefined }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.message) {
          setMessageIndex(-1); // Use custom message
          setIsLoading(false);
          return;
        }
      }
    } catch {}
    // Fallback
    setMessageIndex((prev) => (prev + 1) % messages.length);
    setIsLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.25 }}
      className="glass rounded-2xl p-6 border-l-4 border-l-primary/50"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-xs font-medium text-primary">Daily Nudge</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-primary"
          onClick={refreshMessage}
          disabled={isLoading}
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
        </Button>
      </div>
      <AnimatePresence mode="wait">
        <motion.p
          key={messageIndex}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.3 }}
          className="mt-3 text-sm leading-relaxed text-foreground/80"
        >
          {messages[messageIndex >= 0 ? messageIndex : 0]}
        </motion.p>
      </AnimatePresence>
    </motion.div>
  );
}
