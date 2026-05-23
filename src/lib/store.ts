import { UserProfile, Task, EmotionalCheckin, Achievement } from "./types";

// ============================================
// localStorage persistence layer
// Works perfectly without any database
// ============================================

const STORAGE_KEYS = {
  user: "momentum_user",
  tasks: "momentum_tasks",
  checkins: "momentum_checkins",
  achievements: "momentum_achievements",
} as const;

// ============================================
// USER PROFILE
// ============================================
export function getUser(): UserProfile | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(STORAGE_KEYS.user);
  if (!stored) return null;
  try {
    return JSON.parse(stored) as UserProfile;
  } catch {
    return null;
  }
}

export function saveUser(user: UserProfile): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
}

export function createUser(name: string, preferences: UserProfile["preferences"]): UserProfile {
  const user: UserProfile = {
    name,
    xp: 0,
    streak: 1,
    longestStreak: 1,
    level: 1,
    lastActive: new Date().toISOString(),
    onboardingComplete: true,
    preferences,
  };
  saveUser(user);
  return user;
}

export function addXP(amount: number): UserProfile | null {
  const user = getUser();
  if (!user) return null;

  user.xp += amount;
  user.level = calculateLevel(user.xp);
  user.lastActive = new Date().toISOString();

  // Update streak
  const lastActive = new Date(user.lastActive);
  const today = new Date();
  const diffDays = Math.floor((today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays === 1) {
    user.streak += 1;
    if (user.streak > user.longestStreak) {
      user.longestStreak = user.streak;
    }
  } else if (diffDays > 1) {
    user.streak = 1;
  }

  saveUser(user);
  return user;
}

function calculateLevel(xp: number): number {
  // Each level requires progressively more XP
  // Level 1: 0, Level 2: 100, Level 3: 250, Level 4: 450...
  const baseXP = 100;
  const multiplier = 1.5;
  let level = 1;
  let totalNeeded = baseXP;

  while (xp >= totalNeeded) {
    level++;
    totalNeeded += Math.floor(baseXP * Math.pow(multiplier, level - 1));
  }

  return level;
}

// ============================================
// TASKS
// ============================================
export function getTasks(): Task[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(STORAGE_KEYS.tasks);
  if (!stored) return [];
  try {
    return JSON.parse(stored) as Task[];
  } catch {
    return [];
  }
}

export function saveTasks(tasks: Task[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.tasks, JSON.stringify(tasks));
}

export function addTask(task: Omit<Task, "id" | "created_at" | "completed_at">): Task {
  const tasks = getTasks();
  const newTask: Task = {
    ...task,
    id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    created_at: new Date().toISOString(),
    completed_at: null,
  };
  tasks.push(newTask);
  saveTasks(tasks);
  return newTask;
}

export function completeTask(taskId: string): Task | null {
  const tasks = getTasks();
  const index = tasks.findIndex((t) => t.id === taskId);
  if (index === -1) return null;

  tasks[index].status = "completed";
  tasks[index].completed_at = new Date().toISOString();
  saveTasks(tasks);
  return tasks[index];
}

// ============================================
// EMOTIONAL CHECK-INS
// ============================================
export function saveCheckin(checkin: EmotionalCheckin): void {
  if (typeof window === "undefined") return;
  const stored = localStorage.getItem(STORAGE_KEYS.checkins);
  const checkins: EmotionalCheckin[] = stored ? JSON.parse(stored) : [];
  checkins.push(checkin);
  // Keep last 50 check-ins
  if (checkins.length > 50) checkins.splice(0, checkins.length - 50);
  localStorage.setItem(STORAGE_KEYS.checkins, JSON.stringify(checkins));
}

export function getLatestCheckin(): EmotionalCheckin | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(STORAGE_KEYS.checkins);
  if (!stored) return null;
  const checkins: EmotionalCheckin[] = JSON.parse(stored);
  return checkins[checkins.length - 1] || null;
}

// ============================================
// ACHIEVEMENTS
// ============================================
const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  { id: "first-task", title: "First Step", description: "Complete your first task", icon: "🌱", unlocked: false },
  { id: "streak-3", title: "Building Habits", description: "Maintain a 3-day streak", icon: "🔥", unlocked: false },
  { id: "streak-7", title: "Week Warrior", description: "Maintain a 7-day streak", icon: "⚡", unlocked: false },
  { id: "xp-100", title: "Centurion", description: "Earn 100 XP", icon: "💫", unlocked: false },
  { id: "xp-500", title: "Rising Star", description: "Earn 500 XP", icon: "⭐", unlocked: false },
  { id: "breakdown", title: "Task Slayer", description: "Break down your first big task", icon: "🗡️", unlocked: false },
  { id: "panic-mode", title: "Emergency Responder", description: "Use Panic Mode and survive", icon: "🚨", unlocked: false },
  { id: "reflection", title: "Self-Aware", description: "Complete your first reflection", icon: "🪞", unlocked: false },
  { id: "level-5", title: "Momentum Master", description: "Reach Level 5", icon: "🏆", unlocked: false },
  { id: "focus-30", title: "Deep Diver", description: "Complete a 30+ minute focus session", icon: "🧘", unlocked: false },
];

export function getAchievements(): Achievement[] {
  if (typeof window === "undefined") return DEFAULT_ACHIEVEMENTS;
  const stored = localStorage.getItem(STORAGE_KEYS.achievements);
  if (!stored) {
    localStorage.setItem(STORAGE_KEYS.achievements, JSON.stringify(DEFAULT_ACHIEVEMENTS));
    return DEFAULT_ACHIEVEMENTS;
  }
  return JSON.parse(stored) as Achievement[];
}

export function unlockAchievement(id: string): Achievement | null {
  const achievements = getAchievements();
  const index = achievements.findIndex((a) => a.id === id);
  if (index === -1 || achievements[index].unlocked) return null;

  achievements[index].unlocked = true;
  achievements[index].unlockedAt = new Date().toISOString();
  localStorage.setItem(STORAGE_KEYS.achievements, JSON.stringify(achievements));
  return achievements[index];
}

export function clearAllData(): void {
  if (typeof window === "undefined") return;
  Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
}

// ============================================
// XP CALCULATION HELPERS
// ============================================
export function getXPForLevel(level: number): { current: number; needed: number; progress: number } {
  const user = getUser();
  if (!user) return { current: 0, needed: 100, progress: 0 };

  const baseXP = 100;
  const multiplier = 1.5;

  let xpAtLevelStart = 0;
  for (let i = 1; i < level; i++) {
    xpAtLevelStart += Math.floor(baseXP * Math.pow(multiplier, i - 1));
  }

  const xpForThisLevel = Math.floor(baseXP * Math.pow(multiplier, level - 1));
  const currentXPInLevel = user.xp - xpAtLevelStart;
  const progress = Math.min(100, Math.max(0, (currentXPInLevel / xpForThisLevel) * 100));

  return { current: currentXPInLevel, needed: xpForThisLevel, progress };
}
