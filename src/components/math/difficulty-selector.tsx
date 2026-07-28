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
    <div className="difficulty-select flex flex-col items-center justify-center min-h-screen p-6 animate-[fade-in_0.3s_ease-out]">
      <h1 className="difficulty-title font-display text-[clamp(28px,6vw,36px)] text-[#C2410C] mb-2 text-center">
        {operationEmoji} {operationName}
      </h1>
      <p className="difficulty-description font-body text-sm text-[#888] text-center max-w-[320px] mb-1 leading-[1.5]">
        {description}
      </p>
      <p className="difficulty-prompt font-body text-base text-[#777] mb-8 text-center">
        Choose Your Level! 🎯
      </p>
      <div className="flex flex-col gap-4 w-full max-w-[320px]">
        {(Object.entries(DIFFICULTY_META) as [DifficultyLevel, typeof DIFFICULTY_META['easy']][]).map(([level, meta]) => (
          <button
            key={level}
            onClick={() => onSelect(level)}
            className="difficulty-card font-display w-full rounded-2xl border-2 border-[#E2E8F0] bg-white p-5 text-left cursor-pointer transition-colors duration-150 hover:border-[#6366F1] hover:bg-[#FAFAFA] hover:shadow-[0_4px_16px_rgba(99,102,241,0.15)] active:bg-[#F0F0F0]"
          >
            <div className="flex items-center gap-3">
              <span className="text-[32px]">{meta.emoji}</span>
              <div>
                <div className="text-lg text-[#333] font-bold">{meta.title}</div>
                <div className="text-sm text-[#888] font-body">{meta.desc}</div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
