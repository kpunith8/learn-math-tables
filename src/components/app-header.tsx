'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Difficulty } from '@/lib/constants';
import { TableSelector } from './table-selector';
import { LanguageSelector } from './language-selector';

interface AppHeaderProps {
  currentTable: number;
  completedTables: Set<number>;
  difficulty: Difficulty;
  practiceMode: boolean;
  playerName: string;
  isMuted: boolean;
  onSelectTable: (table: number) => void;
  onSetDifficulty: (level: Difficulty) => void;
  onTogglePractice: () => void;
  onShowLeaderboard: () => void;
  onShowPlayerName: () => void;
  onReset: () => void;
  onToggleMute: () => void;
  onHome?: () => void;
}

const btnBase = 'font-display text-xs py-1.5 px-3.5 rounded-full border-2 cursor-pointer transition-all duration-150 min-h-[44px]';

export function AppHeader({
  currentTable,
  completedTables,
  difficulty,
  practiceMode,
  playerName,
  isMuted,
  onSelectTable,
  onSetDifficulty,
  onTogglePractice,
  onShowLeaderboard,
  onShowPlayerName,
  onReset,
  onToggleMute,
  onHome,
}: AppHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t } = useTranslation();

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
    <header className="app-header bg-[#EFEBFB] border-b-2 border-[#DED5F0] px-3 py-2 md:p-4">
      {/* Mobile top row: title + home + hamburger */}
      <div className="flex md:hidden items-center gap-2 mb-2">
        <h1 className="font-display text-lg text-ink font-normal flex-1 leading-tight">
          {t('header.title')}
        </h1>
        <button
          onClick={onHome}
          className="text-ink/70 text-xl p-1.5 min-w-[44px] min-h-[44px] flex items-center justify-center hover:text-ink"
          aria-label={t('common.nav.home')}
        >
          🏠
        </button>
        <button
          onClick={() => setIsMenuOpen(true)}
          className="text-ink text-2xl p-1.5 min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label={t('common.nav.menu')}
        >
          ☰
        </button>
      </div>

      {/* Desktop top row */}
      <div className="hidden md:flex items-center justify-between flex-wrap gap-1.5 mb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={onHome}
            className="text-ink/70 text-xl p-1.5 min-w-[44px] min-h-[44px] flex items-center justify-center hover:text-ink transition-colors"
            aria-label={t('common.nav.home')}
          >
            🏠
          </button>
          <h1 className="font-display text-xl text-ink font-normal">
            {t('header.title')}
          </h1>
        </div>
        <div className="flex gap-1.5 items-center flex-wrap">
          <button
            onClick={onTogglePractice}
            aria-pressed={practiceMode}
            className={`${btnBase} px-2.5 md:px-3.5
              ${practiceMode
                ? 'bg-leaf border-leaf text-white shadow-[0_2px_8px_rgba(63,166,100,0.4)]'
                : 'bg-coral-soft border-coral-soft text-white hover:bg-coral-soft-hover active:scale-95'
              }`}
          >
            {t('header.practice')}
          </button>
          <button
            onClick={onShowLeaderboard}
            className={`${btnBase} px-2.5 md:px-3.5 border-gold bg-gold text-ink hover:bg-kingdom active:scale-95`}
          >
            {t('header.scores')}
          </button>
          <button
            onClick={onToggleMute}
            className={`${btnBase} px-2.5 md:px-3.5 border-[#DED5F0] bg-white/80 text-ink hover:bg-white active:scale-95`}
            aria-label={isMuted ? t('common.nav.unmute') : t('common.nav.mute')}
          >
            {isMuted ? '🔇' : '🔊'}
          </button>
          <button
            onClick={onShowPlayerName}
            className={`${btnBase} border-coral-soft bg-coral-soft text-white hover:bg-coral-soft-hover active:scale-95 max-w-[100px] overflow-hidden text-ellipsis whitespace-nowrap min-w-[44px]`}
          >
            {playerName || t('common.nav.addName')}
          </button>
          <LanguageSelector />
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
        <div className="difficulty-selector flex items-center gap-1 bg-white/70 py-1 px-2 rounded-full shadow-[inset_0_1px_3px_rgba(0,0,0,0.05)]">
          <span className="font-display text-[11px] text-ink/70 mr-0.5">{t('common.difficulty.label')}</span>
          {(['easy', 'normal', 'hard'] as Difficulty[]).map((level) => (
            <button
              key={level}
              onClick={() => onSetDifficulty(level)}
              aria-pressed={difficulty === level}
              className={`font-display text-[11px] py-[5px] px-3 rounded-full border-none cursor-pointer transition-all duration-150
                ${difficulty === level
                  ? 'bg-coral-soft text-white shadow-[0_2px_6px_rgba(244,124,107,0.3)]'
                  : 'bg-white text-ink/70 hover:bg-mist/60'
                }`}
            >
              {t(`common.difficulty.${level === 'normal' ? 'medium' : level}.title`)}
            </button>
          ))}
        </div>
        <button
          onClick={onReset}
          className={`${btnBase} flex items-center gap-1.5 border-[#DED5F0] bg-white/80 text-ink hover:bg-white active:scale-95`}
        >
          <span className="text-base leading-none" aria-hidden="true">↻</span> {t('header.resetLabel')}
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
          className={`drawer-panel absolute top-0 right-0 h-full w-[280px] bg-[#FDFCFF] border-l-2 border-[#DED5F0] shadow-2xl p-5 flex flex-col gap-4 overflow-y-auto transition-transform duration-300 ease-in-out ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
        >
            <div className="drawer-header flex justify-between items-center">
              <button
                onClick={() => { onHome?.(); closeMenu(); }}
                className="text-ink/70 text-xl p-1.5 min-w-[44px] min-h-[44px] flex items-center justify-center hover:text-ink transition-colors"
                aria-label={t('common.nav.home')}
              >
                🏠
              </button>
              <button
                onClick={closeMenu}
                className="drawer-close text-ink/70 text-2xl p-1 hover:text-ink"
                aria-label={t('common.nav.closeMenu')}
              >
                ✕
              </button>
            </div>
            <button
              onClick={() => { onShowPlayerName(); closeMenu(); }}
              className="drawer-avatar font-display text-xs py-3 px-4 rounded-xl border-2 border-coral-soft bg-coral-soft text-white cursor-pointer self-end hover:bg-coral-soft-hover max-w-full overflow-hidden text-ellipsis whitespace-nowrap"
            >
              {playerName || t('common.nav.addNameShort')}
            </button>
            <button
              onClick={() => { onTogglePractice(); closeMenu(); }}
              aria-pressed={practiceMode}
              className={`drawer-practice ${btnBase} w-full text-center
                ${practiceMode
                  ? 'bg-leaf border-leaf text-white shadow-[0_2px_8px_rgba(63,166,100,0.4)]'
                  : 'bg-coral-soft border-coral-soft text-white hover:bg-coral-soft-hover'
                }`}
            >
              {t('header.practice')}
            </button>
            <button
              onClick={() => { onShowLeaderboard(); closeMenu(); }}
              className={`drawer-scores ${btnBase} w-full text-center border-gold bg-gold text-ink hover:bg-kingdom`}
            >
              {t('header.scores')}
            </button>
            <div className="drawer-difficulty flex flex-col gap-2 pt-2 border-t border-[#E9E3F3]">
              <span className="font-display text-[11px] text-ink/70 uppercase tracking-wider">{t('header.drawer.difficulty')}</span>
              <div className="flex items-center gap-2">
                {(['easy', 'normal', 'hard'] as Difficulty[]).map((level) => (
                  <button
                    key={level}
                    onClick={() => { onSetDifficulty(level); closeMenu(); }}
                    aria-pressed={difficulty === level}
                    className={`flex-1 font-display text-[11px] py-[5px] px-3 rounded-full border-none cursor-pointer transition-all duration-150
                      ${difficulty === level
                        ? 'bg-coral-soft text-white shadow-[0_2px_6px_rgba(244,124,107,0.3)]'
                        : 'bg-white border-2 border-[#E9E3F3] text-ink/70 hover:bg-[#F3EFFB]'
                      }`}
                  >
                    {t(`common.difficulty.${level === 'normal' ? 'medium' : level}.title`)}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={() => { onReset(); closeMenu(); }}
              className={`drawer-reset ${btnBase} w-full text-center flex items-center justify-center gap-1.5 border-[#DED5F0] bg-white/80 text-ink hover:bg-white`}
            >
              <span className="text-base leading-none" aria-hidden="true">↻</span> {t('header.resetLabel')}
            </button>
            <button
              onClick={() => { onToggleMute(); closeMenu(); }}
              className={`drawer-mute ${btnBase} w-full text-center flex items-center justify-center gap-1.5 border-[#DED5F0] bg-white/80 text-ink hover:bg-white`}
            >
              {isMuted ? '🔇 ' + t('common.nav.unmute') : '🔊 ' + t('common.nav.mute')}
            </button>
            <LanguageSelector className="w-full justify-center" />
          </aside>
      </div>
    </header>
  );
}
