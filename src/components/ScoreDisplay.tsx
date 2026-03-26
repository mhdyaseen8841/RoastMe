import { getScoreComment } from '@/lib/roasts';
import { Target } from 'lucide-react';

interface ScoreDisplayProps {
  score: number;
}

const ScoreDisplay = ({ score }: ScoreDisplayProps) => {
  const comment = getScoreComment(score);
  const color = score >= 70 ? 'text-success' : score >= 40 ? 'text-streak' : 'text-roast';
  const barColor = score >= 70 ? 'bg-success' : score >= 40 ? 'bg-streak' : 'bg-roast';

  return (
    <div className="p-4 rounded-lg border border-border bg-secondary">
      <div className="flex items-center gap-3 mb-3">
        <Target className={`w-5 h-5 ${color}`} />
        <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Discipline Score</span>
      </div>
      <div className="flex items-baseline gap-2 mb-2">
        <span className={`text-4xl font-bold ${color}`}>{score}</span>
        <span className="text-lg text-muted-foreground">/100</span>
      </div>
      <div className="w-full h-2 rounded-full bg-muted mb-2">
        <div className={`h-full rounded-full transition-all duration-500 ${barColor}`} style={{ width: `${score}%` }} />
      </div>
      <p className="text-xs text-muted-foreground">{comment}</p>
    </div>
  );
};

export default ScoreDisplay;
