'use client';

import { Difficulty } from '@/lib/constants';
import { TableSelector } from './table-selector';

interface AppHeaderProps {
  currentTable: number;
  completedTables: Set<number>;
  difficulty: Difficulty;
  practiceMode: boolean;
  playerName: string;
  onSelectTable: (table: number) => void;
  onSetDifficulty: (level: Difficulty) => void;
  onTogglePractice: () => void;
  onShowLeaderboard: () => void;
  onShowPlayerName: () => void;
  onReset: () => void;
}

export function AppHeader({
  currentTable,
  completedTables,
  difficulty,
  practiceMode,
  playerName,
  onSelectTable,
  onSetDifficulty,
  onTogglePractice,
  onShowLeaderboard,
  onShowPlayerName,
  onReset,
}: AppHeaderProps) {
  return (
    <header className="app-header bg-[#1E293B] p-3 md:p-4">
      <div className="header-top flex items-center justify-between flex-wrap gap-2.5 mb-3">
        <h1 className="header-title font-display text-xl text-white font-normal">
          📖 Multiplication Tables Adventure!
        </h1>
        <div className="header-actions flex gap-2 items-center flex-wrap">
          <button
            onClick={onTogglePractice}
            aria-pressed={practiceMode}
            className={`practice-btn font-display text-xs py-1.5 px-3.5 rounded-full border-2 transition-all duration-150 cursor-pointer
              ${practiceMode
                ? 'bg-[#27ae60] border-[#27ae60] text-white shadow-[0_2px_8px_rgba(39,174,96,0.4)]'
                : 'bg-[#4F46E5] border-[#4F46E5] text-white hover:bg-[#4338CA] active:scale-95'
              }`}
          >
            🎯 Practice
          </button>
          <button
            onClick={onShowLeaderboard}
            className="scores-btn font-display text-xs py-1.5 px-3.5 rounded-full border-2 border-[#B45309] bg-[#B45309] text-white cursor-pointer transition-all duration-150 hover:bg-[#92400E] active:scale-95"
          >
            🏆 Scores
          </button>
          <button
            onClick={onShowPlayerName}
            className="player-name-btn font-display text-xs py-1.5 px-3.5 rounded-full border-2 border-[#334155] bg-[#334155] text-[#F1F5F9] cursor-pointer transition-all duration-150 max-w-[100px] overflow-hidden text-ellipsis whitespace-nowrap hover:bg-[#1E293B] active:scale-95"
          >
            {playerName || 'Add Name'}
          </button>
        </div>
      </div>
      <div className="header-bottom flex flex-col gap-2.5">
        <div className="table-selector-row flex gap-1.5 flex-wrap items-center justify-center md:justify-start">
          <TableSelector
            currentTable={currentTable}
            completedTables={completedTables}
            difficulty={difficulty}
            practiceMode={practiceMode}
            onSelectTable={onSelectTable}
          />
        </div>
        <div className="difficulty-row flex items-center gap-2 flex-wrap justify-center md:justify-start">
          <div className="difficulty-selector flex items-center gap-1 bg-[#334155] py-1 px-2 rounded-full shadow-[inset_0_1px_3px_rgba(0,0,0,0.1)]">
            <span className="difficulty-label font-display text-[11px] text-white/80 mr-0.5">
              Difficulty:
            </span>
            {(['easy', 'normal', 'hard'] as Difficulty[]).map((level) => (
              <button
                key={level}
                onClick={() => onSetDifficulty(level)}
                aria-pressed={difficulty === level}
                className={`difficulty-btn font-display text-[11px] py-[5px] px-3 rounded-full border-none cursor-pointer transition-all duration-150
                  ${difficulty === level
                    ? 'bg-white text-[#4F46E5] shadow-[0_2px_6px_rgba(0,0,0,0.15)]'
                    : 'bg-white/10 text-white hover:bg-white/25'
                  }`}
              >
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </button>
            ))}
          </div>
          <button
            onClick={onReset}
            className="reset-btn flex items-center gap-1 py-1.5 px-3.5 rounded-full border-2 border-transparent bg-[#475569] text-white font-display text-xs cursor-pointer transition-all duration-150 hover:bg-[#64748B] active:scale-95"
          >
            <span aria-hidden="true">↻</span> Reset
          </button>
        </div>
      </div>
    </header>
  );
}
