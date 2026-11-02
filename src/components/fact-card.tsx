'use client';

import { useMemo, memo, type KeyboardEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { generateStoryText, toSpokenMath } from '@/lib/utils';

interface FactCardProps {
  groupCount: number;
  currentTable: number;
  isRevealed: boolean;
  isActive: boolean;
  onReveal: (cardKey: string) => void;
}

function FactCardInner({ groupCount, currentTable, isRevealed, isActive, onReveal }: FactCardProps) {
  const { t } = useTranslation();
  const cardKey = `${currentTable}x${groupCount}`;
  const answer = currentTable * groupCount;

  const storyHtml = useMemo(() => {
    if (!isActive || !isRevealed) return null;
    return generateStoryText(currentTable, groupCount, t);
  }, [currentTable, groupCount, isActive, isRevealed, t]);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onReveal(cardKey);
    }
  };

  return (
    <div className="fact-card-wrapper w-full">
      <div
        onClick={() => onReveal(cardKey)}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="button"
        aria-label={isRevealed
          ? t('tables.factCard.ariaRevealed', { table: currentTable, group: groupCount, answer })
          : t('tables.factCard.ariaUnrevealed', { table: currentTable, group: groupCount })}
        className={`fact-card-row w-full rounded-xl border-2 cursor-pointer transition-[background-color,border-color,box-shadow,color] duration-150 motion-reduce:transition-none min-h-[52px] flex items-center justify-between gap-3 px-5 py-2.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus
          ${isActive
            ? 'bg-coral/10 border-coral'
            : isRevealed
              ? 'bg-paper border-mist'
              : 'bg-card border-mist'
          }
          hover:border-coral hover:bg-card-hover active:scale-[0.97]`}
      >
        <span className="fact-equation font-display text-[clamp(15px,4vw,17px)] text-ink">
          {currentTable} × {groupCount} = ?
        </span>
        {isRevealed ? (
          <span className="fact-answer-shown text-[16px] text-growth-ink font-bold">✓ {answer}</span>
        ) : (
          <span className="fact-answer-hint text-sm text-text-muted font-bold">{t('tables.factCard.tapToReveal', 'Tap to reveal')}</span>
        )}
      </div>

      {storyHtml && (
        <div
          className="fact-explainer mt-1 text-[13px] leading-[1.7] text-text-primary bg-warm-bg rounded-[10px] p-[10px_14px] border-2 border-warm-border shadow-[var(--shadow-card)] animate-[popup-in_0.25s_ease-out] motion-reduce:animate-none [&_strong]:text-ink [&_strong]:font-bold"
          aria-label={toSpokenMath(storyHtml.replace(/<[^>]*>/g, ' '))}
          dangerouslySetInnerHTML={{ __html: storyHtml }}
        />
      )}
    </div>
  );
}

export const FactCard = memo(FactCardInner);
