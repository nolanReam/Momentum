import { createBrowserClient } from "@supabase/ssr";
import { SupabaseClient } from "@supabase/supabase-js";

// ============================================
// Supabase Client (Browser)
// Returns null if env vars are missing — app falls back to localStorage
// ============================================

let supabaseInstance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (typeof window === "undefined") return null;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key || url === "your_supabase_url_here") {
    return null;
  }

  if (!supabaseInstance) {
    supabaseInstance = createBrowserClient(url, key);
  }

  return supabaseInstance;
}

export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return !!(url && key && url !== "your_supabase_url_here");
}

// ============================================
// Database Types (mirrors schema.sql)
// ============================================
export interface DbProfile {
  id: string;
  name: string;
  xp: number;
  streak: number;
  longest_streak: number;
  level: number;
  last_active: string;
  onboarding_complete: boolean;
  preferences: {
    studyStyle?: string;
    stressLevel?: string;
    academicStruggle?: string;
    currentGoal?: string;
  };
  created_at: string;
  updated_at: string;
}

export interface DbTask {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  status: "pending" | "in_progress" | "completed";
  priority: "low" | "medium" | "high";
  estimated_minutes: number | null;
  xp_reward: number;
  parent_task_id: string | null;
  order_index: number;
  created_at: string;
  completed_at: string | null;
  updated_at: string;
}

export interface DbCheckin {
  id: string;
  user_id: string;
  mood: string;
  energy_level: number;
  hardest_part: string | null;
  created_at: string;
}

export interface DbReflection {
  id: string;
  user_id: string;
  task_id: string | null;
  task_title: string;
  difficulty_felt: number;
  confidence_level: number;
  notes: string | null;
  created_at: string;
}
