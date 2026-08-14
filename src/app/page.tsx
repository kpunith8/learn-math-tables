'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import { useTranslation, Trans } from 'react-i18next';
import { useKindeBrowserClient } from '@kinde-oss/kinde-auth-nextjs';
import { LoginLink, LogoutLink } from '@kinde-oss/kinde-auth-nextjs/components';
import { LogIn, LogOut, User, ArrowRight, Check } from 'lucide-react';
import { useAppContext } from '@/lib/contexts/AppContext';
import { useEngineState } from '@/lib/hooks/useEngineState';
import { NameModal } from '@/components/name-modal';
import { LanguageSelector } from '@/components/language-selector';
import { UniversalDifficultySelector } from '@/components/universal-difficulty-selector';

import { getStarsToNextMilestone, isOperationFullyCompleted } from '@/lib/engines/star-economy';

const TRAIL = [
  { id: 'addition' as const, emoji: '🏝️', route: '/addition', accent: '#4FA8F5' },
  { id: 'subtraction' as const, emoji: '🏞️', route: '/subtraction', accent: '#57C278' },
  { id: 'multiplication' as const, emoji: '⛰️', route: '/multiplication', accent: '#7E8CD9' },
  { id: 'division' as const, emoji: '🏰', route: '/division', accent: '#FF7A59' },
  { id: 'tables' as const, emoji: '👑', route: '/tables', accent: '#F5AB3C' },
];

