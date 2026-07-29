'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

const TABLE_PATTERNS: Record<number, { pattern: string; discovery: string; example: string; reveal: string }> = {
  2: {
    pattern: '2, 4, 6, 8, 10, 12, 14, 16, 18, 20',
    discovery: 'What do you notice?',
    example: '4, 6, 8, 10 — look at the last digit!',
    reveal: 'All answers are even! Every number ends in 0, 2, 4, 6, or 8.',
  },
  3: {
    pattern: '3, 6, 9, 12, 15, 18, 21, 24, 27, 30',
    discovery: 'What do you notice?',
    example: '3 → 6 → 9. How much are we adding each time?',
    reveal: 'We keep adding 3! The digit sum (3, 6, 9, 1+2=3, 1+5=6...) follows a cool pattern!',
  },
  4: {
    pattern: '4, 8, 12, 16, 20, 24, 28, 32, 36, 40',
    discovery: 'How can we use what we know about 2s?',
    example: '2 × 6 = 12, so 4 × 6 = double that = 24!',
    reveal: 'Double the doubles! 4 × 6 = (2 × 6) × 2 = 12 × 2 = 24!',
  },
  5: {
    pattern: '5, 10, 15, 20, 25, 30, 35, 40, 45, 50',
    discovery: 'Look at the last digit of each answer.',
    example: '5, 10, 15, 20 — what pattern do the endings make?',
    reveal: 'Every answer ends in 5 or 0! 5, 10, 15, 20 — it keeps alternating!',
  },
  6: {
    pattern: '6, 12, 18, 24, 30, 36, 42, 48, 54, 60',
    discovery: 'Think about 5 × something plus one more!',
    example: '5 × 7 = 35, so 6 × 7 = 35 + 7 = 42!',
    reveal: '6 = 5 + 1! So 6 × 7 = (5 × 7) + (1 × 7) = 35 + 7 = 42!',
  },
  7: {
    pattern: '7, 14, 21, 28, 35, 42, 49, 56, 63, 70',
    discovery: 'This is a tricky one — let\'s use stories!',
    example: '7 × 8 = 56 — remember: 5, 6, 7, 8 (56 = 7 × 8)!',
    reveal: 'Try the memory trick: 5, 6, 7, 8 — 56 = 7 × 8! Break harder ones into 5× and 2×.',
  },
  8: {
    pattern: '8, 16, 24, 32, 40, 48, 56, 64, 72, 80',
    discovery: 'How can we double our way there?',
    example: '8 × 4: start with 4, double to 8, double to 16, double to 32!',
    reveal: 'Double three times! 8 × 4: 4 → 8 → 16 → 32. That\'s 8 × 4 = 32!',
  },
  9: {
    pattern: '9, 18, 27, 36, 45, 54, 63, 72, 81, 90',
    discovery: 'Look at the digits of each answer!',
    example: '9 × 4 = 36. What is 3 + 6?',
    reveal: 'Magic! The digits always add up to 9! 9 × 4 = 36, 3 + 6 = 9. And 9 × 7 = 63, 6 + 3 = 9!',
  },
  10: {
    pattern: '10, 20, 30, 40, 50, 60, 70, 80, 90, 100',
    discovery: 'What happens when you multiply by 10?',
    example: '10 × 7 = 70 — what did we add to the 7?',
    reveal: 'Just add a zero! 10 × 7 = 70. Put a zero at the end of any number to multiply by 10!',
  },
  11: {
    pattern: '11, 22, 33, 44, 55, 66, 77, 88, 99, 110',
    discovery: 'Look at each answer — what do you see?',
    example: '11 × 3 = 33, 11 × 4 = 44, 11 × 5 = 55',
    reveal: 'The digits repeat! 11 × 3 = 33 (two 3s), 11 × 4 = 44 (two 4s). Up to 9 it\'s double digits!',
  },
};

interface PatternDiscoveryProps {
  tableNumber: number;
  onComplete: () => void;
}

export function PatternDiscovery({ tableNumber, onComplete }: PatternDiscoveryProps) {
  const [showReveal, setShowReveal] = useState(false);
  const pattern = TABLE_PATTERNS[tableNumber];

  if (!pattern) {
    return null;
  }

  return (
    <div className="flex justify-center p-4">
      <div className="bg-white rounded-2xl border-2 border-indigo/20 p-5 max-w-[420px] w-full text-center">
        <div className="text-[36px] mb-2">🔍</div>
        <h2 className="font-display text-lg text-text-primary font-bold mb-1">
          Pattern Discovery: Table {tableNumber}
        </h2>

        <div className="font-display text-base text-indigo font-semibold my-3 tracking-wide">
          {pattern.pattern}
        </div>

        <p className="font-display text-sm text-orange mb-3">{pattern.discovery}</p>

        {!showReveal && (
          <>
            <p className="font-body text-xs text-text-muted mb-1">{pattern.example}</p>
            <div className="h-px bg-border-card/50 my-3" />
            <Button
              onClick={() => setShowReveal(true)}
              variant="indigo"
              size="sm"
            >
              Show Pattern →
            </Button>
          </>
        )}

        {showReveal && (
          <div className="animate-[pop-in_0.3s_ease-out]">
            <div className="bg-warm-bg rounded-xl border border-warm-border p-3 mb-3">
              <p className="font-body text-sm text-text-secondary">{pattern.reveal}</p>
            </div>
            <Button
              onClick={onComplete}
              variant="indigo"
            >
              Got it! Start Table {tableNumber} →
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
