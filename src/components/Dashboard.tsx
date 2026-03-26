import { useState, useEffect, useCallback } from 'react';
import { Flame, Settings } from 'lucide-react';
import type { Task, UserProfile, TonePreference } from '@/types';
import {
  getProfile, saveProfile, getTasksForDate, addTask,
  updateTaskStatus, deleteTask, getToday, calculateScore, updateStreak,
} from '@/lib/storage';
import { getRoast } from '@/lib/roasts';
import GoalSetup from '@/components/GoalSetup';
import AddTask from '@/components/AddTask';
import TaskList from '@/components/TaskList';
import RoastCard from '@/components/RoastCard';
import StreakDisplay from '@/components/StreakDisplay';
import ScoreDisplay from '@/components/ScoreDisplay';
import ToneSelector from '@/components/ToneSelector';
import ShareableRoast from '@/components/ShareableRoast';

const Dashboard = () => {
  const [profile, setProfile] = useState<UserProfile>(getProfile());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [roastMessage, setRoastMessage] = useState('');
  const [showShare, setShowShare] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const today = getToday();
  const score = calculateScore(tasks);

  const refreshTasks = useCallback(() => {
    setTasks(getTasksForDate(today));
  }, [today]);

  useEffect(() => {
    refreshTasks();
  }, [refreshTasks]);

  // Generate roast when tasks change
  useEffect(() => {
    const missed = tasks.filter(t => t.status === 'missed').length;
    if (missed > 0) {
      setRoastMessage(getRoast(profile.tonePreference, 'missed', profile.goal, profile.targetSalary));
    } else if (score < 50 && tasks.length > 0) {
      setRoastMessage(getRoast(profile.tonePreference, 'low_score', profile.goal, profile.targetSalary));
    } else if (tasks.length > 0 && tasks.every(t => t.status === 'completed')) {
      setRoastMessage('');
    }
  }, [tasks, profile, score]);

  const handleAddTask = (title: string) => {
    addTask(title, today);
    refreshTasks();
  };

  const handleComplete = (id: string) => {
    updateTaskStatus(id, 'completed');
    refreshTasks();
    // Check if all completed
    const updated = getTasksForDate(today);
    if (updated.length > 0 && updated.every(t => t.status === 'completed')) {
      const newProfile = updateStreak(profile, true);
      setProfile(newProfile);
      saveProfile(newProfile);
    }
  };

  const handleMiss = (id: string) => {
    updateTaskStatus(id, 'missed');
    refreshTasks();
    const newProfile = updateStreak(profile, false);
    setProfile(newProfile);
    saveProfile(newProfile);
  };

  const handleDelete = (id: string) => {
    deleteTask(id);
    refreshTasks();
  };

  const handleToneChange = (tone: TonePreference) => {
    const newProfile = { ...profile, tonePreference: tone };
    setProfile(newProfile);
    saveProfile(newProfile);
  };

  const handleOnboarding = (data: Partial<UserProfile>) => {
    const newProfile = { ...profile, ...data };
    setProfile(newProfile);
    saveProfile(newProfile);
  };

  if (!profile.onboardingDone) {
    return <GoalSetup onComplete={handleOnboarding} />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-6 h-6 text-roast" />
            <h1 className="text-xl font-bold text-gradient-fire">Roast Me</h1>
          </div>
          <button onClick={() => setShowSettings(!showSettings)} className="p-2 rounded-lg hover:bg-secondary text-muted-foreground">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 space-y-6">
        {/* Settings panel */}
        {showSettings && (
          <div className="p-4 rounded-lg border border-border bg-card animate-slide-up space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Settings</h3>
            <div>
              <p className="text-xs text-muted-foreground mb-2">Goal: <strong className="text-foreground">{profile.goal || 'Not set'}</strong></p>
              <p className="text-xs text-muted-foreground">Target: <strong className="text-foreground">{profile.targetSalary || 'Not set'}</strong></p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-2">Roast Style</p>
              <ToneSelector current={profile.tonePreference} onChange={handleToneChange} />
            </div>
          </div>
        )}

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-3">
          <StreakDisplay count={profile.streakCount} />
          <ScoreDisplay score={score} />
        </div>

        {/* Roast */}
        {roastMessage && (
          <RoastCard message={roastMessage} onShare={() => setShowShare(true)} />
        )}

        {/* Today's tasks */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Today's Tasks</h2>
            <span className="text-xs text-muted-foreground">{today}</span>
          </div>
          <AddTask onAdd={handleAddTask} />
          <TaskList tasks={tasks} onComplete={handleComplete} onMiss={handleMiss} onDelete={handleDelete} />
        </div>

        {/* Motivational footer when no tasks */}
        {tasks.length === 0 && !roastMessage && (
          <div className="text-center py-8 animate-slide-up">
            <p className="text-2xl font-bold text-gradient-fire mb-2">Ready to get roasted?</p>
            <p className="text-muted-foreground">Add your tasks above. Skip them, and we'll make sure you regret it.</p>
          </div>
        )}
      </main>

      {/* Share modal */}
      {showShare && roastMessage && (
        <ShareableRoast
          message={roastMessage}
          score={score}
          streak={profile.streakCount}
          onClose={() => setShowShare(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;
