import { UserProfile, Task, EmotionalCheckin, Achievement } from "./types";
import { getSupabase, isSupabaseConfigured, DbProfile, DbTask } from "./supabase";

// ============================================
// UNIFIED STORE: localStorage + Supabase sync
//
// Strategy:
// 1. All reads hit localStorage first (instant)
// 2. All writes go to localStorage immediately (optimistic)
// 3. If Supabase is configured, sync in background
// 4. On load, pull latest from Supabase to localStorage
// 5. Queue failed writes and retry on reconnect
// ============================================

const STORAGE_KEYS = {
  user: "momentum_user",
  tasks: "momentum_tasks",
  checkins: "momentum_checkins",
  achievements: "momentum_achievements",
  syncQueue: "momentum_sync_queue",
  authUser: "momentum_auth_user",
} as const;

// ============================================
// SYNC QUEUE (offline-first)
// ============================================
interface SyncOperation {
  id: string;
  table: string;
  operation: "upsert" | "update" | "insert" | "delete";
  data: any;
  timestamp: string;
}

function getSyncQueue(): SyncOperation[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.syncQueue);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function addToSyncQueue(op: Omit<SyncOperation, "id" | "timestamp">): void {
  if (typeof window === "undefined") return;
  const queue = getSyncQueue();
  queue.push({
    ...op,
    id: `sync-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    timestamp: new Date().toISOString(),
  });
  localStorage.setItem(STORAGE_KEYS.syncQueue, JSON.stringify(queue));
}

function clearSyncQueue(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.syncQueue, JSON.stringify([]));
}

// Process queued operations when back online
export async function processSyncQueue(): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;

  const queue = getSyncQueue();
  if (queue.length === 0) return;

  console.log(`[Momentum Sync] Processing ${queue.length} queued operations...`);

  const authUser = await getAuthUserId();
  if (!authUser) return;

  const failedOps: SyncOperation[] = [];

  for (const op of queue) {
    try {
      if (op.operation === "upsert") {
        await supabase.from(op.table).upsert({ ...op.data, user_id: authUser });
      } else if (op.operation === "insert") {
        await supabase.from(op.table).insert({ ...op.data, user_id: authUser });
      } else if (op.operation === "update") {
        const { id, ...updateData } = op.data;
        await supabase.from(op.table).update(updateData).eq("id", id).eq("user_id", authUser);
      } else if (op.operation === "delete") {
        await supabase.from(op.table).delete().eq("id", op.data.id).eq("user_id", authUser);
      }
      console.log(`[Momentum Sync] ✓ ${op.operation} on ${op.table}`);
    } catch (e) {
      console.error(`[Momentum Sync] ✗ Failed ${op.operation} on ${op.table}:`, e);
      failedOps.push(op);
    }
  }

  console.log(`[Momentum Sync] Completed. ${queue.length - failedOps.length} succeeded, ${failedOps.length} failed.`);
  localStorage.setItem(STORAGE_KEYS.syncQueue, JSON.stringify(failedOps));
}

// ============================================
// AUTH HELPERS
// ============================================
export async function getAuthUserId(): Promise<string | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id || null;
  } catch {
    return null;
  }
}

export async function signInWithGoogle(): Promise<{ error: string | null }> {
  const supabase = getSupabase();
  if (!supabase) return { error: "Supabase not configured" };

  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    return { error: error?.message || null };
  } catch (e: any) {
    return { error: e.message || "Sign in failed" };
  }
}

export async function signInWithMagicLink(email: string): Promise<{ error: string | null }> {
  const supabase = getSupabase();
  if (!supabase) return { error: "Supabase not configured" };

  try {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    return { error: error?.message || null };
  } catch (e: any) {
    return { error: e.message || "Sign in failed" };
  }
}

export async function signOut(): Promise<void> {
  const supabase = getSupabase();
  if (supabase) {
    await supabase.auth.signOut();
  }
  clearAllData();
}

export async function getSession() {
  const supabase = getSupabase();
  if (!supabase) return null;
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  } catch {
    return null;
  }
}

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
  // Background sync to Supabase
  syncProfileToCloud(user);
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
  console.log("[Momentum] User created:", { name, preferences });
  return user;
}

export function addXP(amount: number): UserProfile | null {
  const user = getUser();
  if (!user) return null;

  user.xp += amount;
  user.level = calculateLevel(user.xp);

  // Update streak logic
  const lastActive = new Date(user.lastActive);
  const today = new Date();
  const lastDate = lastActive.toDateString();
  const todayDate = today.toDateString();

  if (lastDate !== todayDate) {
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (lastActive.toDateString() === yesterday.toDateString()) {
      user.streak += 1;
      if (user.streak > user.longestStreak) {
        user.longestStreak = user.streak;
      }
    } else {
      user.streak = 1;
    }
  }

  user.lastActive = new Date().toISOString();
  saveUser(user);
  console.log("[Momentum] XP added:", { amount, totalXP: user.xp, level: user.level, streak: user.streak });
  return user;
}
}

function calculateLevel(xp: number): number {
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

// Cloud sync for profile
async function syncProfileToCloud(user: UserProfile): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;

  const authId = await getAuthUserId();
  if (!authId) {
    addToSyncQueue({
      table: "profiles",
      operation: "upsert",
      data: profileToDb(user),
    });
    return;
  }

  try {
    const { error } = await supabase.from("profiles").upsert({
      id: authId,
      name: user.name,
      xp: user.xp,
      streak: user.streak,
      longest_streak: user.longestStreak,
      level: user.level,
      last_active: user.lastActive,
      onboarding_complete: user.onboardingComplete,
      preferences: user.preferences,
    });
    if (error) throw error;
    console.log("[Momentum Sync] Profile synced to cloud ✓");
  } catch (e) {
    console.warn("[Momentum Sync] Profile sync failed — queued for retry:", e);
    addToSyncQueue({
      table: "profiles",
      operation: "upsert",
      data: profileToDb(user),
    });
  }
}

function profileToDb(user: UserProfile) {
  return {
    name: user.name,
    xp: user.xp,
    streak: user.streak,
    longest_streak: user.longestStreak,
    level: user.level,
    last_active: user.lastActive,
    onboarding_complete: user.onboardingComplete,
    preferences: user.preferences,
  };
}

function dbToProfile(db: DbProfile): UserProfile {
  return {
    name: db.name,
    xp: db.xp,
    streak: db.streak,
    longestStreak: db.longest_streak,
    level: db.level,
    lastActive: db.last_active,
    onboardingComplete: db.onboarding_complete,
    preferences: {
      studyStyle: db.preferences?.studyStyle || "",
      stressLevel: db.preferences?.stressLevel || "",
      academicStruggle: db.preferences?.academicStruggle || "",
      currentGoal: db.preferences?.currentGoal || "",
    },
  };
}

// Pull latest profile from Supabase
export async function syncProfileFromCloud(): Promise<UserProfile | null> {
  const supabase = getSupabase();
  if (!supabase) {
    console.log("[Momentum Sync] No Supabase client — skipping cloud sync");
    return null;
  }

  const authId = await getAuthUserId();
  if (!authId) {
    console.log("[Momentum Sync] No auth user — skipping cloud sync");
    return null;
  }

  try {
    console.log("[Momentum Sync] Fetching profile from cloud for user:", authId.slice(0, 8) + "...");

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", authId)
      .single();

    if (error) {
      console.log("[Momentum Sync] Profile fetch error:", error.message, error.code);

      // If profile doesn't exist (PGRST116 = no rows), check if we have local data to push
      if (error.code === "PGRST116") {
        console.log("[Momentum Sync] No profile in cloud — checking local...");
        const localUser = getUser();
        if (localUser?.onboardingComplete) {
          // Push local profile to cloud
          console.log("[Momentum Sync] Pushing local profile to cloud...");
          await syncProfileToCloud(localUser);
          return localUser;
        }

        // No local profile either — try to create from auth metadata
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser) {
          const name = authUser.user_metadata?.name
            || authUser.user_metadata?.full_name
            || authUser.email?.split("@")[0]
            || "Friend";
          console.log("[Momentum Sync] Creating profile from auth metadata:", name);

          // Try to insert the profile
          await supabase.from("profiles").upsert({
            id: authId,
            name,
            xp: 0,
            streak: 1,
            longest_streak: 1,
            level: 1,
            last_active: new Date().toISOString(),
            onboarding_complete: false,
            preferences: {},
          });
        }
        return null;
      }
      return null;
    }

    if (!data) return null;

    const profile = dbToProfile(data as DbProfile);
    console.log("[Momentum Sync] Cloud profile found:", { name: profile.name, onboarded: profile.onboardingComplete, xp: profile.xp });

    // Merge: use cloud data but keep local if more recent
    const localUser = getUser();
    if (localUser && localUser.onboardingComplete) {
      const localDate = new Date(localUser.lastActive).getTime();
      const cloudDate = new Date(profile.lastActive).getTime();
      if (localDate > cloudDate) {
        // Local is newer — push to cloud
        console.log("[Momentum Sync] Local is newer — pushing to cloud");
        syncProfileToCloud(localUser);
        return localUser;
      }
    }

    // Cloud is newer or no local — use cloud
    console.log("[Momentum Sync] Using cloud profile");
    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(profile));
    return profile;
  } catch (e) {
    console.error("[Momentum Sync] syncProfileFromCloud error:", e);
    return null;
  }
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
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
    completed_at: null,
  };
  tasks.push(newTask);
  saveTasks(tasks);

  // Background cloud sync
  syncTaskToCloud(newTask, "insert");
  return newTask;
}

export function completeTask(taskId: string): Task | null {
  const tasks = getTasks();
  const index = tasks.findIndex((t) => t.id === taskId);
  if (index === -1) return null;

  tasks[index].status = "completed";
  tasks[index].completed_at = new Date().toISOString();
  saveTasks(tasks);

  // Background cloud sync
  syncTaskToCloud(tasks[index], "update");
  return tasks[index];
}

export function deleteTask(taskId: string): void {
  const tasks = getTasks().filter((t) => t.id !== taskId);
  saveTasks(tasks);

  // Background cloud sync
  syncTaskDelete(taskId);
}

async function syncTaskToCloud(task: Task, operation: "insert" | "update"): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;

  const authId = await getAuthUserId();
  if (!authId) {
    addToSyncQueue({ table: "tasks", operation, data: taskToDb(task, "") });
    return;
  }

  // Ensure task ID is a valid UUID (old tasks may have non-UUID IDs)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(task.id)) {
    console.log(`[Momentum Sync] Task "${task.title.slice(0, 20)}..." has non-UUID id, generating new one`);
    task.id = crypto.randomUUID();
    // Update local storage with new ID
    const tasks = getTasks();
    const idx = tasks.findIndex(t => t.title === task.title && t.created_at === task.created_at);
    if (idx !== -1) {
      tasks[idx].id = task.id;
      saveTasks(tasks);
    }
  }

  try {
    const dbTask = taskToDb(task, authId);
    if (operation === "insert") {
      const { error } = await supabase.from("tasks").upsert(dbTask);
      if (error) throw error;
    } else {
      const { error } = await supabase.from("tasks").update({
        status: dbTask.status,
        completed_at: dbTask.completed_at,
        title: dbTask.title,
        description: dbTask.description,
        priority: dbTask.priority,
        estimated_minutes: dbTask.estimated_minutes,
        order_index: dbTask.order_index,
      }).eq("id", dbTask.id).eq("user_id", authId);
      if (error) throw error;
    }
    console.log(`[Momentum Sync] Task ${operation}: "${task.title.slice(0, 30)}..." ✓`);
  } catch (e: any) {
    console.warn(`[Momentum Sync] Task ${operation} failed:`, e?.message || e);
    addToSyncQueue({ table: "tasks", operation, data: taskToDb(task, authId || "") });
  }
}

async function syncTaskDelete(taskId: string): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;

  const authId = await getAuthUserId();
  if (!authId) {
    addToSyncQueue({ table: "tasks", operation: "delete", data: { id: taskId } });
    return;
  }

  try {
    await supabase.from("tasks").delete().eq("id", taskId).eq("user_id", authId);
  } catch {
    addToSyncQueue({ table: "tasks", operation: "delete", data: { id: taskId } });
  }
}

function taskToDb(task: Task, userId: string): DbTask {
  return {
    id: task.id,
    user_id: userId,
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    estimated_minutes: task.estimated_minutes,
    xp_reward: task.xp_reward,
    parent_task_id: task.parent_task_id,
    order_index: task.order_index,
    created_at: task.created_at,
    completed_at: task.completed_at,
    updated_at: new Date().toISOString(),
  };
}

function dbToTask(db: DbTask): Task {
  return {
    id: db.id,
    title: db.title,
    description: db.description,
    status: db.status,
    priority: db.priority,
    estimated_minutes: db.estimated_minutes,
    xp_reward: db.xp_reward,
    parent_task_id: db.parent_task_id,
    order_index: db.order_index,
    created_at: db.created_at,
    completed_at: db.completed_at,
  };
}

export async function syncTasksFromCloud(): Promise<Task[]> {
  const supabase = getSupabase();
  if (!supabase) return getTasks();

  const authId = await getAuthUserId();
  if (!authId) return getTasks();

  try {
    console.log("[Momentum Sync] Fetching tasks from cloud...");
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", authId)
      .order("created_at", { ascending: true });

    if (error) {
      console.log("[Momentum Sync] Tasks fetch error:", error.message);
      return getTasks();
    }

    if (!data || data.length === 0) {
      console.log("[Momentum Sync] No tasks in cloud — checking local...");
      // Push any local tasks to cloud
      const localTasks = getTasks();
      if (localTasks.length > 0) {
        console.log(`[Momentum Sync] Pushing ${localTasks.length} local tasks to cloud...`);
        for (const task of localTasks) {
          syncTaskToCloud(task, "insert");
        }
      }
      return localTasks;
    }

    const cloudTasks = (data as DbTask[]).map(dbToTask);
    console.log(`[Momentum Sync] Found ${cloudTasks.length} tasks in cloud`);

    // Merge: keep local tasks that aren't in cloud, add cloud tasks
    const localTasks = getTasks();
    const cloudIds = new Set(cloudTasks.map((t) => t.id));
    const localOnly = localTasks.filter((t) => !cloudIds.has(t.id));

    // Push local-only tasks to cloud
    if (localOnly.length > 0) {
      console.log(`[Momentum Sync] Pushing ${localOnly.length} local-only tasks to cloud...`);
      for (const task of localOnly) {
        syncTaskToCloud(task, "insert");
      }
    }

    const merged = [...cloudTasks, ...localOnly];
    saveTasks(merged);
    console.log(`[Momentum Sync] Tasks synced: ${merged.length} total`);
    return merged;
  } catch (e) {
    console.error("[Momentum Sync] syncTasksFromCloud error:", e);
    return getTasks();
  }
}

// ============================================
// EMOTIONAL CHECK-INS
// ============================================
export function saveCheckin(checkin: EmotionalCheckin): void {
  if (typeof window === "undefined") return;
  const stored = localStorage.getItem(STORAGE_KEYS.checkins);
  const checkins: EmotionalCheckin[] = stored ? JSON.parse(stored) : [];
  checkins.push(checkin);
  if (checkins.length > 50) checkins.splice(0, checkins.length - 50);
  localStorage.setItem(STORAGE_KEYS.checkins, JSON.stringify(checkins));

  // Background cloud sync
  syncCheckinToCloud(checkin);
}

export function getLatestCheckin(): EmotionalCheckin | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(STORAGE_KEYS.checkins);
  if (!stored) return null;
  const checkins: EmotionalCheckin[] = JSON.parse(stored);
  return checkins[checkins.length - 1] || null;
}

async function syncCheckinToCloud(checkin: EmotionalCheckin): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;

  const authId = await getAuthUserId();
  if (!authId) {
    addToSyncQueue({
      table: "emotional_checkins",
      operation: "insert",
      data: { mood: checkin.mood, energy_level: checkin.energy_level, hardest_part: checkin.hardest_part },
    });
    return;
  }

  try {
    await supabase.from("emotional_checkins").insert({
      user_id: authId,
      mood: checkin.mood,
      energy_level: checkin.energy_level,
      hardest_part: checkin.hardest_part,
    });
  } catch {
    addToSyncQueue({
      table: "emotional_checkins",
      operation: "insert",
      data: { mood: checkin.mood, energy_level: checkin.energy_level, hardest_part: checkin.hardest_part },
    });
  }
}

// ============================================
// REFLECTIONS
// ============================================
export async function saveReflection(
  taskId: string | null,
  taskTitle: string,
  difficulty: number,
  confidence: number,
  notes: string
): Promise<void> {
  // Cloud sync
  const supabase = getSupabase();
  if (!supabase) return;

  const authId = await getAuthUserId();
  if (!authId) {
    addToSyncQueue({
      table: "reflections",
      operation: "insert",
      data: { task_id: taskId, task_title: taskTitle, difficulty_felt: difficulty, confidence_level: confidence, notes },
    });
    return;
  }

  try {
    await supabase.from("reflections").insert({
      user_id: authId,
      task_id: taskId,
      task_title: taskTitle,
      difficulty_felt: difficulty,
      confidence_level: confidence,
      notes: notes || null,
    });
  } catch {
    addToSyncQueue({
      table: "reflections",
      operation: "insert",
      data: { task_id: taskId, task_title: taskTitle, difficulty_felt: difficulty, confidence_level: confidence, notes },
    });
  }
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

// ============================================
// FULL SYNC (call on app load when authenticated)
// ============================================
export async function fullSync(): Promise<void> {
  if (!isSupabaseConfigured()) return;

  try {
    await Promise.all([
      syncProfileFromCloud(),
      syncTasksFromCloud(),
      processSyncQueue(),
    ]);
  } catch {
    // Silent fail — local data is always available
  }
}

// ============================================
// DATA MANAGEMENT
// ============================================
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
