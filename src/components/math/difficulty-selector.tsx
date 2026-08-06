'use client';

import { DifficultyLevel } from '@/lib/operations/types';

interface DifficultySelectorProps {
  operationEmoji: string;
  operationName: string;
  description: string;
  onSelect: (difficulty: DifficultyLevel) => void;
}

const DIFFICULTY_META: Record<DifficultyLevel, { title: string; desc: string; emoji: string }> = {
  easy: { title: 'Easy', desc: 'Simple numbers to start with', emoji: '🌟' },
  medium: { title: 'Medium', desc: 'Bigger numbers, new ideas', emoji: '⭐' },
  hard: { title: 'Hard', desc: 'Challenge yourself!', emoji: '🏆' },
};

export function DifficultySelector({ operationEmoji, operationName, description, onSelect }: DifficultySelectorProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 animate-[fade-in_0.3s_ease-out]">
      <h1 className="font-display text-[clamp(28px,6vw,36px)] text-ink mb-2 text-center">
        {operationEmoji} {operationName}
      </h1>
      <p className="font-body text-sm text-text-muted text-center max-w-[320px] mb-1 leading-[1.5]">
        {description}
      </p>
      <p className="font-body text-base text-text-tertiary mb-8 text-center">
        Choose Your Level! 🎯
      </p>
      <div className="flex flex-col gap-4 w-full max-w-[320px]">
        {(Object.entries(DIFFICULTY_META) as [DifficultyLevel, typeof DIFFICULTY_META['easy']][]).map(([level, meta]) => (
          <button
            key={level}
            onClick={() => onSelect(level)}
            className="font-display w-full rounded-2xl border-2 border-mist bg-card p-5 text-left cursor-pointer transition-colors duration-150 hover:border-coral hover:bg-card-hover hover:shadow-[0_4px_16px_rgba(255,107,82,0.15)] active:bg-card-active"
          >
            <div className="flex items-center gap-3">
              <span className="text-[32px]">{meta.emoji}</span>
              <div>
                <div className="text-lg text-ink font-bold">{meta.title}</div>
                <div className="text-sm text-text-muted font-body">{meta.desc}</div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
