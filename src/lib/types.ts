export type Mood = "anxious" | "overwhelmed" | "tired" | "neutral" | "motivated" | "energized";

export type TaskStatus = "pending" | "in_progress" | "completed";
export type TaskPriority = "low" | "medium" | "high";

export interface UserProfile {
  name: string;
  xp: number;
  streak: number;
  longestStreak: number;
  level: number;
  lastActive: string;
  onboardingComplete: boolean;
  preferences: {
    studyStyle: string;
    stressLevel: string;
    academicStruggle: string;
    currentGoal: string;
  };
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  estimated_minutes: number | null;
  xp_reward: number;
  parent_task_id: string | null;
  order_index: number;
  created_at: string;
  completed_at: string | null;
  subtasks?: Task[];
}

export interface EmotionalCheckin {
  mood: Mood;
  energy_level: number;
  hardest_part: string;
  timestamp: string;
}

export interface PanicModeInput {
  assignment: string;
  deadline: string;
  currentProgress: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
}
