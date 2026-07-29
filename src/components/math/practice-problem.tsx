'use client';

import { useState, useCallback } from 'react';
import { PracticeProblem as PracticeProblemType, Operation } from '@/lib/operations/types';
import { EmojiGroup } from './emoji-group';
import { NumberBlank } from './number-blank';

interface PracticeProblemProps {
  problem: PracticeProblemType;
  index: number;
  total: number;
  onComplete: (correct: boolean) => void;
}

const OP_SYMBOLS: Record<Operation, string> = {
  addition: '+',
  subtraction: '−',
  multiplication: '×',
  division: '÷',
};

function padNumber(n: number): string {
  return String(n);
}

export function PracticeProblemView({ problem, index, total, onComplete }: PracticeProblemProps) {
  const [attempts, setAttempts] = useState(0);
  const [answer, setAnswer] = useState('');
  const [status, setStatus] = useState<'waiting' | 'correct' | 'incorrect' | 'revealed'>('waiting');
  const [showTip, setShowTip] = useState(false);

  const { operand1, operand2, operation, result, emojiSafe, explanation, emoji, tip } = problem;
  const symbol = OP_SYMBOLS[operation];
  const showEmoji = emojiSafe && operand1 > 0 && operand2 > 0 && result > 0;
  const isHorizontal = operation === 'multiplication' || operation === 'division';

  const handleSubmit = useCallback(() => {
    if (status === 'correct' || status === 'revealed') return;

    const numAnswer = Number(answer);
    if (isNaN(numAnswer)) return;

    if (numAnswer === result) {
      setStatus('correct');
      onComplete(true);
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      if (newAttempts >= 3) {
        setStatus('revealed');
        setAnswer(String(result));
        onComplete(false);
      } else {
        setStatus('incorrect');
        setShowTip(true);
        setTimeout(() => {
          setStatus('waiting');
          setShowTip(false);
        }, 1500);
      }
    }
  }, [answer, result, attempts, status, onComplete]);

  return (
    <div className="w-full max-w-[420px] bg-white rounded-2xl border-2 border-border-card p-5 animate-[fade-in_0.3s_ease-out]">
      <div className="text-sm font-body text-text-dim text-center mb-2">
        Problem {index + 1} of {total}
      </div>

      <div className="mb-4">
        {isHorizontal ? (
          <div className="text-[clamp(22px,6vw,34px)] font-display text-orange text-center leading-[1.4]">
            {operation === 'multiplication'
              ? `${padNumber(operand1)} × ${padNumber(operand2)} = `
              : `${padNumber(operand1)} ÷ ${padNumber(operand2)} = `}
            <NumberBlank
              value={answer}
              onChange={setAnswer}
              onSubmit={handleSubmit}
              disabled={status === 'correct' || status === 'revealed'}
              placeholder="?"
            />
          </div>
        ) : (
          <div className="font-display text-orange text-center leading-[1.3]">
            <div className="inline-block text-[clamp(22px,6vw,34px)] text-right font-mono">
              {(() => {
                const op1 = padNumber(operand1);
                const op2 = padNumber(operand2);
                const blank = answer || '?';
                const maxW = Math.max(op1.length, op2.length, blank.length);
                return (
                  <>
                    <div className="text-right">{op1.padStart(maxW)}</div>
                    <div className="text-right">{symbol} {op2.padStart(Math.max(0, maxW - 2))}</div>
                    <div className="border-t-2 border-orange mt-3 pt-2 text-right">
                      <NumberBlank
                        value={answer}
                        onChange={setAnswer}
                        onSubmit={handleSubmit}
                        disabled={status === 'correct' || status === 'revealed'}
                        placeholder="?"
                      />
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        )}
      </div>

      <div className="text-center my-3 py-2 bg-card-hover rounded-xl min-h-[60px] flex items-center justify-center">
        {showEmoji ? (
          (operation === 'addition' || operation === 'subtraction') ? (
            <EmojiGroup
              emoji={emoji}
              count={operand1}
              equation={{ operand1, operand2, result, symbol }}
            />
          ) : operation === 'multiplication' && operand1 > 0 ? (
            <EmojiGroup emoji={emoji} count={operand1 * operand2} groups={operand1} mode="groups" />
          ) : operation === 'division' && operand2 > 0 && result > 0 ? (
            <EmojiGroup emoji={emoji} count={operand1} groups={operand2} mode="split" />
          ) : (
            <span className="text-[clamp(16px,3vw,22px)]">{emoji.repeat(operand1)}</span>
          )
        ) : (
          <p className="font-body text-xs text-text-secondary px-2">
            {operation === 'addition' ? 'Combine the two numbers!' :
             operation === 'subtraction' ? 'Take the second from the first!' :
             operation === 'multiplication' ? 'Count in equal groups!' :
             'Share the total equally!'}
          </p>
        )}
      </div>

      <div className="min-h-[36px] mt-2">
        {status === 'waiting' && (
          <button
            onClick={handleSubmit}
            disabled={answer === ''}
            className="w-full font-display text-base py-2.5 rounded-xl border-none bg-indigo text-white cursor-pointer transition-colors duration-150 hover:bg-indigo-hover active:bg-indigo-active disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Check Answer ✅
          </button>
        )}
        {status === 'correct' && (
          <div className="text-center font-display text-lg text-green animate-[popup-in_0.25s_ease-out]" role="status">
            ✅ Yes! Great job! 🌟
          </div>
        )}
        {status === 'incorrect' && (
          <div className="text-center font-display text-base text-orange animate-[popup-in_0.25s_ease-out]" role="alert">
            Not quite — try again! 💡
          </div>
        )}
        {status === 'revealed' && (
          <div className="font-body text-sm text-text-secondary bg-[#F8F8F8] rounded-xl p-3 text-center leading-[1.6]">
            <p className="font-display text-base text-orange mb-2">Here's how we solve it! Let's look together 👀</p>
            <p>{explanation}</p>
          </div>
        )}
      </div>

      {showTip && (
        <div className="text-center font-body text-sm text-orange bg-warm-bg rounded-[10px] py-2 px-3.5 mt-2 border-[1.5px] border-warm-border animate-[popup-in_0.25s_ease-out]" role="status">
          💡 {tip}
        </div>
      )}
    </div>
  );
}
