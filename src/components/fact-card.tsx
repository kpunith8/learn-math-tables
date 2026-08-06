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
            ? 'bg-coral/10 border-coral'
            : isRevealed
              ? 'bg-paper border-mist'
              : 'bg-card border-mist'
          }
          hover:border-coral hover:bg-card-hover active:scale-[0.97]`}
      >
        <span className="fact-equation font-display text-[clamp(15px,4vw,17px)] text-castle">
          {currentTable} × {groupCount} = ?
        </span>
        {isRevealed ? (
          <span className="fact-answer-shown text-[16px] text-leaf font-bold">✓ {answer}</span>
        ) : (
          <span className="fact-answer-hint text-sm text-text-muted font-bold">Tap to reveal</span>
        )}
      </div>

      {storyHtml && (
        <div
          className="fact-explainer mt-1 text-[13px] leading-[1.7] text-text-primary bg-warm-bg rounded-[10px] p-[10px_14px] border-2 border-warm-border shadow-[0_4px_12px_rgba(0,0,0,0.08)] animate-[popup-in_0.25s_ease-out] [&_strong]:text-castle [&_strong]:font-bold"
          dangerouslySetInnerHTML={{ __html: storyHtml }}
        />
      )}
    </div>
  );
}

export const FactCard = memo(FactCardInner);
