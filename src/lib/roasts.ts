import type { TonePreference, UserProfile } from '@/types';
import { generateAIRoast } from './ai';

interface RoastTemplate {
  message: string;
  tone: TonePreference;
  category: 'missed' | 'streak_broken' | 'low_score' | 'general' | 'goal';
}

const roastTemplates: RoastTemplate[] = [
  // SAVAGE
  { message: "Bro opened Instagram but not his career.", tone: "savage", category: "missed" },
  { message: "Your car is still a dream because you're still sleeping.", tone: "savage", category: "missed" },
  { message: "Consistency left the chat… just like your discipline.", tone: "savage", category: "missed" },
  { message: "You're not lazy, you're just committed to failure.", tone: "savage", category: "missed" },
  { message: "Your future called. It hung up.", tone: "savage", category: "missed" },
  { message: "Even your alarm clock gave up on you.", tone: "savage", category: "missed" },
  { message: "Netflix doesn't count as 'research'.", tone: "savage", category: "missed" },
  { message: "You have WiFi, YouTube, and free tutorials. What's your excuse?", tone: "savage", category: "missed" },
  { message: "Your potential is rotting. Can you smell it?", tone: "savage", category: "missed" },
  { message: "Another day, another excuse. You're getting really good at those.", tone: "savage", category: "missed" },
  { message: "Back to zero. Just like your excuses.", tone: "savage", category: "streak_broken" },
  { message: "Streak broken. Your discipline has the lifespan of a mayfly.", tone: "savage", category: "streak_broken" },
  { message: "You had momentum. HAD.", tone: "savage", category: "streak_broken" },
  { message: "Score this low? Even autocorrect can't fix your life.", tone: "savage", category: "low_score" },

  // FUNNY
  { message: "Still scrolling? Your future is not loading.", tone: "funny", category: "missed" },
  { message: "You had time for reels, but not your goals?", tone: "funny", category: "missed" },
  { message: "Your to-do list is crying in the corner right now.", tone: "funny", category: "missed" },
  { message: "Procrastination Level: Expert. Career Level: Beginner.", tone: "funny", category: "missed" },
  { message: "Your bed isn't your office. We checked.", tone: "funny", category: "missed" },
  { message: "Plot twist: Success requires actual work.", tone: "funny", category: "missed" },
  { message: "Your streak died. Sending thoughts and prayers. 🙏", tone: "funny", category: "streak_broken" },
  { message: "The streak is gone. Like your motivation after lunch.", tone: "funny", category: "streak_broken" },
  { message: "Your discipline score is lower than your phone battery.", tone: "funny", category: "low_score" },
  { message: "If laziness was a sport, you'd finally be an athlete.", tone: "funny", category: "general" },

  // SARCASTIC
  { message: "Oh wow, you missed another task. Shocking. Truly unprecedented.", tone: "sarcastic", category: "missed" },
  { message: "I'm sure those 3 hours of scrolling were very productive.", tone: "sarcastic", category: "missed" },
  { message: "Great job doing absolutely nothing today. Real impressive.", tone: "sarcastic", category: "missed" },
  { message: "Sure, skip the work. The universe will just hand you success.", tone: "sarcastic", category: "missed" },
  { message: "Another task ignored. Your consistency at being inconsistent is remarkable.", tone: "sarcastic", category: "missed" },
  { message: "Oh no, the streak broke. Who could have predicted this?", tone: "sarcastic", category: "streak_broken" },
  { message: "Wow, a low score. You must be SO surprised right now.", tone: "sarcastic", category: "low_score" },
  { message: "Yes, definitely keep planning and never executing. That always works.", tone: "sarcastic", category: "general" },
  { message: "Your goals are very impressed with your zero effort today.", tone: "sarcastic", category: "general" },
  { message: "Please, take another break. You've earned it. /s", tone: "sarcastic", category: "general" },
];

// Goal-specific roast templates (use {goal} and {salary} placeholders)
const goalRoasts: { message: string; tone: TonePreference }[] = [
  { message: "No progress = no {goal}. Still chilling?", tone: "savage" },
  { message: "That {goal}? It's laughing at your work ethic right now.", tone: "savage" },
  { message: "{goal} costs money. Money requires work. Work requires YOU to move.", tone: "savage" },
  { message: "At this rate, you'll get that {goal} in approximately... never.", tone: "sarcastic" },
  { message: "The {goal} is out there. And you're in here. Doing nothing.", tone: "funny" },
  { message: "{salary}? You can't even complete a to-do list.", tone: "savage" },
];

const streakMessages: Record<string, { min: number; message: string }[]> = {
  positive: [
    { min: 3, message: "3 days strong. Don't get comfortable." },
    { min: 5, message: "You're dangerous now. 🔥" },
    { min: 7, message: "A full week? Who are you?!" },
    { min: 14, message: "2 weeks. You're actually becoming someone." },
    { min: 30, message: "30 days. Unstoppable. 👑" },
  ],
};

export function getRoast(
  tone: TonePreference,
  category: RoastTemplate['category'],
  goal?: string,
  salary?: string
): string {
  // Try goal-specific roast first
  if (goal && Math.random() > 0.5) {
    const goalOptions = goalRoasts.filter(r => r.tone === tone);
    if (goalOptions.length > 0) {
      const pick = goalOptions[Math.floor(Math.random() * goalOptions.length)];
      return pick.message.replace('{goal}', goal).replace('{salary}', salary || 'your dream salary');
    }
  }

  const options = roastTemplates.filter(r => r.tone === tone && r.category === category);
  if (options.length === 0) {
    const fallback = roastTemplates.filter(r => r.tone === tone);
    return fallback[Math.floor(Math.random() * fallback.length)].message;
  }
  return options[Math.floor(Math.random() * options.length)].message;
}

export function getStreakMessage(count: number): string {
  if (count === 0) return "No streak. No glory.";
  const msgs = streakMessages.positive;
  let best = msgs[0];
  for (const m of msgs) {
    if (count >= m.min) best = m;
  }
  return best.message;
}

export function getScoreComment(score: number): string {
  if (score >= 90) return "Almost perfect. Suspiciously good.";
  if (score >= 70) return "Not bad. But 'not bad' isn't great.";
  if (score >= 50) return "Mediocre. Just like yesterday.";
  if (score >= 30) return "Embarrassing. Do better.";
  return "Pathetic. Your future is buffering.";
}

export async function getDynamicRoast(
  profile: UserProfile,
  category: RoastTemplate['category']
): Promise<string> {
  const situation = `User has ${category} their productivity goals.`;
  
  if (profile.aiEnabled && profile.aiApiKey) {
    try {
      return await generateAIRoast(
        profile.aiApiKey,
        situation,
        profile.goal,
        profile.tonePreference
      );
    } catch (error) {
      console.error("AI Roast failed, falling back to hardcoded:", error);
    }
  }

  return getRoast(profile.tonePreference, category, profile.goal, profile.targetSalary);
}
