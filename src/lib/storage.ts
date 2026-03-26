import type { Task, UserProfile, RoastLog } from '@/types';

const KEYS = {
  tasks: 'roastme_tasks',
  profile: 'roastme_profile',
  roastLogs: 'roastme_roast_logs',
};

const defaultProfile: UserProfile = {
  goal: '',
  targetSalary: '',
  tonePreference: 'savage',
  streakCount: 0,
  lastCompletedDate: '',
  onboardingDone: false,
  notificationInterval: 'off',
  notificationTime: '09:00',
};

export function getProfile(): UserProfile {
  const raw = localStorage.getItem(KEYS.profile);
  return raw ? { ...defaultProfile, ...JSON.parse(raw) } : { ...defaultProfile };
}

export function saveProfile(profile: UserProfile): void {
  localStorage.setItem(KEYS.profile, JSON.stringify(profile));
}

export function getTasks(): Task[] {
  const raw = localStorage.getItem(KEYS.tasks);
  return raw ? JSON.parse(raw) : [];
}

export function saveTasks(tasks: Task[]): void {
  localStorage.setItem(KEYS.tasks, JSON.stringify(tasks));
}

export function getTasksForDate(date: string): Task[] {
  return getTasks().filter(t => t.date === date);
}

export function addTask(title: string, date: string): Task {
  const tasks = getTasks();
  const task: Task = {
    id: crypto.randomUUID(),
    title,
    status: 'pending',
    date,
    createdAt: Date.now(),
  };
  tasks.push(task);
  saveTasks(tasks);
  return task;
}

export function updateTaskStatus(taskId: string, status: Task['status']): void {
  const tasks = getTasks();
  const idx = tasks.findIndex(t => t.id === taskId);
  if (idx !== -1) {
    tasks[idx].status = status;
    saveTasks(tasks);
  }
}

export function deleteTask(taskId: string): void {
  saveTasks(getTasks().filter(t => t.id !== taskId));
}

export function getRoastLogs(): RoastLog[] {
  const raw = localStorage.getItem(KEYS.roastLogs);
  return raw ? JSON.parse(raw) : [];
}

export function addRoastLog(message: string, date: string, scoreImpact: number): void {
  const logs = getRoastLogs();
  logs.push({ id: crypto.randomUUID(), message, date, scoreImpact });
  localStorage.setItem(KEYS.roastLogs, JSON.stringify(logs));
}

export function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

export function calculateScore(tasks: Task[]): number {
  if (tasks.length === 0) return 100;
  const completed = tasks.filter(t => t.status === 'completed').length;
  return Math.round((completed / tasks.length) * 100);
}

export function updateStreak(profile: UserProfile, allCompleted: boolean): UserProfile {
  const today = getToday();
  if (allCompleted) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    if (profile.lastCompletedDate === yesterdayStr || profile.lastCompletedDate === today) {
      return { ...profile, streakCount: profile.lastCompletedDate === today ? profile.streakCount : profile.streakCount + 1, lastCompletedDate: today };
    }
    return { ...profile, streakCount: 1, lastCompletedDate: today };
  }
  if (profile.lastCompletedDate !== today) {
    return { ...profile, streakCount: 0 };
  }
  return profile;
}
