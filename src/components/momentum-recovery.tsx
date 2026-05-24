"use client";

import { motion } from "framer-motion";
import { Heart, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MomentumRecoveryProps {
  daysAway: number;
  userName: string;
  onContinue: () => void;
}

export function MomentumRecovery({ daysAway, userName, onContinue }: MomentumRecoveryProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex items-center justify-center p-6 bg-background"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-md w-full text-center"
      >
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
          className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6"
        >
          <Heart className="h-8 w-8 text-primary" />
        </motion.div>

        <h1 className="text-2xl font-bold mb-3">
          Welcome back, {userName}
        </h1>

        <p className="text-muted-foreground leading-relaxed mb-2">
          {daysAway <= 3 && "It's been a couple days. No worries — let's pick up where you left off."}
          {daysAway > 3 && daysAway <= 7 && "It's been a bit. Life happens. The important thing is you're here now."}
          {daysAway > 7 && "It's been a while, and that's completely okay. There's no guilt here — just a fresh start whenever you're ready."}
        </p>

        <p className="text-sm text-muted-foreground/70 mb-8">
          Let&apos;s restart small. One tiny thing today is enough.
        </p>

        <Button
          onClick={onContinue}
          className="gradient-primary text-white px-8 py-5 rounded-2xl shadow-glow gap-2"
        >
          Let&apos;s go
          <ArrowRight className="h-4 w-4" />
        </Button>
      </motion.div>
    </motion.div>
  );
}
