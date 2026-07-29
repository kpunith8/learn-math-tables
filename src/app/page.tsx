'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/lib/contexts/AppContext';
import { useEngineState } from '@/lib/hooks/useEngineState';
import { NameModal } from '@/components/name-modal';

import { getStarsToNextMilestone } from '@/lib/engines/star-economy';

const WORLDS = [
  { id: 'addition' as const, name: 'Addition Island', emoji: '🏝️', tagline: 'Combine and count!', route: '/addition', color: 'from-orange/10 to-orange/5', borderColor: 'border-orange/30' },
  { id: 'subtraction' as const, name: 'Subtraction Valley', emoji: '🏞️', tagline: 'Take some away!', route: '/subtraction', color: 'from-blue/10 to-blue/5', borderColor: 'border-blue/30' },
  { id: 'multiplication' as const, name: 'Multiplication Mountain', emoji: '⛰️', tagline: 'Groups are fast!', route: '/multiplication', color: 'from-purple/10 to-purple/5', borderColor: 'border-purple/30' },
  { id: 'division' as const, name: 'Division Castle', emoji: '🏰', tagline: 'Share it fairly!', route: '/division', color: 'from-teal/10 to-teal/5', borderColor: 'border-teal/30' },
  { id: 'tables' as const, name: 'Table Kingdom', emoji: '👑', tagline: 'Master your tables!', route: '/tables', color: 'from-amber/10 to-amber/5', borderColor: 'border-amber/30' },
];

export default function LandingPage() {
  const router = useRouter();
  const { state, isLoaded, setPlayerName } = useAppContext();
  const { engineState, isEngineLoaded, checkStreak, updateMission, getNewBadges } = useEngineState();
  const [showNameModal, setShowNameModal] = useState(false);

  useEffect(() => {
    if (isLoaded && !state.playerName) {
      setShowNameModal(true);
    }
  }, [isLoaded, state.playerName]);

  useEffect(() => {
    if (isEngineLoaded && isLoaded) {
      checkStreak();
    }
  }, [isEngineLoaded, isLoaded, checkStreak]);

  const mission = isEngineLoaded ? engineState.dailyMission : null;
  const starProgress = isEngineLoaded ? getStarsToNextMilestone(engineState.stars) : 0;
  const newBadges = isEngineLoaded ? getNewBadges() : [];

  return (
    <div className="font-body min-h-screen bg-surface flex flex-col">
      <div className="bg-header text-white px-4 py-3 flex items-center justify-between">
        <span className="font-display text-base">🌟 Math Adventure!</span>
        <button
          onClick={() => setShowNameModal(true)}
          className="font-display text-sm bg-indigo-light text-white py-1.5 px-4 rounded-full border-none cursor-pointer hover:bg-indigo transition-colors min-h-[44px] flex items-center"
        >
          <span
            className="max-w-[180px] overflow-hidden text-ellipsis whitespace-nowrap"
            title={state.playerName}
          >
            {state.playerName || '👤 Add Name'}
          </span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pb-8">
        <div className="max-w-[600px] mx-auto px-4">

          <section className="text-center pt-6 pb-4">
            <div className="text-[40px] mb-2">🌟</div>
            <h1 className="font-display text-[clamp(24px,6vw,36px)] text-orange leading-tight">
              Welcome Number Explorer!
            </h1>
            <p className="font-body text-sm text-text-tertiary mt-1 max-w-[400px] mx-auto">
              Can you collect 100 stars and become a Math Champion?
            </p>
            <p className="font-display text-sm text-indigo font-semibold mt-2">
              Choose your adventure!
            </p>
          </section>

          {isEngineLoaded && mission && (
            <section className="mb-4">
              <div className="bg-white rounded-2xl border-2 border-border-card p-4">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="font-display text-sm font-bold text-text-primary">Today's Mission</h2>
                  {mission.completed ? (
                    <span className="font-display text-xs text-green font-semibold">✅ Complete!</span>
                  ) : (
                    <span className="font-display text-xs text-orange">Reward: +15 ⭐</span>
                  )}
                </div>
                <div className="space-y-1.5">
                  {mission.tasks.map((task, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-sm shrink-0">{task.completed ? '✅' : '⭐'}</span>
                      <span className={`font-body text-xs flex-1 ${task.completed ? 'text-green line-through' : 'text-text-secondary'}`}>
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

          {isEngineLoaded && (
            <section className="mb-5">
              <div className="grid grid-cols-4 gap-2">
                <div className="bg-white rounded-xl border border-border-card p-3 text-center">
                  <div className="text-xl">⭐</div>
                  <div className="font-display text-lg font-bold text-text-primary">{engineState.stars}</div>
                  <div className="font-body text-[10px] text-text-dim">Stars</div>
                </div>
                <div className="bg-white rounded-xl border border-border-card p-3 text-center">
                  <div className="text-xl">📚</div>
                  <div className="font-display text-lg font-bold text-text-primary">{newBadges.length}</div>
                  <div className="font-body text-[10px] text-text-dim">Badges</div>
                </div>
                <div className="bg-white rounded-xl border border-border-card p-3 text-center">
                  <div className="text-xl">{engineState.streak > 0 ? '🔥' : '⏳'}</div>
                  <div className="font-display text-lg font-bold text-text-primary">{engineState.streak}</div>
                  <div className="font-body text-[10px] text-text-dim">Day Streak</div>
                </div>
                <div className="bg-white rounded-xl border border-border-card p-3 text-center">
                  <div className="text-xl">🎯</div>
                  <div className="font-display text-lg font-bold text-orange">{starProgress}</div>
                  <div className="font-body text-[10px] text-text-dim">To Next ⭐</div>
                </div>
              </div>
            </section>
          )}

          <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {WORLDS.map((world) => (
              <button
                key={world.id}
                onClick={() => router.push(world.route)}
                className={`font-display w-full rounded-2xl border-2 bg-white p-4 text-left cursor-pointer transition-all duration-150 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] ${world.borderColor}`}
              >
                <div className="text-[32px] mb-1">{world.emoji}</div>
                <div className="text-base text-text-primary font-bold">{world.name}</div>
                <div className="font-body text-xs text-text-muted mt-0.5">{world.tagline}</div>
                <div className="mt-1.5">
                  <span className="font-body text-xs text-text-secondary">Ready to explore!</span>
                </div>
              </button>
            ))}
          </section>

          {isEngineLoaded && newBadges.length > 0 && (
            <section className="mt-5">
              <h2 className="font-display text-sm font-bold text-text-primary mb-2">Your Badges</h2>
              <div className="flex flex-wrap gap-2">
                {newBadges.slice(0, 6).map((badge) => (
                  <div
                    key={badge.id}
                    className="flex items-center gap-1.5 bg-white rounded-xl border border-border-card px-3 py-1.5"
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
