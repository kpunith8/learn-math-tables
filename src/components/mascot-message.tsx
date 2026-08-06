'use client';

interface MascotMessageProps {
  message: string;
  mood?: 'happy' | 'encouraging' | 'excited';
  className?: string;
}

const MASCOT = '🐉';
const MOOD_EMOJIS = { happy: '😊', encouraging: '💪', excited: '🎉' };

export function MascotMessage({ message, mood = 'happy', className = '' }: MascotMessageProps) {
  return (
    <div
      className={`flex items-start gap-2.5 bg-warm-bg rounded-2xl p-3.5 border-[1.5px] border-warm-border max-w-[360px] ${className}`}
      role="status"
      aria-live="polite"
    >
      <span className="text-[28px] leading-none shrink-0" aria-hidden="true">{MASCOT}</span>
      <div className="flex-1 min-w-0">
        <p className="font-display text-sm text-ink font-semibold">
          Nova says {MOOD_EMOJIS[mood]}
        </p>
        <p className="font-body text-sm text-text-secondary mt-0.5">{message}</p>
      </div>
    </div>
  );
}

export const MASCOT_HINTS: Record<string, string[]> = {
  addition: [
    'Try counting all the objects together!',
    'Start with the bigger number and count up!',
    'Put the groups together and count everything!',
  ],
  subtraction: [
    'Count what\'s left after taking away!',
    'Start with the big number and count backward!',
    'Take away one at a time and keep count!',
  ],
  multiplication: [
    'Think about equal groups!',
    'Count the groups, then count the items in each group!',
    'Use skip counting — it\'s faster!',
  ],
  division: [
    'Try sharing equally!',
    'Give one to each group, then repeat!',
    'Think about how many are in each fair share!',
  ],
  general: [
    'You can do this! Every mistake helps you learn!',
    'Take your time — there\'s no rush!',
    'Math is about discovery, not speed!',
  ],
};

export const MASCOT_CELEBRATIONS = [
  'Amazing! You\'re getting so good at this!',
  'You discovered the answer all by yourself!',
  'That was fantastic thinking!',
  'You\'re a real Math Explorer!',
  'Nova is proud of you! Keep going!',
  'Brilliant! That\'s how math champions do it!',
];

export function getMascotHint(operation?: string): string {
  const hints = operation ? MASCOT_HINTS[operation] ?? MASCOT_HINTS.general : MASCOT_HINTS.general;
  return hints[Math.floor(Math.random() * hints.length)];
}

export function getMascotCelebration(): string {
  return MASCOT_CELEBRATIONS[Math.floor(Math.random() * MASCOT_CELEBRATIONS.length)];
}
