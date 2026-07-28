'use client';

import { PracticeProblem, Operation } from '@/lib/operations/types';
import { EmojiGroup } from './emoji-group';

interface ProblemSummaryListProps {
  problems: PracticeProblem[];
  correctCount: number;
  onContinue: () => void;
}

const OP_SYMBOLS: Record<Operation, string> = {
  addition: '+',
  subtraction: '−',
  multiplication: '×',
  division: '÷',
};

export function ProblemSummaryList({ problems, correctCount, onContinue }: ProblemSummaryListProps) {
  return (
    <div className="problem-summary w-full max-w-[420px] mx-auto animate-[fade-in_0.3s_ease-out]">
      <div className="problem-summary-header text-center mb-4">
        <h3 className="problem-summary-title font-display text-[22px] text-[#C2410C] mb-1">
          You finished practicing! 🌈
        </h3>
        <p className="problem-summary-score font-body text-sm text-[#777]">
          {correctCount} of {problems.length} correct
        </p>
      </div>

      <div className="problem-summary-list flex flex-col gap-3">
        {problems.map((p, i) => {
          const symbol = OP_SYMBOLS[p.operation];
          const showEmoji = p.emojiSafe && p.operand1 > 0 && p.operand2 > 0 && p.result > 0;
          return (
            <div
              key={i}
              className="problem-summary-item bg-white rounded-xl border-2 border-[#E2E8F0] p-4"
            >
              <div className="problem-summary-equation font-display text-[17px] text-[#C2410C] mb-2">
                {p.operand1} {symbol} {p.operand2} = {p.result}
              </div>
              {showEmoji && (
                <div className="problem-summary-emoji text-center py-1 mb-1">
                  {(p.operation === 'addition' || p.operation === 'subtraction') ? (
                    <EmojiGroup
                      emoji={p.emoji}
                      count={p.operand1}
                      equation={{ operand1: p.operand1, operand2: p.operand2, result: p.result, symbol }}
                    />
                  ) : p.operation === 'multiplication' && p.operand1 > 0 ? (
                    <EmojiGroup emoji={p.emoji} count={p.operand1 * p.operand2} groups={p.operand1} mode="groups" />
                  ) : p.operation === 'division' && p.operand2 > 0 && p.result > 0 ? (
                    <EmojiGroup emoji={p.emoji} count={p.operand1} groups={p.operand2} mode="split" />
                  ) : (
                    <span className="text-[clamp(16px,3vw,22px)]">{p.emoji.repeat(p.operand1)}</span>
                  )}
                </div>
              )}
              <p className="font-body text-[13px] text-[#555] leading-[1.5]">
                {p.explanation}
              </p>
            </div>
          );
        })}
      </div>

      <button
        onClick={onContinue}
        className="problem-summary-continue-btn w-full mt-5 font-display text-base py-3 rounded-xl border-none bg-[#4F46E5] text-white cursor-pointer transition-colors duration-150 shadow-[0_4px_12px_rgba(79,70,229,0.3)] hover:bg-[#4338CA] active:bg-[#3730A3]"
      >
        Let's do the quiz! 🎉
      </button>
    </div>
  );
}
