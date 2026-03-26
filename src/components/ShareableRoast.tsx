import { useRef } from 'react';
import { Flame, Download, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ShareableRoastProps {
  message: string;
  score: number;
  streak: number;
  onClose: () => void;
}

const ShareableRoast = ({ message, score, streak, onClose }: ShareableRoastProps) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleCopy = () => {
    const text = `🔥 Today's Roast from Roast Me Productivity:\n\n"${message}"\n\n📊 Score: ${score}/100 | 🔥 Streak: ${streak} days\n\nGet roasted: roastmeproductivity.app`;
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="w-full max-w-sm animate-slide-up" onClick={e => e.stopPropagation()}>
        <div ref={cardRef} className="p-6 rounded-xl border border-roast/30 bg-card glow-roast">
          <div className="flex items-center gap-2 mb-4">
            <Flame className="w-5 h-5 text-roast" />
            <span className="text-sm font-bold text-gradient-fire">ROAST ME PRODUCTIVITY</span>
          </div>
          <p className="text-lg font-semibold text-foreground mb-6 leading-relaxed">"{message}"</p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>📊 Score: <strong className="text-foreground">{score}/100</strong></span>
            <span>🔥 Streak: <strong className="text-foreground">{streak} days</strong></span>
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <Button onClick={handleCopy} variant="outline" className="flex-1 border-border text-foreground">
            <Share2 className="w-4 h-4 mr-2" /> Copy Text
          </Button>
          <Button onClick={onClose} variant="ghost" className="text-muted-foreground">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ShareableRoast;
