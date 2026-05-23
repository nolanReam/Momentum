"use client";

import { motion } from "framer-motion";
import { Star, Zap } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { getXPForLevel } from "@/lib/store";

interface XPCardProps {
  xp: number;
  level: number;
}

export function XPCard({ xp, level }: XPCardProps) {
  const { current, needed, progress } = getXPForLevel(level);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="glass rounded-2xl p-6 hover:shadow-glow transition-all duration-300"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Level {level}</p>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-4xl font-bold text-gradient">{xp}</span>
            <span className="text-sm text-muted-foreground">XP</span>
          </div>
        </div>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="p-3 rounded-xl bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30"
        >
          <Star className="h-8 w-8 text-purple-500 fill-purple-200" />
        </motion.div>
      </div>
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Level {level + 1}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <Zap className="h-3 w-3 text-primary" />
          {needed - current} XP to next level
        </p>
      </div>
    </motion.div>
  );
}
