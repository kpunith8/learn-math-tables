'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useKindeBrowserClient } from '@kinde-oss/kinde-auth-nextjs';
import { LoginLink, LogoutLink } from '@kinde-oss/kinde-auth-nextjs/components';
import { House, LogIn, LogOut, Menu, RotateCcw, Target, Trophy, Volume2, VolumeX, X } from 'lucide-react';
import { Difficulty } from '@/lib/constants';
import { TableSelector } from './table-selector';

interface AppHeaderProps {
  currentTable: number;
  completedTables: Set<number>;
  difficulty: Difficulty;
  practiceMode: boolean;
  isMuted: boolean;
  onSelectTable: (table: number) => void;
  onTogglePractice: () => void;
  onShowLeaderboard: () => void;
  onReset: () => void;
  onToggleMute: () => void;
  onHome?: () => void;
}

const btnBase = 'font-display text-xs py-1.5 px-3.5 rounded-full border-2 cursor-pointer transition-all duration-150 min-h-[44px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus';

export function AppHeader({
  currentTable,
  completedTables,
  difficulty,
  practiceMode,
  isMuted,
  onSelectTable,
  onTogglePractice,
  onShowLeaderboard,
  onReset,
  onToggleMute,
  onHome,
}: AppHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t } = useTranslation();
  const { isAuthenticated, isLoading, user } = useKindeBrowserClient();
  const sessionName = user?.given_name || '';

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
    <>
    <header className="app-header app-bar py-2 md:py-3">
      {/* Mobile top row: title + home + hamburger */}
      <div className="app-width flex md:hidden items-center gap-2 mb-1">
        <h1 className="font-display text-lg text-paper flex-1 leading-tight">
          {t('header.title')}
        </h1>
        <button
          onClick={onHome}
          className="app-bar-mark min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
          aria-label={t('common.nav.home')}
        >
          <House className="w-6 h-6 text-paper/80" strokeWidth={2} />
        </button>
        <button
          onClick={() => setIsMenuOpen(true)}
          className="app-bar-mark min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
          aria-label={t('common.nav.menu')}
        >
          <Menu className="w-6 h-6 text-paper" strokeWidth={2} aria-hidden="true" />
        </button>
      </div>

      {/* Desktop top row */}
      <div className="app-width hidden md:flex items-center justify-between flex-wrap gap-1.5 mb-1">
        <div className="flex items-center gap-2">
          <button
            onClick={onHome}
            className="app-bar-mark min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
            aria-label={t('common.nav.home')}
          >
            <House className="w-6 h-6 text-paper/80" strokeWidth={2} />
          </button>
          <h1 className="font-display text-xl text-paper">
            {t('header.title')}
          </h1>
        </div>
        <div className="flex gap-1.5 items-center flex-wrap">
          <button
            onClick={onTogglePractice}
            aria-pressed={practiceMode}
            className={`${btnBase} inline-flex items-center gap-1.5 px-2.5 md:px-3.5
              ${practiceMode
                ? 'bg-leaf border-leaf text-ink shadow-[var(--shadow-card)]'
                : 'bg-coral-soft border-coral-soft text-ink hover:bg-coral-soft-hover active:scale-95'
              }`}
          >
            <Target className="w-4 h-4" aria-hidden="true" />
            {t('header.practice')}
          </button>
          <button
            onClick={onShowLeaderboard}
            className={`${btnBase} inline-flex items-center gap-1.5 px-2.5 md:px-3.5 border-gold bg-gold text-ink hover:bg-kingdom active:scale-95`}
          >
            <Trophy className="w-4 h-4" aria-hidden="true" />
            {t('header.scores')}
          </button>
          <button
            onClick={onToggleMute}
            className={`${btnBase} px-2.5 md:px-3.5 border-mist bg-card text-ink hover:bg-card hover:border-coral active:scale-95`}
            aria-label={isMuted ? t('common.nav.unmute') : t('common.nav.mute')}
          >
            {isMuted ? <VolumeX className="w-4 h-4" aria-hidden="true" /> : <Volume2 className="w-4 h-4" aria-hidden="true" />}
          </button>
          {isAuthenticated ? (
            <>
              <span
                className="inline-flex items-center justify-center font-display text-xs font-bold text-ink bg-card border-2 border-mist rounded-full px-3 min-h-[44px] max-w-[140px] overflow-hidden text-ellipsis whitespace-nowrap"
                title={sessionName}
              >
                {sessionName}
              </span>
              <LogoutLink className={`${btnBase} inline-flex items-center justify-center gap-1.5 px-2.5 md:px-3.5 border-coral bg-coral text-ink hover:bg-coral-hover`}>
                <LogOut className="w-4 h-4" />
                {t('common.auth.signOut')}
              </LogoutLink>
            </>
          ) : (
            !isLoading && (
              <LoginLink className={`${btnBase} inline-flex items-center justify-center gap-1.5 px-2.5 md:px-3.5 border-coral bg-coral text-ink hover:bg-coral-hover`}>
                <LogIn className="w-4 h-4" />
                {t('common.auth.signIn')}
              </LoginLink>
            )
          )}
        </div>
      </div>

      {/* Mobile drawer */}
      <div
        className={`drawer-container fixed inset-0 z-50 overflow-hidden ${isMenuOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
      >
        <div
          className={`drawer-overlay absolute inset-0 bg-black/50 transition-opacity duration-300 ease-in-out ${isMenuOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={closeMenu}
        />
        <aside
          className={`drawer-panel absolute top-0 right-0 h-full w-[min(280px,100vw)] bg-paper border-l-2 border-mist shadow-2xl p-5 flex flex-col gap-4 overflow-y-auto transition-[transform,visibility] duration-300 ease-in-out ${isMenuOpen ? 'translate-x-0 visible' : 'translate-x-full invisible'}`}
        >
            <div className="drawer-header flex justify-between items-center">
              <button
                onClick={() => { onHome?.(); closeMenu(); }}
                className="text-ink/70 p-1.5 min-w-[44px] min-h-[44px] flex items-center justify-center hover:text-ink transition-colors rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus active:bg-mist/60"
                aria-label={t('common.nav.home')}
              >
                <House className="w-6 h-6 text-ink" strokeWidth={2} />
              </button>
              <button
                onClick={closeMenu}
                className="drawer-close text-ink/70 p-2 hover:text-ink rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus active:bg-mist/60"
                aria-label={t('common.nav.closeMenu')}
              >
                <X className="w-5 h-5" strokeWidth={2.5} aria-hidden="true" />
              </button>
            </div>
            <button
              onClick={() => { onTogglePractice(); closeMenu(); }}
              aria-pressed={practiceMode}
              className={`drawer-practice ${btnBase} w-full text-center
                ${practiceMode
                  ? 'bg-leaf border-leaf text-ink shadow-[var(--shadow-card)]'
                  : 'bg-coral-soft border-coral-soft text-ink hover:bg-coral-soft-hover'
                }`}
            >
              {t('header.practice')}
            </button>
<button
              onClick={onShowLeaderboard}
              className={`drawer-scores ${btnBase} w-full text-center border-gold bg-gold text-ink hover:bg-kingdom`}
            >
              {t('header.scores')}
            </button>
            <button
              onClick={() => { onReset(); closeMenu(); }}
              className={`drawer-reset ${btnBase} w-full text-center flex items-center justify-center gap-1.5 border-mist bg-card text-ink hover:border-coral`}
            >
              <RotateCcw className="w-4 h-4" strokeWidth={2.5} aria-hidden="true" /> {t('header.resetLabel')}
            </button>
            <button
              onClick={() => { onToggleMute(); closeMenu(); }}
              className={`drawer-mute ${btnBase} w-full text-center flex items-center justify-center gap-1.5 border-mist bg-card text-ink hover:border-coral`}
            >
              {isMuted ? <VolumeX className="w-4 h-4" aria-hidden="true" /> : <Volume2 className="w-4 h-4" aria-hidden="true" />}
              {isMuted ? t('common.nav.unmute') : t('common.nav.mute')}
            </button>
            {isAuthenticated ? (
              <>
                <span
                  className="inline-flex items-center justify-center font-display text-sm font-bold text-ink bg-card border-2 border-mist rounded-full px-4 min-h-[44px] max-w-full overflow-hidden text-ellipsis whitespace-nowrap"
                  title={sessionName}
                >
                  {sessionName}
                </span>
                <LogoutLink
                  onClick={closeMenu}
                  className={`drawer-logout ${btnBase} inline-flex items-center justify-center gap-1.5 w-full text-center border-coral bg-coral text-ink hover:bg-coral-hover`}
                >
                  <LogOut className="w-4 h-4" />
                  {t('common.auth.signOut')}
                </LogoutLink>
              </>
            ) : (
              !isLoading && (
                <LoginLink
                  onClick={closeMenu}
                  className={`drawer-login ${btnBase} inline-flex items-center justify-center gap-1.5 w-full text-center border-coral bg-coral text-ink hover:bg-coral-hover`}
                >
                  <LogIn className="w-4 h-4" />
                  {t('common.auth.signIn')}
                </LoginLink>
              )
            )}
          </aside>
      </div>
    </header>

    {/* Table number strip — separate light section below the dark nav */}
    <div className="table-strip bg-paper-2 border-b-2 border-mist py-2 md:py-3">
      <div className="app-width">
      <div className="flex gap-1.5 flex-wrap items-center justify-center md:justify-start mb-1.5 md:mb-2.5">
        <TableSelector
          currentTable={currentTable}
          completedTables={completedTables}
          difficulty={difficulty}
          practiceMode={practiceMode}
          onSelectTable={onSelectTable}
        />
      </div>

      <div className="hidden md:flex items-center gap-2 flex-wrap justify-center md:justify-start">
        <button
          onClick={onReset}
          className={`${btnBase} flex items-center gap-1.5 border-mist bg-card text-ink hover:border-coral active:scale-95`}
        >
          <RotateCcw className="w-4 h-4" strokeWidth={2.5} aria-hidden="true" /> {t('header.resetLabel')}
        </button>
      </div>
      </div>
    </div>
    </>
  );
}
