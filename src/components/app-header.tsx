'use client';

import { useState, useEffect } from 'react';
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

const btnBase = 'font-display text-xs py-1.5 px-3.5 rounded-full border-2 cursor-pointer transition-all duration-150 min-h-[44px]';

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
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const closeMenu = () => setIsMenuOpen(false);

  useEffect(() => {
    if (!isMenuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMenu();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isMenuOpen]);

  return (
    <header className="app-header bg-[#1E293B] px-3 py-2 md:p-4">
      {/* Mobile top row: title + hamburger */}
      <div className="flex md:hidden items-center gap-2 mb-2">
        <h1 className="font-display text-lg text-white font-normal flex-1 leading-tight">
          📖 Multiplication Adventure!
        </h1>
        <button
          onClick={() => setIsMenuOpen(true)}
          className="text-white text-2xl p-1.5 min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="Open menu"
        >
          ☰
        </button>
      </div>

      {/* Desktop top row */}
      <div className="hidden md:flex items-center justify-between flex-wrap gap-1.5 mb-3">
        <h1 className="font-display text-xl text-white font-normal">
          📖 Multiplication Tables Adventure!
        </h1>
        <div className="flex gap-1.5 items-center flex-wrap">
          <button
            onClick={onTogglePractice}
            aria-pressed={practiceMode}
            className={`${btnBase} px-2.5 md:px-3.5
              ${practiceMode
                ? 'bg-[#27ae60] border-[#27ae60] text-white shadow-[0_2px_8px_rgba(39,174,96,0.4)]'
                : 'bg-[#4F46E5] border-[#4F46E5] text-white hover:bg-[#4338CA] active:scale-95'
              }`}
          >
            🎯 Practice
          </button>
          <button
            onClick={onShowLeaderboard}
            className={`${btnBase} px-2.5 md:px-3.5 border-[#B45309] bg-[#B45309] text-white hover:bg-[#92400E] active:scale-95`}
          >
            🏆 Scores
          </button>
          <button
            onClick={onShowPlayerName}
            className={`${btnBase} border-[#6366F1] bg-[#6366F1] text-white hover:bg-[#4F46E5] active:scale-95 max-w-[100px] overflow-hidden text-ellipsis whitespace-nowrap min-w-[44px]`}
          >
            {playerName || 'Add Name'}
          </button>
        </div>
      </div>

      {/* Table selector — always visible */}
      <div className="flex gap-1.5 flex-wrap items-center justify-center md:justify-start mb-1.5 md:mb-2.5">
        <TableSelector
          currentTable={currentTable}
          completedTables={completedTables}
          difficulty={difficulty}
          practiceMode={practiceMode}
          onSelectTable={onSelectTable}
        />
      </div>

      {/* Desktop difficulty row */}
      <div className="hidden md:flex items-center gap-2 flex-wrap justify-center md:justify-start">
        <div className="difficulty-selector flex items-center gap-1 bg-[#334155] py-1 px-2 rounded-full shadow-[inset_0_1px_3px_rgba(0,0,0,0.1)]">
          <span className="font-display text-[11px] text-white/80 mr-0.5">Difficulty:</span>
          {(['easy', 'normal', 'hard'] as Difficulty[]).map((level) => (
            <button
              key={level}
              onClick={() => onSetDifficulty(level)}
              aria-pressed={difficulty === level}
              className={`font-display text-[11px] py-[5px] px-3 rounded-full border-none cursor-pointer transition-all duration-150
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
          className={`${btnBase} flex items-center gap-1 bg-[#475569] text-white hover:bg-[#64748B] active:scale-95`}
        >
          <span aria-hidden="true">↻</span> Reset
        </button>
      </div>

      {/* Mobile drawer */}
      <div
        className={`drawer-container fixed inset-0 z-50 ${isMenuOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
      >
        <div
          className={`drawer-overlay absolute inset-0 bg-black/50 transition-opacity duration-300 ease-in-out ${isMenuOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={closeMenu}
        />
        <aside
          className={`drawer-panel absolute top-0 right-0 h-full w-[280px] bg-[#1E293B] shadow-2xl p-5 flex flex-col gap-4 overflow-y-auto transition-transform duration-300 ease-in-out ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
        >
            <div className="drawer-header flex justify-end">
              <button
                onClick={closeMenu}
                className="drawer-close text-white/70 text-2xl p-1 hover:text-white"
                aria-label="Close menu"
              >
                ✕
              </button>
            </div>
            <button
              onClick={() => { onShowPlayerName(); closeMenu(); }}
              className="drawer-avatar font-display text-xs py-3 px-4 rounded-xl border-2 border-[#6366F1] bg-[#6366F1] text-white cursor-pointer self-end hover:bg-[#4F46E5] max-w-full overflow-hidden text-ellipsis whitespace-nowrap"
            >
              {playerName || '👤 Add Name'}
            </button>
            <button
              onClick={() => { onTogglePractice(); closeMenu(); }}
              aria-pressed={practiceMode}
              className={`drawer-practice ${btnBase} w-full text-center
                ${practiceMode
                  ? 'bg-[#27ae60] border-[#27ae60] text-white shadow-[0_2px_8px_rgba(39,174,96,0.4)]'
                  : 'bg-[#4F46E5] border-[#4F46E5] text-white hover:bg-[#4338CA]'
                }`}
            >
              🎯 Practice
            </button>
            <button
              onClick={() => { onShowLeaderboard(); closeMenu(); }}
              className={`drawer-scores ${btnBase} w-full text-center border-[#B45309] bg-[#B45309] text-white hover:bg-[#92400E]`}
            >
              🏆 Scores
            </button>
            <div className="drawer-difficulty flex flex-col gap-2 pt-2 border-t border-white/10">
              <span className="font-display text-[11px] text-white/60 uppercase tracking-wider">Difficulty</span>
              <div className="flex items-center gap-2">
                {(['easy', 'normal', 'hard'] as Difficulty[]).map((level) => (
                  <button
                    key={level}
                    onClick={() => { onSetDifficulty(level); closeMenu(); }}
                    aria-pressed={difficulty === level}
                    className={`flex-1 font-display text-[11px] py-[5px] px-3 rounded-full border-none cursor-pointer transition-all duration-150
                      ${difficulty === level
                        ? 'bg-white text-[#4F46E5] shadow-[0_2px_6px_rgba(0,0,0,0.15)]'
                        : 'bg-white/10 text-white hover:bg-white/25'
                      }`}
                  >
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={() => { onReset(); closeMenu(); }}
              className={`drawer-reset ${btnBase} w-full text-center flex items-center justify-center gap-1 bg-[#475569] text-white hover:bg-[#64748B]`}
            >
              <span aria-hidden="true">↻</span> Reset
            </button>
          </aside>
      </div>
    </header>
  );
}
