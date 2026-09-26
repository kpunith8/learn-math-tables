'use client';

import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { House, RotateCcw, BicepsFlexed } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MascotMessage } from '@/components/mascot-message';
import { OPERATION_META, type Operation } from '@/lib/operations/types';

interface PlaygroundShellProps {
  operation: Operation;
  accent: string;
  roundLabel: string;
  currentRound: number;
  totalRounds: number;
  hint: string;
  done: boolean;
  onReplay: () => void;
  onPractice: () => void;
  onHome: () => void;
  /** Standalone surfaces (e.g. tables) override the header title. */
  headerTitle?: string;
  children: ReactNode;
}

export function PlaygroundShell({
  operation,
  accent,
  roundLabel,
  currentRound,
  totalRounds,
  hint,
  done,
  onReplay,
  onPractice,
  onHome,
  headerTitle,
  children,
}: PlaygroundShellProps) {
  const { t } = useTranslation();
  const meta = OPERATION_META[operation];
  const metaName = headerTitle ?? t(`operations.meta.${operation}.name`, meta.name);

  return (
    <div
      className="font-body min-h-screen"
      style={{ background: `linear-gradient(180deg, ${accent}1f 0%, var(--color-paper) 34%)` }}
    >
      <div className="bg-header text-white px-3 py-2 sm:px-4 sm:py-3 flex items-center justify-between gap-1 flex-wrap">
        <div className="flex items-center gap-1">
          <button
            onClick={onHome}
            className="text-white/70 text-xl p-1.5 min-w-[44px] min-h-[44px] flex items-center justify-center hover:text-white transition-colors cursor-pointer"
            aria-label={t('common.aria.home', 'Home')}
          >
            <House className="w-6 h-6 text-white/80" strokeWidth={2} />
          </button>
          <span className="font-display text-base text-white p-1.5 min-h-[44px] flex items-center">
            {metaName}
          </span>
        </div>
      </div>

      <div className="flex justify-center gap-2 py-3" aria-label={roundLabel}>
        {Array.from({ length: totalRounds }, (_, i) => (
          <div
            key={i}
            className={`w-2.5 h-2.5 rounded-full transition-colors duration-200 ${
              i === currentRound && !done ? 'bg-coral' : i < currentRound || done ? 'bg-leaf' : 'bg-mist'
            }`}
          />
        ))}
      </div>

      <div className="flex flex-col items-center px-4 sm:px-6 pb-8">
        <p className="font-body text-xs text-text-dim mb-2" aria-live="polite">
          {roundLabel}
        </p>
        <MascotMessage message={hint} className="mb-4" />
        {children}

        <div className="mt-5 flex items-center justify-center gap-3 flex-wrap">
          <Button onClick={onReplay} variant="secondary" size="xl" data-testid="play-again">
            <RotateCcw className="w-4 h-4" />
            {done ? t('playground.playAgain') : t('playground.replay')}
          </Button>
          {done && (
            <Button onClick={onPractice} variant="indigo" size="xl" data-testid="play-to-practice">
              {t('playground.practiceCta')}
              <BicepsFlexed className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
