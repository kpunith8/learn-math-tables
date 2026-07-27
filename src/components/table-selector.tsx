'use client';

import { getMaxAllowedTable, isTableUnlocked } from '@/lib/utils';
import { Difficulty } from '@/lib/constants';

interface TableSelectorProps {
  currentTable: number;
  completedTables: Set<number>;
  difficulty: Difficulty;
  practiceMode: boolean;
  onSelectTable: (table: number) => void;
}

export function TableSelector({
  currentTable,
  completedTables,
  difficulty,
  practiceMode,
  onSelectTable,
}: TableSelectorProps) {
  const maxAllowed = getMaxAllowedTable(practiceMode, difficulty);

  return (
    <nav aria-label="Select a times table" className="table-selector flex gap-1.5 flex-wrap">
        {Array.from({ length: maxAllowed }, (_, i) => i + 1).map((tableNumber) => {
        const isUnlocked = isTableUnlocked(tableNumber, practiceMode, difficulty, completedTables);
        const isActive = tableNumber === currentTable;
        const isCompleted = completedTables.has(tableNumber);

        return (
          <button
            key={tableNumber}
            onClick={() => isUnlocked && onSelectTable(tableNumber)}
            disabled={!isUnlocked}
            className={`table-btn w-9 h-9 rounded-full border-[2.5px] font-display text-sm transition-all duration-150
              ${isActive
                ? 'active bg-[#4F46E5] text-white border-[#4F46E5] scale-110 shadow-[0_2px_8px_rgba(79,70,229,0.2)]'
                : isCompleted
                  ? 'completed bg-[#15803D] text-white border-[#15803D] shadow-[0_1px_4px_rgba(21,128,61,0.2)]'
                  : isUnlocked
                    ? 'unlocked bg-transparent text-[#64748B] border-[#CBD5E1] hover:scale-110 hover:bg-white/55 active:scale-90 shadow-[0_1px_4px_rgba(0,0,0,0.1)]'
                    : 'locked opacity-60 cursor-not-allowed border-dashed bg-white/10 border-white/40 text-white/60'
              }`}
            aria-label={`Table ${tableNumber}${!isUnlocked ? ' (locked)' : ''}`}
          >
            {isCompleted ? `✓` : tableNumber}
          </button>
        );
      })}
    </nav>
  );
}
