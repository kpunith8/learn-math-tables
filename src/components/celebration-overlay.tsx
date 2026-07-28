'use client';

import { useEffect, useRef, useState } from 'react';
import { CHARACTERS, CONFETTI_CONFIG, SPARKLE_EMOJIS } from '@/lib/constants';
import { getRandomFunFact, getMaxAllowedTable } from '@/lib/utils';
import { Difficulty } from '@/lib/constants';

interface CelebrationOverlayProps {
  tableNumber: number;
  elapsedSeconds: number;
  starRating: number;
  difficulty: Difficulty;
  practiceMode: boolean;
  onProceed: () => void;
  onPlayConfettiSound: () => void;
}

function generateSparkles() {
  return Array.from({ length: CONFETTI_CONFIG.SPARKLE_COUNT }, () => ({
    emoji: SPARKLE_EMOJIS[Math.floor(Math.random() * SPARKLE_EMOJIS.length)],
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    delay: `${Math.random() * CONFETTI_CONFIG.DELAY_RANGE}s`,
    size: CONFETTI_CONFIG.MIN_SIZE + Math.random() * (CONFETTI_CONFIG.MAX_SIZE - CONFETTI_CONFIG.MIN_SIZE),
  }));
}

export function CelebrationOverlay({
  tableNumber,
  elapsedSeconds,
  starRating,
  difficulty,
  practiceMode,
  onProceed,
  onPlayConfettiSound,
}: CelebrationOverlayProps) {
  const completedRef = useRef(false);
  const [sparkles] = useState(generateSparkles);

  const character = CHARACTERS[tableNumber];
  const nextTableNumber = tableNumber + 1;
  const maxAllowedTable = getMaxAllowedTable(practiceMode, difficulty);
  const hasUnlock = nextTableNumber <= maxAllowedTable && !practiceMode;
  const starDisplay = '⭐'.repeat(starRating);

  useEffect(() => {
    onPlayConfettiSound();
  }, [onPlayConfettiSound]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!completedRef.current) {
        completedRef.current = true;
        onProceed();
      }
    }, CONFETTI_CONFIG.DURATION);
    return () => clearTimeout(timer);
  }, [onProceed]);

  const handleClick = () => {
    if (!completedRef.current) {
      completedRef.current = true;
      onProceed();
    }
  };

  const formatTime = (totalSeconds: number) => {
    if (totalSeconds < 60) return `${totalSeconds} seconds`;
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;
    return `${minutes} min ${remainingSeconds} sec`;
  };

  return (
    <div
      onClick={handleClick}
      className="celebration-overlay fixed inset-0 flex items-center justify-center bg-black/40 z-[1000] cursor-pointer animate-[fade-in_0.3s_ease-out_forwards]"
    >
      <div className="celebration-card font-display text-[clamp(22px,5vw,36px)] text-white text-center shadow-[2px_2px_8px_rgba(0,0,0,0.4)] bg-[#4F46E5] py-7 px-9 rounded-[24px] animate-[pop-in_0.4s_cubic-bezier(0.175,0.885,0.32,1.275)] leading-relaxed max-w-[440px]">
        🎉✨ Amazing! ✨🎉
        <span className="celebration-message block font-body text-base font-bold mt-2 opacity-90">
          You completed the {tableNumber} times table!
          <br />
          {character ? `${character.emoji} ${character.name}` : ''}
        </span>
        <span className="celebration-stars block text-[28px] mt-1.5 tracking-widest">
          {starDisplay}
        </span>
        <span className="celebration-time block font-body text-[13px] font-bold mt-1.5 opacity-90">
          Completed in {formatTime(elapsedSeconds)}
        </span>
        <span className="celebration-fact block font-body text-[13px] font-normal mt-3 opacity-85 leading-normal py-2.5 px-3.5 bg-white/15 rounded-xl">
          💡 {getRandomFunFact()}
        </span>
        {hasUnlock && (
          <span className="celebration-unlock inline-block mt-3 py-1.5 px-7 rounded-full bg-white/25 font-display text-lg">
            🔓 {nextTableNumber}&apos;s table unlocked!
          </span>
        )}
      </div>
      {sparkles.map((sparkle, index) => (
        <div
          key={index}
          className="celebration-sparkle fixed pointer-events-none animate-[sparkle-float_2.5s_ease-out_forwards]"
          style={{
            left: sparkle.left,
            top: sparkle.top,
            animationDelay: sparkle.delay,
            fontSize: `${sparkle.size}px`,
          }}
        >
          {sparkle.emoji}
        </div>
      ))}
    </div>
  );
}
