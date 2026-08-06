'use client';

import { memo } from 'react';
import { Example, Operation, OPERATION_META } from '@/lib/operations/types';
import { EmojiGroup } from './emoji-group';

interface WorkedExampleProps {
  example: Example;
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

export const WorkedExample = memo(function WorkedExample({ example }: WorkedExampleProps) {
  const { operand1, operand2, operation, result, emojiSafe, hint, explanation, emoji } = example;
  const symbol = OP_SYMBOLS[operation];
  const showEmoji = emojiSafe && operand1 > 0 && operand2 > 0 && result > 0;

  const isHorizontal = operation === 'multiplication' || operation === 'division';

  if (isHorizontal) {
    const display = operation === 'multiplication'
      ? `${padNumber(operand1)} × ${padNumber(operand2)} = ${result}`
      : `${padNumber(operand1)} ÷ ${padNumber(operand2)} = ${result}`;

    return (
      <div className="w-full max-w-[400px] bg-card rounded-2xl border-2 border-mist p-5 animate-[fade-in_0.3s_ease-out]">
        <div className="font-display text-center mb-4">
          <div className="text-[clamp(22px,6vw,34px)] leading-[1.4]" style={{ color: OPERATION_META[operation].color }}>
            {display}
          </div>
        </div>

        <div className="text-center my-3 py-3 bg-mist/40 rounded-xl min-h-[60px] flex items-center justify-center">
          {showEmoji ? (
            operation === 'multiplication' && operand1 > 0 ? (
              <EmojiGroup emoji={emoji} count={operand1 * operand2} groups={operand1} mode="groups" />
            ) : operation === 'division' && operand2 > 0 && result > 0 ? (
              <EmojiGroup emoji={emoji} count={operand1} groups={operand2} mode="split" />
            ) : (
              <span className="text-[clamp(16px,3vw,22px)]">{emoji.repeat(operand1)}</span>
            )
          ) : (
            <p className="font-body text-xs text-text-secondary px-2">{explanation}</p>
          )}
        </div>

        <p className="font-body text-sm text-text-tertiary text-center italic mb-2">
          {hint}
        </p>
      </div>
    );
  }

  // Addition/Subtraction: right-aligned vertical
  const maxWidth = Math.max(padNumber(operand1).length, padNumber(operand2).length, padNumber(result).length);

  const accent = OPERATION_META[operation].color;

  return (
    <div className="w-full max-w-[400px] bg-card rounded-2xl border-2 border-mist p-5 animate-[fade-in_0.3s_ease-out]">
      <div className="font-display text-center mb-4">
        <div className="inline-block text-[clamp(22px,6vw,34px)] leading-[1.3] text-right font-mono" style={{ color: accent }}>
          <div className="text-right">{padNumber(operand1).padStart(maxWidth)}</div>
          <div className="text-right">{symbol} {padNumber(operand2).padStart(maxWidth - 2)}</div>
          <div className="border-t-2 mt-0.5 pt-0.5 text-right" style={{ borderColor: accent }}>
            {String(result).padStart(maxWidth)}
          </div>
        </div>
      </div>

      <div className="text-center my-3 py-3 bg-mist/40 rounded-xl min-h-[60px] flex items-center justify-center">
        {showEmoji ? (
          <EmojiGroup
            emoji={emoji}
            count={operand1}
            equation={{ operand1, operand2, result, symbol }}
          />
        ) : (
          <p className="font-body text-xs text-text-secondary px-2">{explanation}</p>
        )}
      </div>

      <p className="font-body text-sm text-text-tertiary text-center italic mb-2">
        {hint}
      </p>
    </div>
  );
});
