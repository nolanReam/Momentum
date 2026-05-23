"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Cloud, WifiOff, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatusIndicatorProps {
  type: "ai-generated" | "saved-cloud" | "offline" | "fallback";
  className?: string;
}

const config = {
  "ai-generated": {
    icon: Sparkles,
    label: "AI Generated",
    color: "text-purple-600 bg-purple-50 border-purple-100",
  },
  "saved-cloud": {
    icon: Cloud,
    label: "Saved to cloud",
    color: "text-emerald-600 bg-emerald-50 border-emerald-100",
  },
  "offline": {
    icon: WifiOff,
    label: "Offline mode",
    color: "text-amber-600 bg-amber-50 border-amber-100",
  },
  "fallback": {
    icon: Check,
    label: "Local response",
    color: "text-slate-500 bg-slate-50 border-slate-100",
  },
};

export function StatusIndicator({ type, className }: StatusIndicatorProps) {
  const { icon: Icon, label, color } = config[type];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-medium",
        color,
        className
      )}
    >
      <Icon className="h-3 w-3" />
      {label}
    </motion.div>
  );
}

// Sync status badge for the dashboard
interface SyncBadgeProps {
  isOnline: boolean;
  hasSupabase: boolean;
  lastSync?: string;
}

export function SyncBadge({ isOnline, hasSupabase, lastSync }: SyncBadgeProps) {
  if (!hasSupabase) return null;

  return (
    <div className={cn(
      "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium",
      isOnline ? "text-emerald-600 bg-emerald-50" : "text-amber-600 bg-amber-50"
    )}>
      {isOnline ? (
        <>
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Synced
        </>
      ) : (
        <>
          <WifiOff className="h-2.5 w-2.5" />
          Offline
        </>
      )}
    </div>
  );
}
