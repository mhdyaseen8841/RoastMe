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
  notificationInterval?: 'off' | '2min' | '5min' | '10min' | '1hour' | '6hour' | 'custom';
  notificationTime?: string; // HH:mm
  aiEnabled?: boolean;
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
