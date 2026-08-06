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

const TABLE_HUES = [
  { solid: '#EA8A7C', pastel: '#FAE9E5', border: '#F0C2B8' }, // 1 rose
  { solid: '#E3B455', pastel: '#FAF0DC', border: '#EBD89E' }, // 2 gold
  { solid: '#71A887', pastel: '#E6F0EA', border: '#BFD6C8' }, // 3 green
  { solid: '#6FB8E8', pastel: '#E6F1FA', border: '#BBD9F0' }, // 4 sky
  { solid: '#9AA7DE', pastel: '#EDEFF9', border: '#C6CBEA' }, // 5 periwinkle
  { solid: '#B39CE0', pastel: '#F2EDFA', border: '#D5C8EC' }, // 6 violet
  { solid: '#E694C6', pastel: '#FAEDF5', border: '#EDC7DE' }, // 7 pink
  { solid: '#63B9AD', pastel: '#E1F2EF', border: '#BADBD5' }, // 8 teal
  { solid: '#B2C26B', pastel: '#F3F6E4', border: '#D6DFAB' }, // 9 lime
  { solid: '#E8A866', pastel: '#FAF1E0', border: '#EFD6AE' }, // 10 peach
  { solid: '#87C6E8', pastel: '#E9F4FB', border: '#C3E1F2' }, // 11 azure
  { solid: '#B692A8', pastel: '#F6EEF2', border: '#DCC9D4' }, // 12 plum
  { solid: '#D47B8E', pastel: '#F8E7EC', border: '#E6C2CD' }, // 13 raspberry
  { solid: '#7E9BC0', pastel: '#E9EEF4', border: '#C2D0E0' }, // 14 slate
  { solid: '#9AAB57', pastel: '#F0F3DE', border: '#D4DCAA' }, // 15 avocado
  { solid: '#D9A05B', pastel: '#F8EFE0', border: '#E9D3AC' }, // 16 amber
  { solid: '#C58CC4', pastel: '#F6EBF5', border: '#E4C9E3' }, // 17 orchid
  { solid: '#5FAD9B', pastel: '#E2F1ED', border: '#BEDDD4' }, // 18 jade
  { solid: '#82A7DC', pastel: '#E9EFF9', border: '#C6D5EF' }, // 19 cornflower
  { solid: '#C97A7A', pastel: '#F7E9E9', border: '#E5C6C6' }, // 20 rosewood
];

const getHue = (tableNumber: number) => TABLE_HUES[(tableNumber - 1) % TABLE_HUES.length];

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
        const hue = getHue(tableNumber);

        return (
          <button
            key={tableNumber}
            onClick={() => isUnlocked && onSelectTable(tableNumber)}
            disabled={!isUnlocked}
            aria-label={`Table ${tableNumber}${!isUnlocked ? ' (locked)' : ''}`}
            className="table-btn w-9 h-9 rounded-full border-[2.5px] font-display text-sm transition-all duration-150"
            style={
              isUnlocked
                ? isActive
                  ? { background: hue.solid, color: '#fff', borderColor: hue.solid, transform: 'scale(1.08)', boxShadow: `0 0 0 3px #fff, 0 0 0 4.5px ${hue.solid}, 0 3px 8px rgba(27,20,71,0.25)` }
                  : isCompleted
                    ? { background: hue.solid, color: '#fff', borderColor: hue.solid, boxShadow: `0 1px 4px rgba(0,0,0,0.15)` }
                    : { background: hue.pastel, color: '#2B2352', borderColor: hue.border, boxShadow: '0 1px 3px rgba(27,20,71,0.08)' }
                : { background: '#fff', color: 'rgba(27,20,71,0.4)', borderColor: '#DED7E8', borderStyle: 'dashed' }
            }
          >
            {isCompleted ? `✓` : tableNumber}
          </button>
        );
      })}
    </nav>
  );
}
