'use client';

import { useMemo, memo } from 'react';
import { generateStoryText } from '@/lib/utils';

interface FactCardProps {
  groupCount: number;
  currentTable: number;
  isRevealed: boolean;
  isActive: boolean;
  onReveal: (cardKey: string) => void;
}

function FactCardInner({ groupCount, currentTable, isRevealed, isActive, onReveal }: FactCardProps) {
  const cardKey = `${currentTable}x${groupCount}`;
  const answer = currentTable * groupCount;

  const storyHtml = useMemo(() => {
    if (!isActive || !isRevealed) return null;
    return generateStoryText(currentTable, groupCount);
  }, [currentTable, groupCount, isActive, isRevealed]);

  return (
    <div className="fact-card-wrapper w-full">
      <div
        onClick={() => onReveal(cardKey)}
        tabIndex={0}
        role="button"
        aria-label={`${currentTable} times ${groupCount}${isRevealed ? ` equals ${answer}` : ', tap to reveal'}`}
        className={`fact-card-row w-full rounded-xl border-2 cursor-pointer transition-all duration-150 min-h-[52px] flex items-center justify-between px-5 py-3.5
          ${isActive
            ? 'bg-[#EEF2FF] border-[#6366F1]'
            : isRevealed
              ? 'bg-[#F8F8F8] border-[#E2E8F0]'
              : 'bg-white border-[#E2E8F0]'
          }
          hover:border-[#6366F1] hover:bg-[#FAFAFA] active:scale-[0.97]`}
      >
        <span className="fact-equation font-display text-[clamp(15px,4vw,17px)] text-[#C2410C]">
          {currentTable} × {groupCount} = ?
        </span>
        {isRevealed ? (
          <span className="fact-answer-shown text-[16px] text-[#15803D] font-bold">✓ {answer}</span>
        ) : (
          <span className="fact-answer-hint text-sm text-[#64748B] font-bold">Tap to reveal</span>
        )}
      </div>

      {storyHtml && (
        <div
          className="fact-story-popup mt-1 text-[13px] leading-[1.7] text-[#334155] bg-[#FFF7ED] rounded-[10px] p-[10px_14px] border-2 border-[#E5E5E5] shadow-[0_4px_12px_rgba(0,0,0,0.08)] animate-[popup-in_0.25s_ease-out] [&_strong]:text-[#C2410C] [&_strong]:font-bold"
          dangerouslySetInnerHTML={{ __html: storyHtml }}
        />
      )}
    </div>
  );
}

export const FactCard = memo(FactCardInner);
