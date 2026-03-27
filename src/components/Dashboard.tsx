import { useState, useEffect, useCallback, useMemo } from 'react';
import { Flame, Settings } from 'lucide-react';
import type { Task, UserProfile, TonePreference } from '@/types';
import {
  getProfile, saveProfile, getTasksForDate, addTask,
  updateTaskStatus, deleteTask, getToday, calculateScore, updateStreak,
  getActivityData,
} from '@/lib/storage';
import { getDynamicRoast, testAI } from '@/lib/roasts';
import { requestNotificationPermission, triggerRoastNotification } from '@/lib/notifications';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Sparkles, Brain, Info } from 'lucide-react';
import GoalSetup from '@/components/GoalSetup';
import AddTask from '@/components/AddTask';
import TaskList from '@/components/TaskList';
import RoastCard from '@/components/RoastCard';
import StreakDisplay from '@/components/StreakDisplay';
import ScoreDisplay from '@/components/ScoreDisplay';
import ToneSelector from '@/components/ToneSelector';
import ShareableRoast from '@/components/ShareableRoast';
import ActivityChart from '@/components/ActivityChart';
import { Button } from '@/components/ui/button';
import { Bell, BellOff, Clock, ChevronLeft, ChevronRight, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from '@/components/ui/input';

const Dashboard = () => {
  const [profile, setProfile] = useState<UserProfile>(getProfile());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [roastMessage, setRoastMessage] = useState('');
  const [showShare, setShowShare] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [editGoal, setEditGoal] = useState(profile.goal);
  const [editSalary, setEditSalary] = useState(profile.targetSalary);
  const [isTestingAI, setIsTestingAI] = useState(false);
  
  const today = getToday();
  const [selectedDate, setSelectedDate] = useState(today);
  
  const activityData = useMemo(() => getActivityData(91), [tasks]);
  
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    'Notification' in window && Notification.permission === 'granted'
  );
  const [isPushEnabled, setIsPushEnabled] = useState(
    localStorage.getItem('is_push_enabled') === 'true'
  );
  
  const { toast } = useToast();

  const score = calculateScore(tasks);

  const refreshTasks = useCallback(() => {
    setTasks(getTasksForDate(selectedDate));
  }, [selectedDate]);

  useEffect(() => {
    refreshTasks();
  }, [refreshTasks]);

  // Generate roast when tasks change
  useEffect(() => {
    const updateRoast = async () => {
      const missed = tasks.filter(t => t.status === 'missed').length;
      if (missed > 0) {
        const msg = await getDynamicRoast(profile, 'missed');
        setRoastMessage(msg);
      } else if (score < 50 && tasks.length > 0) {
        const msg = await getDynamicRoast(profile, 'low_score');
        setRoastMessage(msg);
      } else if (tasks.length > 0 && tasks.every(t => t.status === 'completed')) {
        setRoastMessage('');
      } else if (tasks.length === 0) {
        setRoastMessage('');
      }
    };
    updateRoast();
  }, [tasks, profile, score]);

  // Periodic Notifications Logic
  useEffect(() => {
    if (!notificationsEnabled || !isPushEnabled || profile.notificationInterval === 'off') return;

    const checkAndNotify = () => {
      const now = new Date();
      const lastNotify = localStorage.getItem('last_periodic_notification');
      const lastTime = lastNotify ? parseInt(lastNotify) : 0;
      
      let shouldNotify = false;
      const minutesSinceLast = (Date.now() - lastTime) / (1000 * 60);

      if (profile.notificationInterval === '2min' && minutesSinceLast >= 2) shouldNotify = true;
      else if (profile.notificationInterval === '5min' && minutesSinceLast >= 5) shouldNotify = true;
      else if (profile.notificationInterval === '10min' && minutesSinceLast >= 10) shouldNotify = true;
      else if (profile.notificationInterval === '1hour' && minutesSinceLast >= 60) shouldNotify = true;
      else if (profile.notificationInterval === '6hour' && minutesSinceLast >= 360) shouldNotify = true;
      else if (profile.notificationInterval === 'custom' && profile.notificationTime) {
        const [hours, mins] = profile.notificationTime.split(':').map(Number);
        if (now.getHours() === hours && now.getMinutes() === mins) {
          // Only notify once per day for specific time
          const lastDate = localStorage.getItem('last_specific_time_notification');
          const todayStr = getToday();
          if (lastDate !== todayStr) {
            shouldNotify = true;
            localStorage.setItem('last_specific_time_notification', todayStr);
          }
        }
      }

      if (shouldNotify) {
        triggerRoastNotification('general');
        localStorage.setItem('last_periodic_notification', Date.now().toString());
      }
    };

    const intervalId = setInterval(checkAndNotify, 30000); // Check every 30 seconds
    return () => clearInterval(intervalId);
  }, [notificationsEnabled, profile.notificationInterval, profile.notificationTime, profile.goal, profile.targetSalary, profile.tonePreference]);

  const handleAddTask = (title: string) => {
    addTask(title, selectedDate);
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
  
  const handleEnableNotifications = async () => {
    if (!('Notification' in window)) {
      toast({
        title: "Notifications Not Supported",
        description: "Your browser doesn't support push notifications here. Try 'Add to Home Screen' if you're on iOS! 📱",
        variant: "destructive",
      });
      return;
    }

    const currentPermission = Notification.permission;

    if (currentPermission === 'granted') {
      const newState = !isPushEnabled;
      setIsPushEnabled(newState);
      localStorage.setItem('is_push_enabled', newState.toString());
      toast({
        title: newState ? "Notifications Enabled" : "Notifications Disabled",
        description: newState ? "Now we can reach you anywhere. 🔥" : "You're safe... for now. 💀",
      });
      return;
    }

    if (currentPermission === 'denied') {
      toast({
        title: "Permission Denied",
        description: "Please enable notifications in your browser settings to continue. 💀",
        variant: "destructive",
      });
      return;
    }

    try {
      const permission = await requestNotificationPermission();
      if (permission === 'granted') {
        setNotificationsEnabled(true);
        setIsPushEnabled(true);
        localStorage.setItem('is_push_enabled', 'true');
        toast({
          title: "Notifications Enabled",
          description: "Now we can reach you anywhere. 🔥",
        });
      }
    } catch (err) {
      console.error("Permission request failed", err);
    }
  };

  const sendTestNotification = () => {
    triggerRoastNotification('general');
  };

  const handleMiss = (id: string) => {
    updateTaskStatus(id, 'missed');
    refreshTasks();
    const newProfile = updateStreak(profile, false);
    setProfile(newProfile);
    saveProfile(newProfile);
    
    if (notificationsEnabled && isPushEnabled) {
      triggerRoastNotification('missed');
    }
  };

  const handleResetTask = (id: string) => {
    updateTaskStatus(id, 'pending');
    refreshTasks();
  };

  const handleDelete = (id: string) => {
    deleteTask(id);
    refreshTasks();
  };

  const handleIntervalChange = (val: string) => {
    const newProfile = { ...profile, notificationInterval: val as any };
    setProfile(newProfile);
    saveProfile(newProfile);
  };

  const handleTimeChange = (time: string) => {
    const newProfile = { ...profile, notificationTime: time };
    setProfile(newProfile);
    saveProfile(newProfile);
  };

  const handleToneChange = (tone: TonePreference) => {
    const newProfile = { ...profile, tonePreference: tone };
    setProfile(newProfile);
    saveProfile(newProfile);
  };

  const handlePrevDay = () => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() - 1);
    setSelectedDate(date.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + 1);
    setSelectedDate(date.toISOString().split('T')[0]);
  };

  const handleAIEnabledChange = (enabled: boolean) => {
    const newProfile = { ...profile, aiEnabled: enabled };
    setProfile(newProfile);
    saveProfile(newProfile);
    if (enabled && !profile.aiApiKey) {
      toast({
        title: "AI Enabled!",
        description: "Now enter your Gemini API Key below to start getting dynamic roasts. 🔥",
      });
    }
  };

  const handleAIApiKeyChange = (key: string) => {
    const newProfile = { ...profile, aiApiKey: key };
    setProfile(newProfile);
    saveProfile(newProfile);
  };

  const handleTestAI = async () => {
    if (!profile.aiApiKey) {
      toast({
        title: "Key Missing",
        description: "Please enter an API Key first. 💀",
        variant: "destructive",
      });
      return;
    }

    setIsTestingAI(true);
    try {
      const result = await testAI(profile.aiApiKey);
      toast({
        title: "AI Success!",
        description: result,
      });
    } catch (error: any) {
      toast({
        title: "AI Connection Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsTestingAI(false);
    }
  };

  const handleOnboarding = (data: Partial<UserProfile>) => {
    const newProfile = { ...profile, ...data };
    setProfile(newProfile);
    saveProfile(newProfile);
  };

  const handleResetProfile = () => {
    if (confirm("Are you sure? This will delete all your tasks and streak data. No going back from being a quitter! 🔥")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const handleUpdateGoal = () => {
    const newProfile = { ...profile, goal: editGoal, targetSalary: editSalary };
    setProfile(newProfile);
    saveProfile(newProfile);
    setIsEditingGoal(false);
    toast({
      title: "Goal Updated",
      description: "We've updated your target. Now get back to work! 💀",
    });
  };

  if (!profile.onboardingDone) {
    return <GoalSetup onComplete={handleOnboarding} />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur-md px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-6 h-6 text-roast" />
            <h1 className="text-xl font-bold text-gradient-fire">Roast Me</h1>
          </div>
          <button 
            onClick={() => setShowSettings(!showSettings)} 
            className={`p-2 rounded-lg transition-colors ${showSettings ? 'bg-roast shadow-[0_0_15px_rgba(255,83,83,0.3)] text-white' : 'hover:bg-secondary text-muted-foreground'}`}
            aria-label="Toggle Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 space-y-6 pb-24">
        {/* Settings panel */}
        {showSettings && (
          <div className="p-4 rounded-lg border border-border bg-card animate-slide-up space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Settings</h3>
              {!isEditingGoal && (
                <Button variant="ghost" size="sm" onClick={() => setIsEditingGoal(true)} className="text-[10px] h-6 px-2">
                  Edit Profile
                </Button>
              )}
            </div>
            
            {isEditingGoal ? (
              <div className="space-y-3 animate-fade-in">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-muted-foreground">Main Goal</label>
                  <Input 
                    value={editGoal} 
                    onChange={(e) => setEditGoal(e.target.value)}
                    className="h-8 text-xs bg-secondary border-border"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-muted-foreground">Target Salary</label>
                  <Input 
                    value={editSalary} 
                    onChange={(e) => setEditSalary(e.target.value)}
                    className="h-8 text-xs bg-secondary border-border"
                  />
                </div>
                <div className="flex gap-2">
                  <Button size="sm" className="h-7 text-xs flex-1" onClick={handleUpdateGoal}>Save</Button>
                  <Button size="sm" variant="outline" className="h-7 text-xs flex-1" onClick={() => {
                    setIsEditingGoal(false);
                    setEditGoal(profile.goal);
                    setEditSalary(profile.targetSalary);
                  }}>Cancel</Button>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-xs text-muted-foreground mb-2">Goal: <strong className="text-foreground">{profile.goal || 'Not set'}</strong></p>
                <p className="text-xs text-muted-foreground">Target: <strong className="text-foreground">{profile.targetSalary || 'Not set'}</strong></p>
              </div>
            )}

            <div>
              <p className="text-xs text-muted-foreground mb-2">Roast Style</p>
              <ToneSelector current={profile.tonePreference} onChange={handleToneChange} />
            </div>
            <div className="pt-2 border-t border-border flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-[3] gap-2"
                onClick={handleEnableNotifications}
              >
                {notificationsEnabled && isPushEnabled ? (
                  <>
                    <Bell className="w-4 h-4 text-green-500" />
                    Notifications Active
                  </>
                ) : (
                  <>
                    <BellOff className="w-4 h-4 text-roast" />
                    {notificationsEnabled ? 'Notifications Disabled' : 'Enable Push Notifications'}
                  </>
                )}
              </Button>
              {notificationsEnabled && isPushEnabled && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 px-0"
                  onClick={sendTestNotification}
                  title="Send Test Notification"
                >
                  <Send className="w-4 h-4" />
                </Button>
              )}
            </div>

            <div className="flex items-center justify-between py-2 border-t border-border mt-2">
              <div className="space-y-1">
                <Label className="text-xs flex items-center gap-1.5">
                  <Brain className="w-4 h-4 text-roast" />
                  AI Dynamic Roasts
                </Label>
                <p className="text-[10px] text-muted-foreground italic">Unlock personalized motivation</p>
              </div>
              <Switch 
                checked={profile.aiEnabled} 
                onCheckedChange={handleAIEnabledChange}
              />
            </div>

            {profile.aiEnabled && (
              <div className="space-y-2 pt-2 border-t border-border animate-slide-up">
                <div className="flex items-center justify-between">
                  <Label className="text-[10px] uppercase font-bold text-muted-foreground">Gemini API Key</Label>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={handleTestAI} 
                      disabled={isTestingAI}
                      className="text-[10px] h-6 px-2 hover:text-roast hover:bg-roast/10"
                    >
                      {isTestingAI ? 'Testing...' : 'Test Connection'}
                    </Button>
                    <a 
                      href="https://aistudio.google.com/app/apikey" 
                      target="_blank" 
                      rel="noreferrer"
                      className="text-[10px] text-roast hover:underline flex items-center gap-1"
                    >
                      <Info className="w-3 h-3" /> Get Key
                    </a>
                  </div>
                </div>
                <Input 
                  type="password"
                  placeholder="Enter your API Key..."
                  value={profile.aiApiKey || ''}
                  onChange={(e) => handleAIApiKeyChange(e.target.value)}
                  className="h-8 text-xs bg-secondary border-border"
                />
                <p className="text-[9px] text-muted-foreground">Your key is kept safe in your local browser storage.</p>
              </div>
            )}
            
            {(notificationsEnabled && isPushEnabled) && (
              <div className="space-y-3 pt-2 border-t border-border animate-slide-up">
                <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  <Clock className="w-3 h-3" />
                  <span>Auto-Roast Schedule</span>
                </div>
                <Select value={profile.notificationInterval} onValueChange={handleIntervalChange}>
                  <SelectTrigger className="w-full bg-secondary border-border text-xs h-8">
                    <SelectValue placeholder="Select interval" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="off">Disabled</SelectItem>
                    <SelectItem value="2min">Every 2 Minutes (Testing)</SelectItem>
                    <SelectItem value="5min">Every 5 Minutes</SelectItem>
                    <SelectItem value="10min">Every 10 Minutes</SelectItem>
                    <SelectItem value="1hour">Every Hour</SelectItem>
                    <SelectItem value="6hour">Every 6 Hours</SelectItem>
                    <SelectItem value="custom">Specific Daily Time</SelectItem>
                  </SelectContent>
                </Select>
                
                {profile.notificationInterval === 'custom' && (
                  <div className="flex items-center gap-2 animate-slide-up">
                    <Input 
                      type="time" 
                      value={profile.notificationTime} 
                      onChange={(e) => handleTimeChange(e.target.value)}
                      className="bg-secondary border-border h-8 text-xs"
                    />
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">Daily Reminder</span>
                  </div>
                )}
              </div>
            )}

            <div className="pt-2 border-t border-border">
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full text-xs text-muted-foreground hover:text-roast hover:bg-roast/10"
                onClick={handleResetProfile}
              >
                Reset Profile (Delete All Data)
              </Button>
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

        <ActivityChart data={activityData} />

        {/* Today's tasks */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Tasks</h2>
            <div className="flex items-center gap-2 bg-secondary/50 rounded-lg px-2 py-1">
              <Button variant="ghost" size="sm" onClick={handlePrevDay} className="h-6 w-6 p-0 hover:bg-roast/10 hover:text-roast active:scale-95 touch-manipulation">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-xs font-bold font-mono text-foreground min-w-[85px] text-center">
                {selectedDate === today ? 'TODAY' : selectedDate}
              </span>
              <Button variant="ghost" size="sm" onClick={handleNextDay} className="h-6 w-6 p-0 hover:bg-success/10 hover:text-success active:scale-95 touch-manipulation">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <AddTask onAdd={handleAddTask} />
          <TaskList tasks={tasks} onComplete={handleComplete} onMiss={handleMiss} onDelete={handleDelete} onReset={handleResetTask} />
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
