'use client';

import { getMaxAllowedTable } from '@/lib/utils';
import { Difficulty } from '@/lib/constants';

interface ProgressBarProps {
  completedTables: Set<number>;
  difficulty: Difficulty;
  practiceMode: boolean;
  timerDisplay: string;
}

export function ProgressBar({ completedTables, difficulty, practiceMode, timerDisplay }: ProgressBarProps) {
  const maxAllowed = getMaxAllowedTable(practiceMode, difficulty);
  const completedCount = Array.from({ length: maxAllowed }, (_, index) => index + 1)
    .filter((tableNumber) => completedTables.has(tableNumber)).length;
  const percentage = maxAllowed > 0 ? (completedCount / maxAllowed) * 100 : 0;

  return (
    <div className="progress-bar bg-[#F0F0F0] py-2 px-4 flex items-center gap-2.5 border-b-2 border-[#E5E5E5]">
      <span className="progress-label font-display text-xs font-bold text-[#777] whitespace-nowrap">
        ⭐ {completedCount} / {maxAllowed} mastered
      </span>
      <div className="progress-track flex-1 h-2 bg-[#E2E8F0] rounded-full overflow-hidden">
        <div
          className="progress-fill h-full rounded-full transition-[width] duration-500 ease-out"
          style={{ width: `${percentage}%`, background: 'linear-gradient(90deg, #FBBF24, #F97316)' }}
        />
      </div>
      <span className="timer-display font-display text-[13px] text-[#777] font-bold whitespace-nowrap">
        {timerDisplay}
      </span>
    </div>
  );
}
