'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/lib/contexts/AppContext';
import { useEngineState } from '@/lib/hooks/useEngineState';
import { NameModal } from '@/components/name-modal';

import { getStarsToNextMilestone } from '@/lib/engines/star-economy';

const TRAIL = [
  { id: 'addition' as const, name: 'Addition Island', emoji: '🏝️', tagline: 'Combine and count!', route: '/addition', accent: '#4FA8F5' },
  { id: 'subtraction' as const, name: 'Number Valley', emoji: '🏞️', tagline: 'Take some away!', route: '/subtraction', accent: '#57C278' },
  { id: 'multiplication' as const, name: 'Multiplication Mountain', emoji: '⛰️', tagline: 'Groups are fast!', route: '/multiplication', accent: '#7E8CD9' },
  { id: 'division' as const, name: 'Division Castle', emoji: '🏰', tagline: 'Share it fairly!', route: '/division', accent: '#FF7A59' },
  { id: 'tables' as const, name: 'Table Kingdom', emoji: '👑', tagline: 'Master your tables!', route: '/tables', accent: '#F5AB3C' },
];

export default function LandingPage() {
  const router = useRouter();
  const { state, setPlayerName } = useAppContext();
  const { engineState, isEngineLoaded, getNewBadges } = useEngineState();
  const [showNameModal, setShowNameModal] = useState(false);

  const mission = isEngineLoaded ? engineState.dailyMission : null;
  const starProgress = isEngineLoaded ? getStarsToNextMilestone(engineState.stars) : 0;
  const newBadges = isEngineLoaded ? getNewBadges() : [];
  const completedOps = isEngineLoaded ? engineState.completedOperations : [];

  return (
    <div className="font-body min-h-screen bg-paper flex flex-col">
      <header className="bg-ink text-white px-4 py-3 flex items-center justify-between">
        <span className="font-display text-base">🌟 Math Adventure!</span>
        <button
          onClick={() => setShowNameModal(true)}
          className="font-display text-sm bg-coral text-white py-1.5 px-4 rounded-full border-none cursor-pointer hover:bg-coral-hover transition-colors min-h-[44px] flex items-center"
        >
          <span className="max-w-[180px] overflow-hidden text-ellipsis whitespace-nowrap" title={state.playerName}>
            {state.playerName || '👤 Add Name'}
          </span>
        </button>
      </header>

      <div className="flex-1 overflow-y-auto pb-8">
        <div className="max-w-[600px] mx-auto px-4">

          {/* Hero */}
          <section className="text-center pt-6 pb-2">
            <div className="text-[40px] mb-1 animate-[pop-in_0.3s_ease-out]">🧭</div>
            <h1 className="font-display text-[clamp(24px,6vw,36px)] text-ink leading-tight">
              Welcome Number Explorer!
            </h1>
            <p className="font-body text-sm text-text-tertiary mt-1 max-w-[400px] mx-auto">
              Follow the trail through the math lands and collect{' '}
              <span className="text-coral font-bold">100 stars</span> to become a Math Champion!
            </p>
            <div className="inline-flex items-center gap-1.5 mt-4 border-2 border-mist bg-card rounded-full px-4 py-2 shadow-[0_2px_6px_rgba(27,20,71,0.06)]">
              <span className="text-lg">⭐</span>
              <span className="font-display text-sm text-ink font-bold">{starProgress}</span>
              <span className="font-body text-xs font-semibold text-text-dim">stars to next milestone</span>
            </div>
          </section>

          {/* Today's Postcard */}
          {isEngineLoaded && mission && (
            <section className="mb-5">
              <div className="relative bg-card rounded-2xl border-2 border-gold/50 p-4 pt-5 shadow-[0_4px_14px_rgba(255,182,72,0.18)]">
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 font-display text-[10px] tracking-wider text-card bg-coral px-3 py-0.5 rounded-full uppercase">
                  Postcard from Nova
                </span>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="font-display text-sm font-bold text-ink">Today&apos;s Mission</h2>
                  {mission.completed ? (
                    <span className="font-display text-xs text-leaf font-semibold">✅ Complete!</span>
                  ) : (
                    <span className="font-display text-xs text-coral">Reward: +15 ⭐</span>
                  )}
                </div>
                <div className="space-y-1.5">
                  {mission.tasks.map((task, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-sm shrink-0">{task.completed ? '✅' : '⭐'}</span>
                      <span className={`font-body text-xs flex-1 ${task.completed ? 'text-leaf line-through' : 'text-text-secondary'}`}>
                        {task.description}
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
              <div className="grid grid-cols-4 gap-2">
                <div className="bg-card rounded-xl border-2 border-mist p-3 text-center">
                  <div className="text-xl">⭐</div>
                  <div className="font-display text-lg font-bold text-ink">{engineState.stars}</div>
                  <div className="font-body text-[11px] font-semibold text-text-muted">Stars</div>
                </div>
                <div className="bg-card rounded-xl border-2 border-mist p-3 text-center">
                  <div className="text-xl">📚</div>
                  <div className="font-display text-lg font-bold text-ink">{newBadges.length}</div>
                  <div className="font-body text-[11px] font-semibold text-text-muted">Badges</div>
                </div>
                <div className="bg-card rounded-xl border-2 border-mist p-3 text-center">
                  <div className="text-xl">{engineState.streak > 0 ? '🔥' : '⏳'}</div>
                  <div className="font-display text-lg font-bold text-ink">{engineState.streak}</div>
                  <div className="font-body text-[11px] font-semibold text-text-muted">Day Streak</div>
                </div>
                <div className="bg-card rounded-xl border-2 border-mist p-3 text-center">
                  <div className="text-xl">🎯</div>
                  <div className="font-display text-lg font-bold text-coral">{starProgress}</div>
                  <div className="font-body text-[11px] font-semibold text-text-muted">To Next ⭐</div>
                </div>
              </div>
            </section>
          )}

          {/* Expedition trail */}
          <section className="relative">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">🗺️</span>
              <h2 className="font-display text-base font-bold text-ink">The Number Trail</h2>
              <span className="font-body text-xs font-semibold text-text-dim">travel through all five lands!</span>
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
                            <span className="font-display text-base text-ink font-bold truncate">{world.name}</span>
                            {completed && (
                              <span className="font-display text-[10px] text-white bg-leaf rounded-full px-2 py-0.5 shrink-0">Done ✓</span>
                            )}
                          </div>
                          <div className="font-body text-xs font-semibold text-text-muted mt-0.5">{world.tagline}</div>
                        </div>
                        <span className="font-body text-[11px] font-semibold text-text-dim shrink-0">Explore →</span>
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
                <span>🏅</span> Your Badges
              </h2>
              <div className="flex flex-wrap gap-2">
                {newBadges.slice(0, 6).map((badge) => (
                  <div
                    key={badge.id}
                    className="flex items-center gap-1.5 bg-card rounded-xl border border-mist px-3 py-1.5 rotate-[-1.5deg] shadow-[0_2px_4px_rgba(90,20,71,0.06)]"
                    title={badge.description}
                  >
                    <span className="text-base">{badge.icon}</span>
                    <span className="font-body text-[11px] text-text-secondary font-medium">{badge.label}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

        </div>
      </div>

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