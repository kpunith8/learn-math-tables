'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';

interface CelebrationMessageProps {
  size: 'small' | 'medium' | 'large';
  label?: string;
}

const CELEBRATION_CLASSES = {
  small: 'bg-green/10 border-green/30',
  medium: 'bg-indigo/10 border-indigo/30',
  large: 'bg-orange/10 border-orange/30',
} as const;

const CELEBRATION_ICONS = {
  small: '⭐',
  medium: '⭐⭐',
  large: '🎉🎊',
} as const;

export function CelebrationMessage({ size, label }: CelebrationMessageProps) {
  const { t } = useTranslation();
  const [message] = useState(() => {
    if (label) return label;
    const pool = t(`messages.celebration.${size}`, { returnObjects: true }) as unknown as string[];
    return pool && pool.length > 0
      ? pool[Math.floor(Math.random() * pool.length)]
      : '';
  });

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-xl border-2 px-4 py-2 ${CELEBRATION_CLASSES[size]}`}
      role="status"
      aria-live="polite"
    >
      <span className="text-lg" aria-hidden="true">{CELEBRATION_ICONS[size]}</span>
      <span className="font-display text-sm font-bold text-text-primary">{message}</span>
    </div>
  );
}

export const getWrongAnswerMessage = (t: TFunction): string => {
  const pool = t('messages.wrongAnswer', { returnObjects: true }) as unknown as string[];
  return pool && pool.length > 0
    ? pool[Math.floor(Math.random() * pool.length)]
    : 'Nice try! Let\'s solve it together.';
};

export const getEncouragementMessage = (t: TFunction): string => {
  const pool = t('messages.encouragement', { returnObjects: true }) as unknown as string[];
  return pool && pool.length > 0
    ? pool[Math.floor(Math.random() * pool.length)]
    : 'Keep going! You\'ve got this!';
};

export const getLevelUpMessage = (t: TFunction): string => {
  const pool = t('messages.levelUp', { returnObjects: true }) as unknown as string[];
  return pool && pool.length > 0
    ? pool[Math.floor(Math.random() * pool.length)]
    : 'You\'re leveling up your math skills!';
};
