'use client';

import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';

interface MascotMessageProps {
  message: string;
  mood?: 'happy' | 'encouraging' | 'excited';
  className?: string;
}

const MASCOT = '🐉';
const MOOD_EMOJIS = { happy: '😊', encouraging: '💪', excited: '🎉' };

export function MascotMessage({ message, mood = 'happy', className = '' }: MascotMessageProps) {
  const { t } = useTranslation();
  return (
    <div
      className={`flex items-start gap-2.5 bg-warm-bg rounded-2xl p-3.5 border-[1.5px] border-warm-border max-w-[360px] ${className}`}
      role="status"
      aria-live="polite"
    >
      <span className="text-[28px] leading-none shrink-0" aria-hidden="true">{MASCOT}</span>
      <div className="flex-1 min-w-0">
        <p className="font-display text-sm text-ink font-semibold">
          {t('messages.mascot.speaksAs', { moodEmoji: MOOD_EMOJIS[mood] })}
        </p>
        <p className="font-body text-sm text-text-secondary mt-0.5">{message}</p>
      </div>
    </div>
  );
}

export const getMascotHint = (t: TFunction, operation?: string): string => {
  const pool = t(`messages.mascot.hints.${operation ?? 'general'}`, { returnObjects: true }) as unknown as string[];
  return pool && pool.length > 0
    ? pool[Math.floor(Math.random() * pool.length)]
    : 'You can do this! Every mistake helps you learn!';
};

export const getMascotCelebration = (t: TFunction): string => {
  const pool = t('messages.mascot.celebrations', { returnObjects: true }) as unknown as string[];
  return pool && pool.length > 0
    ? pool[Math.floor(Math.random() * pool.length)]
    : 'Amazing! You\'re getting so good at this!';
};
