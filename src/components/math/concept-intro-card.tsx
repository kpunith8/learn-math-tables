'use client';

import { useCallback, useState } from 'react';

interface ConceptIntroCardProps {
  copy: string;
  onDone: () => void;
}

export function ConceptIntroCard({ copy, onDone }: ConceptIntroCardProps) {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);

  const handleDone = useCallback(() => {
    setFading(true);
    setTimeout(() => {
      setVisible(false);
      onDone();
    }, 300);
  }, [onDone]);

  if (!visible) return null;

  return (
    <div className={`w-full max-w-[400px] bg-warm-bg rounded-2xl border-2 border-warm-border p-6 text-center transition-opacity duration-300 ${fading ? 'opacity-0' : 'opacity-100'}`}>
      <p className="font-display text-[17px] leading-[1.6] text-ink mb-4">
        {copy}
      </p>
      <button
        onClick={handleDone}
        className="font-display text-base py-2.5 px-8 rounded-full border-none bg-coral text-white cursor-pointer transition-colors duration-150 shadow-[0_4px_12px_rgba(255,107,82,0.35)] hover:bg-coral-hover active:bg-coral-active"
      >
        Got it! 👍
      </button>
    </div>
  );
}
