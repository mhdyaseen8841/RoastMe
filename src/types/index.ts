export type TonePreference = 'savage' | 'funny' | 'sarcastic';

export type TaskStatus = 'pending' | 'completed' | 'missed';

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  date: string; // YYYY-MM-DD
  createdAt: number;
}

export interface UserProfile {
  goal: string;
  targetSalary: string;
  tonePreference: TonePreference;
  streakCount: number;
  lastCompletedDate: string; // YYYY-MM-DD
  onboardingDone: boolean;
}

export interface RoastLog {
  id: string;
  message: string;
  date: string;
  scoreImpact: number;
}

export interface DailyStats {
  total: number;
  completed: number;
  missed: number;
  score: number;
}
