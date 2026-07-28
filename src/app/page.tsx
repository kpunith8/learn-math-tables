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
    <div className="landing-page font-body min-h-screen bg-gradient-to-br from-[#F8F8F8] to-[#EDEDED] flex flex-col">
      <div className="landing-header bg-[#1E293B] text-white px-4 py-3 flex items-center justify-between">
        <span className="landing-title font-display text-base">🌟 Math Adventure!</span>
        <button
          onClick={() => setShowNameModal(true)}
          className="landing-user-btn font-display text-sm bg-[#6366F1] text-white py-1.5 px-4 rounded-full border-none cursor-pointer hover:bg-[#4F46E5] transition-colors min-h-[44px] flex items-center"
        >
          {state.playerName || '👤 Add Name'}
        </button>
      </div>

      <div className="landing-body flex-1 flex flex-col items-center justify-center p-6">
        <h1 className="landing-heading font-display text-[clamp(28px,7vw,42px)] text-[#C2410C] mb-1 text-center leading-tight">
          <span className="landing-heading-emoji block text-[48px] mb-2">🌟</span>
          Math Adventure!
        </h1>
        <p className="landing-subtitle font-body text-base text-[#777] mb-8 text-center max-w-[400px]">
          Pick a topic and start learning with fun examples, practice problems, and quizzes!
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-[500px]">
          {MODULES.map(({ operation, route }) => {
            const meta = OPERATION_META[operation];
            return (
              <button
                key={operation}
                onClick={() => router.push(route)}
                className="module-card font-display w-full rounded-2xl border-2 border-[#E2E8F0] bg-white p-5 text-left cursor-pointer transition-colors duration-150 hover:border-[#6366F1] hover:bg-[#FAFAFA] hover:shadow-[0_4px_16px_rgba(99,102,241,0.15)] active:bg-[#F0F0F0]"
              >
                <div className="module-card-emoji text-[36px] mb-1">{meta.emoji}</div>
                <div className="module-card-name text-lg text-[#333] font-bold">{meta.name}</div>
                <div className="module-card-tagline text-sm text-[#888] font-body mt-0.5">{meta.tagline}</div>
              </button>
            );
          })}

          <button
            onClick={() => router.push('/tables')}
            className="module-card font-display w-full rounded-2xl border-2 border-[#E2E8F0] bg-white p-5 text-left cursor-pointer transition-colors duration-150 hover:border-[#6366F1] hover:bg-[#FAFAFA] hover:shadow-[0_4px_16px_rgba(99,102,241,0.15)] active:bg-[#F0F0F0] sm:col-span-2"
          >
            <div className="module-card-emoji text-[36px] mb-1">🔢</div>
            <div className="module-card-name text-lg text-[#333] font-bold">Tables</div>
            <div className="module-card-tagline text-sm text-[#888] font-body mt-0.5">Master your times tables!</div>
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
