import { getUser, getTasks, getLatestCheckin, getAchievements } from "./store";
import { UserProfile, Task, EmotionalCheckin } from "./types";

/**
 * Centralized AI Context Builder
 * Generates a structured context payload used by all AI features:
 * - Task breakdown
 * - Panic mode
 * - Coaching chat
 * - Reflections
 * - Motivation nudges
 */

export interface AIContext {
  user: {
    name: string;
    level: number;
    xp: number;
    streak: number;
    longestStreak: number;
    preferences: UserProfile["preferences"];
  } | null;
  currentTask: Task | null;
  activeTasks: Task[];
  completedTasksCount: number;
  recentMood: EmotionalCheckin | null;
  timeOfDay: string;
  dayOfWeek: string;
  achievementsUnlocked: number;
  totalAchievements: number;
}

export function buildAIContext(focusTask?: Task | null): AIContext {
  const user = getUser();
  const tasks = getTasks();
  const mood = getLatestCheckin();
  const achievements = getAchievements();

  const hour = new Date().getHours();
  const timeOfDay = hour < 6 ? "late night" : hour < 12 ? "morning" : hour < 17 ? "afternoon" : hour < 21 ? "evening" : "night";
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const dayOfWeek = days[new Date().getDay()];

  const activeTasks = tasks.filter((t) => t.status !== "completed");
  const completedTasks = tasks.filter((t) => t.status === "completed");

  return {
    user: user ? {
      name: user.name,
      level: user.level,
      xp: user.xp,
      streak: user.streak,
      longestStreak: user.longestStreak,
      preferences: user.preferences,
    } : null,
    currentTask: focusTask || activeTasks[0] || null,
    activeTasks,
    completedTasksCount: completedTasks.length,
    recentMood: mood,
    timeOfDay,
    dayOfWeek,
    achievementsUnlocked: achievements.filter((a) => a.unlocked).length,
    totalAchievements: achievements.length,
  };
}

/**
 * Converts AIContext into a system prompt section for the AI
 */
export function contextToPrompt(ctx: AIContext): string {
  const parts: string[] = [];

  if (ctx.user) {
    parts.push(`Student: ${ctx.user.name} (Level ${ctx.user.level}, ${ctx.user.xp} XP, ${ctx.user.streak}-day streak)`);

    if (ctx.user.preferences.studyStyle) {
      const styles: Record<string, string> = {
        "short-bursts": "prefers short 10-15 min study bursts",
        "pomodoro": "uses pomodoro technique (25 min blocks)",
        "deep-work": "prefers deep work sessions (45+ min)",
        "not-sure": "flexible study style",
      };
      parts.push(`Study style: ${styles[ctx.user.preferences.studyStyle] || ctx.user.preferences.studyStyle}`);
    }

    if (ctx.user.preferences.stressLevel) {
      const stress: Record<string, string> = {
        "low": "currently low stress",
        "moderate": "moderately stressed",
        "high": "highly stressed — be extra gentle",
        "crisis": "in crisis mode — use smallest possible steps, maximum reassurance",
      };
      parts.push(`Stress: ${stress[ctx.user.preferences.stressLevel] || ctx.user.preferences.stressLevel}`);
    }

    if (ctx.user.preferences.academicStruggle) {
      const struggles: Record<string, string> = {
        "starting": "biggest struggle is getting started",
        "focusing": "struggles with maintaining focus",
        "overwhelm": "gets overwhelmed easily — keep things simple",
        "planning": "doesn't know where to begin",
        "motivation": "struggles finding motivation",
        "perfectionism": "paralyzed by perfectionism — emphasize 'good enough'",
      };
      parts.push(`Challenge: ${struggles[ctx.user.preferences.academicStruggle] || ctx.user.preferences.academicStruggle}`);
    }

    if (ctx.user.preferences.currentGoal) {
      parts.push(`Current goal: "${ctx.user.preferences.currentGoal}"`);
    }
  }

  if (ctx.recentMood) {
    parts.push(`Recent mood: ${ctx.recentMood.mood}, energy ${ctx.recentMood.energy_level}/5`);
    if (ctx.recentMood.hardest_part) {
      parts.push(`What feels hardest: "${ctx.recentMood.hardest_part}"`);
    }
  }

  if (ctx.currentTask) {
    parts.push(`Currently working on: "${ctx.currentTask.title}"`);
    if (ctx.currentTask.description) {
      parts.push(`Task details: ${ctx.currentTask.description}`);
    }
  }

  if (ctx.activeTasks.length > 0) {
    parts.push(`Active tasks (${ctx.activeTasks.length}): ${ctx.activeTasks.slice(0, 5).map(t => t.title).join(", ")}`);
  }

  parts.push(`Time: ${ctx.timeOfDay} on ${ctx.dayOfWeek}`);
  parts.push(`Progress: ${ctx.completedTasksCount} tasks completed, ${ctx.achievementsUnlocked}/${ctx.totalAchievements} achievements`);

  return parts.join("\n");
}
