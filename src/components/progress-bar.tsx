'use client';

import { useTranslation } from 'react-i18next';
import { getMaxAllowedTable } from '@/lib/utils';
import { useTimer } from '@/lib/hooks/useTimer';
import { Difficulty } from '@/lib/constants';

interface ProgressBarProps {
  completedTables: Set<number>;
  difficulty: Difficulty;
  practiceMode: boolean;
  tableStartTime: number;
}

export function ProgressBar({ completedTables, difficulty, practiceMode, tableStartTime }: ProgressBarProps) {
  const { t } = useTranslation();
  const { formatDisplay } = useTimer(tableStartTime);
  const maxAllowed = getMaxAllowedTable(practiceMode, difficulty);
  const completedCount = Array.from({ length: maxAllowed }, (_, index) => index + 1)
    .filter((tableNumber) => completedTables.has(tableNumber)).length;
  const percentage = maxAllowed > 0 ? (completedCount / maxAllowed) * 100 : 0;

  return (
    <div className="progress-bar bg-card py-2 px-4 flex items-center gap-2.5 border-b-2 border-mist">
      <span className="progress-label font-display text-xs font-bold text-text-secondary whitespace-nowrap">
        {t('tables.page.mastered', { completed: completedCount, max: maxAllowed })}
      </span>
      <div className="progress-track flex-1 h-2 bg-mist rounded-full overflow-hidden">
        <div
          className="progress-fill h-full rounded-full transition-[width] duration-500 ease-out"
          style={{ width: `${percentage}%`, background: 'linear-gradient(90deg, var(--color-gold), var(--color-coral))' }}
        />
      </div>
      <span className="timer-display font-display text-[13px] text-text-secondary font-bold whitespace-nowrap">
        {formatDisplay}
      </span>
    </div>
  );
}
