'use client';

import { useState } from 'react';

interface LandingScreenProps {
  onStart: () => void;
}

export function LandingScreen({ onStart }: LandingScreenProps) {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);

  const handleStart = () => {
    setFading(true);
    setTimeout(() => {
      setVisible(false);
      onStart();
    }, 400);
  };

  if (!visible) return null;

  return (
    <div
      className={`landing-screen fixed inset-0 z-[2000] bg-gradient-to-br from-paper to-mist/60 flex p-6 transition-opacity duration-400 overflow-y-auto ${fading ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
    >
      <div className="landing-content max-w-[520px] text-center m-auto">
        <h1 className="landing-title font-display text-[clamp(28px,7vw,42px)] text-orange mb-4 leading-tight">
          <span className="landing-star block text-[48px] mb-2">🌟</span>
          Welcome to<br />Multiplication Tables Adventure!
        </h1>
        <div className="landing-body text-base leading-[1.9] text-text-secondary mb-5">
          <p className="mb-2">
            <strong className="text-orange">Multiplication</strong> is just a fast way of doing{' '}
            <strong className="text-orange">repeated addition</strong>!
          </p>
          <p className="mb-2">
            This free maths game helps kids under 8 learn their{' '}
            <strong className="text-orange">times tables from 1 to 10</strong> with fun stories,
            colourful characters, and cute illustrations. Perfect for children aged 5, 6, 7 and 8 who
            are starting to learn multiplication.
          </p>
          <div className="landing-example bg-card border-2 border-mist rounded-2xl p-5 my-4 shadow-[0_4px_12px_rgba(0,0,0,0.06)]">
            <p className="mb-1">
              Imagine you have <strong className="text-orange">3 baskets</strong> with{' '}
              <strong className="text-orange">4 apples</strong> each:
            </p>
            <div className="landing-addition font-display text-[26px] text-orange my-2">
              4 + 4 + 4 = <strong className="text-text-primary">12</strong>
            </div>
            <div className="landing-same text-[20px] text-text-muted my-1">✦ is the same as ✦</div>
            <div className="landing-multiplication font-display text-[26px] text-orange my-2">
              3 × 4 = <strong className="text-text-primary">12</strong>
            </div>
            <p className="text-sm text-text-muted mt-2">
              Same answer — just written a shorter way!
            </p>
          </div>
          <p>
            You&apos;ll learn each table one by one. Complete a table to unlock the next one! Each
            multiplication fact comes with a short story and a picture to help you remember it.
          </p>
        </div>
        <button
          onClick={handleStart}
          className="landing-start font-display text-[clamp(18px,4vw,22px)] py-4 px-12 rounded-full border-none bg-coral text-white cursor-pointer transition-transform duration-150 shadow-[0_4px_16px_rgba(255,107,82,0.4)] hover:scale-105 hover:bg-coral-hover hover:shadow-[0_6px_24px_rgba(255,107,82,0.5)] active:scale-95"
        >
          🚀 Start Learning!
        </button>
      </div>
    </div>
  );
}
