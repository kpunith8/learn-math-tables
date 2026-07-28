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
    <div className={`concept-intro-card w-full max-w-[400px] bg-[#FFF7ED] rounded-2xl border-2 border-[#FED7AA] p-6 text-center transition-opacity duration-300 ${fading ? 'opacity-0' : 'opacity-100'}`}>
      <p className="concept-intro-copy font-display text-[17px] leading-[1.6] text-[#C2410C] mb-4">
        {copy}
      </p>
      <button
        onClick={handleDone}
        className="concept-intro-btn font-display text-base py-2.5 px-8 rounded-full border-none bg-[#4F46E5] text-white cursor-pointer transition-colors duration-150 shadow-[0_4px_12px_rgba(79,70,229,0.3)] hover:bg-[#4338CA] active:bg-[#3730A3]"
      >
        Got it! 👍
      </button>
    </div>
  );
}
