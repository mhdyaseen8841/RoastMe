import { Zap } from 'lucide-react';
import { getStreakMessage } from '@/lib/roasts';

interface StreakDisplayProps {
  count: number;
}

const StreakDisplay = ({ count }: StreakDisplayProps) => {
  const message = getStreakMessage(count);

  return (
    <div className={`p-4 rounded-lg border ${count > 0 ? 'border-streak/30 bg-streak/5 glow-streak' : 'border-border bg-secondary'}`}>
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-full ${count > 0 ? 'bg-streak/20' : 'bg-muted'}`}>
          <Zap className={`w-5 h-5 ${count > 0 ? 'text-streak' : 'text-muted-foreground'}`} />
        </div>
        <div>
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-bold ${count > 0 ? 'text-streak' : 'text-muted-foreground'}`}>{count}</span>
            <span className="text-sm text-muted-foreground font-medium">day streak</span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{message}</p>
        </div>
      </div>
    </div>
  );
};

export default StreakDisplay;
