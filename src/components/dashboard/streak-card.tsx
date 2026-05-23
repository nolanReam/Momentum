"use client";

import { motion } from "framer-motion";
import { Flame, Trophy } from "lucide-react";

interface StreakCardProps {
  streak: number;
  longestStreak: number;
}

export function StreakCard({ streak, longestStreak }: StreakCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="glass rounded-2xl p-6 hover:shadow-glow transition-all duration-300"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Daily Streak</p>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-4xl font-bold text-gradient-warm bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
              {streak}
            </span>
            <span className="text-sm text-muted-foreground">days</span>
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
            <Trophy className="h-3 w-3 text-amber-500" />
            <span>Best: {longestStreak} days</span>
          </div>
        </div>
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            rotate: [0, 3, -3, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: "reverse",
          }}
          className="p-3 rounded-xl bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30"
        >
          <Flame className="h-8 w-8 text-orange-500" />
        </motion.div>
      </div>
    </motion.div>
  );
}