export default function LandingPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { isAuthenticated, isLoading, user } = useKindeBrowserClient();
  const { state, setPlayerName } = useAppContext();
  const { engineState, isEngineLoaded, getNewBadges } = useEngineState();
  const [showNameModal, setShowNameModal] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  // Render + pre-solve the Turnstile widget as soon as the landing page loads.
  useEffect(() => {
    if (!scriptLoaded) return;
    const container = document.querySelector<HTMLElement>('[data-turnstile-name]');
    if (!container || container.getAttribute('data-turnstile-rendered') === '1') return;
    const widgetId = window.turnstile?.render(container, {
      sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITEKEY,
      action: 'addname',
      callback: () => {
        container.style.display = 'none';
        const wrapper = container.parentElement;
        if (wrapper) wrapper.style.display = 'none';
      },
    });
    if (widgetId) {
      container.setAttribute('data-turnstile-rendered', '1');
      container.setAttribute('data-turnstile-widget-id', String(widgetId));
    }
  }, [scriptLoaded]);

  // Reset for a fresh token in the open handler (tokens are single-use and expire).
  const openNameModal = () => {
    const widget = document.querySelector<HTMLElement>('[data-turnstile-name]');
    const widgetId = widget?.getAttribute('data-turnstile-widget-id') ?? '';
    window.turnstile?.reset(widgetId);
    setShowNameModal(true);
  };

  const sessionName = user?.given_name || '';

  const mission = isEngineLoaded ? engineState.dailyMission : null;
  const starProgress = isEngineLoaded ? getStarsToNextMilestone(engineState.stars) : 0;
  const newBadges = isEngineLoaded ? getNewBadges() : [];
  const completedOps = isEngineLoaded
    ? TRAIL.flatMap((w) => w.id !== 'tables' && isOperationFullyCompleted(engineState.milestoneStars, w.id) ? [w.id] : [])
    : [];

  return (
    <div className="font-body min-h-screen bg-paper flex flex-col">
      <header className="bg-ink text-white px-4 py-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <span className="font-display text-base shrink-0 text-center sm:text-left">{t('home.header.title')}</span>
        <div className="flex items-center justify-center gap-1.5 flex-wrap sm:justify-end">
          <UniversalDifficultySelector dark />
          <LanguageSelector dark />
          {isAuthenticated ? (
            <>
              <span
                className="inline-flex items-center justify-center font-display text-xs font-bold text-white/90 bg-white/15 border-2 border-white/25 rounded-full px-3 min-h-[44px] max-w-[140px] overflow-hidden text-ellipsis whitespace-nowrap"
                title={sessionName}
              >
                {sessionName}
              </span>
              <LogoutLink className="inline-flex items-center justify-center gap-1.5 font-display text-sm bg-coral text-white py-1.5 px-4 rounded-full hover:bg-coral-hover transition-colors min-h-[44px]">
                <LogOut className="w-4 h-4" />
                {t('common.auth.signOut')}
              </LogoutLink>
            </>
          ) : (
            <>
              <button
                onClick={openNameModal}
                className="inline-flex items-center justify-center gap-1.5 font-display text-sm bg-coral text-white py-1.5 px-4 rounded-full border-none cursor-pointer hover:bg-coral-hover transition-colors min-h-[44px]"
              >
                <User className="w-4 h-4" />
                <span className="max-w-[180px] overflow-hidden text-ellipsis whitespace-nowrap" title={state.playerName}>
                  {state.playerName || t('common.nav.addNameShort')}
                </span>
              </button>
              {!isLoading && (
                <LoginLink className="inline-flex items-center justify-center gap-1.5 font-display text-sm text-white border-2 border-white/40 py-1.5 px-4 rounded-full hover:bg-white/10 transition-colors min-h-[44px]">
                  <LogIn className="w-4 h-4" />
                  {t('common.auth.signIn')}
                </LoginLink>
              )}
            </>
          )}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto pb-8">
        <div className="max-w-[600px] mx-auto px-4">

          {/* Hero */}
          <section className="text-center pt-5 pb-2">
            <div className="flex items-center justify-center gap-2">
              <span className="text-[28px] animate-[pop-in_0.3s_ease-out]">🧭</span>
              <h1 className="font-display text-[clamp(22px,6vw,32px)] text-ink leading-tight">
                {t('home.hero.welcome')}
              </h1>
            </div>
            <p className="font-body text-sm text-text-tertiary mt-1.5 max-w-[400px] mx-auto">
              <Trans
                i18nKey="home.hero.subtitle"
                components={[<span key="stars" className="text-coral font-bold" />]}
              />
            </p>
            <div className="inline-flex items-center gap-1.5 mt-3 border-2 border-mist bg-card rounded-full px-4 py-2 shadow-[0_2px_6px_rgba(27,20,71,0.06)]">
              <span className="text-lg">⭐</span>
              <span className="font-display text-sm text-ink font-bold">{starProgress}</span>
              <span className="font-body text-xs font-semibold text-text-dim">{t('home.hero.starsToNextMilestone')}</span>
            </div>
          </section>

          {/* Today's Postcard */}
          {isEngineLoaded && mission && (
            <section className="mt-5 mb-5">
              <div className="relative bg-card rounded-2xl border-2 border-gold/50 p-4 pt-5 shadow-[0_4px_14px_rgba(255,182,72,0.18)]">
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 font-display text-[10px] tracking-wider text-card bg-coral px-3 py-0.5 rounded-full uppercase max-w-[calc(100%-2rem)] whitespace-nowrap overflow-hidden text-ellipsis">
                  {t('home.mission.postcardFrom')}
                </span>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="font-display text-sm font-bold text-ink">{t('home.mission.todaysMission')}</h2>
                  {mission.completed ? (
                    <span className="inline-flex items-center gap-1 font-display text-xs text-leaf font-semibold">
                      <Check className="w-4 h-4" strokeWidth={2.5} />
                      {t('home.mission.complete')}
                    </span>
                  ) : (
                    <span className="font-display text-xs text-coral">{t('home.mission.reward')}</span>
                  )}
                </div>
                <div className="space-y-1.5">
                  {mission.tasks.map((task, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="w-4 h-4 shrink-0 flex items-center justify-center">
                        {task.completed ? (
                          <Check className="w-4 h-4 text-leaf" strokeWidth={2.5} />
                        ) : (
                          <span className="text-sm leading-none">⭐</span>
                        )}
                      </span>
                      <span className={`font-body text-xs flex-1 ${task.completed ? 'text-leaf line-through' : 'text-text-secondary'}`}>
                        {task.descriptionKey ? t(task.descriptionKey) : task.description}
                      </span>
                      {!task.completed && task.target > 1 && (
                        <span className="font-body text-xs text-text-dim">{task.progress}/{task.target}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Passport stamps */}
          {isEngineLoaded && (
            <section className="mb-6">
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-card rounded-xl border-2 border-mist p-3 text-center">
                  <div className="text-xl">⭐</div>
                  <div className="font-display text-lg font-bold text-ink">{engineState.stars}</div>
                  <div className="font-body text-[11px] font-semibold text-text-muted">{t('home.stats.stars')}</div>
                </div>
                <div className="bg-card rounded-xl border-2 border-mist p-3 text-center">
                  <div className="text-xl">📚</div>
                  <div className="font-display text-lg font-bold text-ink">{newBadges.length}</div>
                  <div className="font-body text-[11px] font-semibold text-text-muted">{t('home.stats.badges')}</div>
                </div>
                <div className="bg-card rounded-xl border-2 border-mist p-3 text-center">
                  <div className="text-xl">{engineState.streak > 0 ? '🔥' : '⏳'}</div>
                  <div className="font-display text-lg font-bold text-ink">{engineState.streak}</div>
                  <div className="font-body text-[11px] font-semibold text-text-muted">{t('home.stats.dayStreak')}</div>
                </div>
              </div>
            </section>
          )}

          {/* Expedition trail */}
          <section className="relative">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">🗺️</span>
              <h2 className="font-display text-base font-bold text-ink">{t('home.trail.sectionTitle')}</h2>
              <span className="font-body text-xs font-semibold text-text-dim">{t('home.trail.sectionSubtitle')}</span>
            </div>

            <div className="space-y-3">
              {TRAIL.map((world, idx) => {
                const completed = world.id !== 'tables' && completedOps.includes(world.id);
                return (
                  <div key={world.id} className="flex gap-3 items-stretch">
                    {/* node rail */}
                    <div className="flex flex-col items-center shrink-0">
                      <div
                        className="w-5 h-5 rounded-full border-[2.5px] mt-5 flex items-center justify-center text-[10px]"
                        style={{ borderColor: world.accent, background: completed ? world.accent : 'var(--color-paper)', color: completed ? '#fff' : world.accent }}
                      >
                        {completed ? '✓' : ''}
                      </div>
                      {idx < TRAIL.length - 1 && (
                        <div className="w-[2px] flex-1 my-1 rounded-full" style={{ backgroundImage: `repeating-linear-gradient(to bottom, ${world.accent} 0 4px, transparent 4px 8px)` }} />
                      )}
                    </div>

                    {/* destination card */}
                    <button
                      onClick={() => router.push(world.route)}
                      className="flex-1 min-w-0 text-left bg-card rounded-2xl border-2 px-4 py-3.5 cursor-pointer transition-all duration-150 hover:scale-[1.01] hover:shadow-[0_6px_18px_rgba(27,20,71,0.10)] active:scale-[0.99]"
                      style={{ borderColor: world.accent + '55' }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl flex items-center justify-center text-[26px] shrink-0" style={{ background: world.accent + '18' }}>
                          {world.emoji}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-display text-base text-ink font-bold truncate">{t(`home.trail.worlds.${world.id}.name`)}</span>
                            {completed && (
                              <span className="font-display text-[10px] text-white bg-leaf rounded-full px-2 py-0.5 shrink-0">{t('home.trail.done')}</span>
                            )}
                          </div>
                          <div className="font-body text-xs font-semibold text-text-muted mt-0.5">{t(`home.trail.worlds.${world.id}.tagline`)}</div>
                        </div>
                        <span className="inline-flex items-center gap-0.5 font-body text-[11px] font-semibold text-text-dim shrink-0">
                          {t('common.buttons.explore')}
                          <ArrowRight className="w-3 h-3" strokeWidth={3} />
                        </span>
                      </div>
                    </button>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Badges sticker row */}
          {isEngineLoaded && newBadges.length > 0 && (
            <section className="mt-6">
              <h2 className="font-display text-sm font-bold text-ink mb-2 flex items-center gap-1.5">
                <span>🏅</span> {t('home.badges.sectionTitle')}
              </h2>
              <div className="flex flex-wrap gap-2">
                {newBadges.slice(0, 6).map((badge) => (
                  <div
                    key={badge.id}
                    className="flex items-center gap-1.5 bg-card rounded-xl border border-mist px-3 py-1.5 rotate-[-1.5deg] shadow-[0_2px_4px_rgba(90,20,71,0.06)]"
                    title={t(`achievements.${badge.id}.description`)}
                  >
                    <span className="text-base">{badge.icon}</span>
                    <span className="font-body text-[11px] text-text-secondary font-medium">{t(`achievements.${badge.id}.label`)}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

        </div>
      </div>

      {!isAuthenticated && (
        <>
          <Script
            src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
            strategy="afterInteractive"
            onLoad={() => setScriptLoaded(true)}
          />

          <div className="mt-6 flex w-full justify-center">
            <div
              data-turnstile-name
              className="cf-turnstile"
              data-sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITEKEY}
              data-action="addname"
            />
          </div>
        </>
      )}

      <NameModal
        isOpen={showNameModal}
        initialName={state.playerName}
        onSave={(name) => {
          setPlayerName(name);
          setShowNameModal(false);
        }}
        onCancel={() => setShowNameModal(false)}
      />
    </div>
  );
}