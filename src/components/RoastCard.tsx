import { Flame } from 'lucide-react';

interface RoastCardProps {
  message: string;
  onShare?: () => void;
}

const RoastCard = ({ message, onShare }: RoastCardProps) => {
  if (!message) return null;

  return (
    <div className="relative p-6 rounded-lg border border-roast/30 bg-roast/5 glow-roast animate-slide-up">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-full bg-roast/20">
          <Flame className="w-5 h-5 text-roast animate-pulse-glow" />
        </div>
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-roast mb-2">Today's Roast</p>
          <p className="text-lg font-semibold text-foreground leading-snug">"{message}"</p>
        </div>
      </div>
      {onShare && (
        <button
          onClick={onShare}
          className="mt-4 text-xs font-semibold uppercase tracking-wider text-roast hover:text-roast/80 transition-colors"
        >
          Share this roast 😭
        </button>
      )}
    </div>
  );
};

export default RoastCard;
