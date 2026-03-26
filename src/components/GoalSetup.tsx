import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import ToneSelector from '@/components/ToneSelector';
import type { TonePreference, UserProfile } from '@/types';
import { Flame } from 'lucide-react';

interface GoalSetupProps {
  onComplete: (profile: Partial<UserProfile>) => void;
}

const GoalSetup = ({ onComplete }: GoalSetupProps) => {
  const [goal, setGoal] = useState('');
  const [salary, setSalary] = useState('');
  const [tone, setTone] = useState<TonePreference>('savage');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete({
      goal: goal.trim() || 'Success',
      targetSalary: salary.trim(),
      tonePreference: tone,
      onboardingDone: true,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md space-y-8 animate-slide-up">
        <div className="text-center">
          <div className="inline-flex p-3 rounded-full bg-roast/10 mb-4">
            <Flame className="w-8 h-8 text-roast" />
          </div>
          <h1 className="text-3xl font-bold text-gradient-fire mb-2">Roast Me Productivity</h1>
          <p className="text-muted-foreground">The app that bullies you into success.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
              Your Main Goal
            </label>
            <Input
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="e.g. Buy a car, Land a $100k job"
              className="bg-secondary border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
              Target Salary
            </label>
            <Input
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
              placeholder="e.g. $100,000"
              className="bg-secondary border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
              Roast Style
            </label>
            <ToneSelector current={tone} onChange={setTone} />
          </div>

          <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/80 glow-primary text-lg py-6 font-bold">
            Let's Go. Roast Me. 🔥
          </Button>
        </form>
      </div>
    </div>
  );
};

export default GoalSetup;
