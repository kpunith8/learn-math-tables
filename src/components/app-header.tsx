'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useKindeBrowserClient } from '@kinde-oss/kinde-auth-nextjs';
import { LoginLink, LogoutLink } from '@kinde-oss/kinde-auth-nextjs/components';
import { House, LogIn, LogOut } from 'lucide-react';
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

const btnBase = 'font-display text-xs py-1.5 px-3.5 rounded-full border-2 cursor-pointer transition-all duration-150 min-h-[44px]';

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
          <House className="w-6 h-6 text-ink" strokeWidth={2} />
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
            <House className="w-6 h-6 text-ink" strokeWidth={2} />
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
          {isAuthenticated ? (
            <>
              <span
                className="inline-flex items-center justify-center font-display text-xs font-bold text-ink bg-white/80 border-2 border-[#DED5F0] rounded-full px-3 min-h-[44px] max-w-[140px] overflow-hidden text-ellipsis whitespace-nowrap"
                title={sessionName}
              >
                {sessionName}
              </span>
              <LogoutLink className={`${btnBase} inline-flex items-center justify-center gap-1.5 px-2.5 md:px-3.5 border-coral bg-coral text-white hover:bg-coral-hover`}>
                <LogOut className="w-4 h-4" />
                {t('common.auth.signOut')}
              </LogoutLink>
            </>
          ) : (
            !isLoading && (
              <LoginLink className={`${btnBase} inline-flex items-center justify-center gap-1.5 px-2.5 md:px-3.5 border-coral bg-coral text-white hover:bg-coral-hover`}>
                <LogIn className="w-4 h-4" />
                {t('common.auth.signIn')}
              </LoginLink>
            )
          )}
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
                <House className="w-6 h-6 text-ink" strokeWidth={2} />
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
              onClick={onShowLeaderboard}
              className={`drawer-scores ${btnBase} w-full text-center border-gold bg-gold text-ink hover:bg-kingdom`}
            >
              {t('header.scores')}
            </button>
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
            {isAuthenticated ? (
              <>
                <span
                  className="inline-flex items-center justify-center font-display text-sm font-bold text-ink bg-white/80 border-2 border-[#DED5F0] rounded-full px-4 min-h-[44px] max-w-full overflow-hidden text-ellipsis whitespace-nowrap"
                  title={sessionName}
                >
                  {sessionName}
                </span>
                <LogoutLink
                  onClick={closeMenu}
                  className={`drawer-logout ${btnBase} inline-flex items-center justify-center gap-1.5 w-full text-center border-coral bg-coral text-white hover:bg-coral-hover`}
                >
                  <LogOut className="w-4 h-4" />
                  {t('common.auth.signOut')}
                </LogoutLink>
              </>
            ) : (
              !isLoading && (
                <LoginLink
                  onClick={closeMenu}
                  className={`drawer-login ${btnBase} inline-flex items-center justify-center gap-1.5 w-full text-center border-coral bg-coral text-white hover:bg-coral-hover`}
                >
                  <LogIn className="w-4 h-4" />
                  {t('common.auth.signIn')}
                </LoginLink>
              )
            )}
          </aside>
      </div>
    </header>
  );
}
