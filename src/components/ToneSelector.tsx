import type { TonePreference } from '@/types';

interface ToneSelectorProps {
  current: TonePreference;
  onChange: (tone: TonePreference) => void;
}

const tones: { value: TonePreference; label: string; emoji: string; desc: string }[] = [
  { value: 'savage', label: 'Savage', emoji: '💀', desc: 'Brutally honest' },
  { value: 'funny', label: 'Funny', emoji: '😂', desc: 'Light humor' },
  { value: 'sarcastic', label: 'Sarcastic', emoji: '🙄', desc: 'Smart & cutting' },
];

const ToneSelector = ({ current, onChange }: ToneSelectorProps) => {
  return (
    <div className="flex gap-2">
      {tones.map((tone) => (
        <button
          key={tone.value}
          onClick={() => onChange(tone.value)}
          className={`flex-1 p-3 rounded-lg border text-center transition-all ${
            current === tone.value
              ? 'border-primary bg-primary/10 glow-primary'
              : 'border-border bg-secondary hover:border-muted-foreground'
          }`}
        >
          <div className="text-xl mb-1">{tone.emoji}</div>
          <div className={`text-xs font-semibold ${current === tone.value ? 'text-primary' : 'text-muted-foreground'}`}>
            {tone.label}
          </div>
        </button>
      ))}
    </div>
  );
};

export default ToneSelector;
