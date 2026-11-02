'use client';

import type { CSSProperties, ReactNode } from 'react';
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
      className="app-ground font-body min-h-screen"
      style={{ '--world': accent } as CSSProperties}
    >
      <div className="app-bar">
        <div className="app-bar-inner">
          <div className="flex items-center gap-1">
            <button
              onClick={onHome}
              className="app-bar-mark min-w-[44px] min-h-[44px] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-paper"
              aria-label={t('common.aria.home', 'Home')}
            >
              <House className="w-6 h-6 text-paper/80" strokeWidth={2} />
            </button>
            <span className="app-bar-title min-h-[44px] px-1.5 flex items-center">
              {metaName}
            </span>
          </div>
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
