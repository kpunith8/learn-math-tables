'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/lib/contexts/AppContext';
import { Operation, OPERATION_META } from '@/lib/operations/types';
import { NameModal } from '@/components/name-modal';

const MODULES: Array<{ operation: Operation; route: string }> = [
  { operation: 'addition', route: '/addition' },
  { operation: 'subtraction', route: '/subtraction' },
  { operation: 'multiplication', route: '/multiplication' },
  { operation: 'division', route: '/division' },
];

export default function LandingPage() {
  const router = useRouter();
  const { state, isLoaded, setPlayerName } = useAppContext();
  const [showNameModal, setShowNameModal] = useState(false);

  useEffect(() => {
    if (isLoaded && !state.playerName) {
      setShowNameModal(true);
    }
  }, [isLoaded, state.playerName]);

  return (
    <div className="font-body min-h-screen bg-gradient-to-br from-[#F8F8F8] to-[#EDEDED] flex flex-col">
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

      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <h1 className="font-display text-[clamp(28px,7vw,42px)] text-orange mb-1 text-center leading-tight">
          <span className="block text-[48px] mb-2">🌟</span>
          Math Adventure!
        </h1>
        <p className="font-body text-base text-text-tertiary mb-8 text-center max-w-[400px]">
          Pick a topic and start learning with fun examples, practice problems, and quizzes!
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-[500px]">
          {MODULES.map(({ operation, route }) => {
            const meta = OPERATION_META[operation];
            return (
              <button
                key={operation}
                onClick={() => router.push(route)}
                className="font-display w-full rounded-2xl border-2 border-border-card bg-white p-5 text-left cursor-pointer transition-colors duration-150 hover:border-indigo-light hover:bg-card-hover hover:shadow-[0_4px_16px_rgba(99,102,241,0.15)] active:bg-card-active"
              >
                <div className="text-[36px] mb-1">{meta.emoji}</div>
                <div className="text-lg text-text-primary font-bold">{meta.name}</div>
                <div className="text-sm text-text-muted font-body mt-0.5">{meta.tagline}</div>
              </button>
            );
          })}

          <button
            onClick={() => router.push('/tables')}
            className="font-display w-full rounded-2xl border-2 border-border-card bg-white p-5 text-left cursor-pointer transition-colors duration-150 hover:border-indigo-light hover:bg-card-hover hover:shadow-[0_4px_16px_rgba(99,102,241,0.15)] active:bg-card-active sm:col-span-2"
          >
            <div className="text-[36px] mb-1">🔢</div>
            <div className="text-lg text-text-primary font-bold">Tables</div>
            <div className="text-sm text-text-muted font-body mt-0.5">Master your times tables!</div>
          </button>
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
