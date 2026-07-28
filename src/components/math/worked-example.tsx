'use client';

import { Example, Operation } from '@/lib/operations/types';
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

export function WorkedExample({ example }: WorkedExampleProps) {
  const { operand1, operand2, operation, result, emojiSafe, hint, explanation, emoji } = example;
  const symbol = OP_SYMBOLS[operation];
  const showEmoji = emojiSafe && operand1 > 0 && operand2 > 0 && result > 0;

  const isHorizontal = operation === 'multiplication' || operation === 'division';

  if (isHorizontal) {
    const display = operation === 'multiplication'
      ? `${padNumber(operand1)} × ${padNumber(operand2)} = ${result}`
      : `${padNumber(operand1)} ÷ ${padNumber(operand2)} = ${result}`;

    return (
      <div className="worked-example w-full max-w-[400px] bg-white rounded-2xl border-2 border-[#E2E8F0] p-5 animate-[fade-in_0.3s_ease-out]">
        <div className="worked-example-problem worked-example-horizontal font-display text-center mb-4">
          <div className="worked-example-horizontal-text text-[clamp(22px,6vw,34px)] text-[#C2410C] leading-[1.4]">
            {display}
          </div>
        </div>

        {showEmoji && (
          <div className="worked-example-emoji text-center my-3 py-3 bg-[#FAFAFA] rounded-xl">
            {operation === 'multiplication' && operand1 > 0 ? (
              <EmojiGroup emoji={emoji} count={operand1 * operand2} groups={operand1} mode="groups" />
            ) : operation === 'division' && operand2 > 0 && result > 0 ? (
              <EmojiGroup emoji={emoji} count={operand1} groups={operand2} mode="split" />
            ) : (
              <span className="text-[clamp(16px,3vw,22px)]">{emoji.repeat(operand1)}</span>
            )}
          </div>
        )}

        <p className="worked-example-hint font-body text-sm text-[#777] text-center italic mb-2">
          {hint}
        </p>

        {!showEmoji && (
          <p className="worked-explain font-body text-sm text-[#555] text-center leading-[1.6] bg-[#F8F8F8] rounded-xl p-3">
            {explanation}
          </p>
        )}
      </div>
    );
  }

  // Addition/Subtraction: right-aligned vertical
  const maxWidth = Math.max(padNumber(operand1).length, padNumber(operand2).length, padNumber(result).length);

  return (
    <div className="worked-example w-full max-w-[400px] bg-white rounded-2xl border-2 border-[#E2E8F0] p-5 animate-[fade-in_0.3s_ease-out]">
      <div className="worked-example-problem worked-example-vertical font-display text-center mb-4">
        <div className="worked-example-vertical-equation inline-block text-[clamp(22px,6vw,34px)] text-[#C2410C] leading-[1.3] text-right font-mono">
          <div className="worked-example-operand1 text-right">{padNumber(operand1).padStart(maxWidth)}</div>
          <div className="worked-example-operand2 text-right">{symbol} {padNumber(operand2).padStart(maxWidth - 2)}</div>
          <div className="worked-example-result border-t-2 border-[#C2410C] mt-0.5 pt-0.5 text-right">
            {String(result).padStart(maxWidth)}
          </div>
        </div>
      </div>

      {showEmoji && (
        <div className="worked-example-emoji text-center my-3 py-3 bg-[#FAFAFA] rounded-xl">
          <EmojiGroup
            emoji={emoji}
            count={operand1}
            equation={{ operand1, operand2, result, symbol }}
          />
        </div>
      )}

      <p className="worked-example-hint font-body text-sm text-[#777] text-center italic mb-2">
        {hint}
      </p>

      {!showEmoji && (
        <p className="worked-explain font-body text-sm text-[#555] text-center leading-[1.6] bg-[#F8F8F8] rounded-xl p-3">
          {explanation}
        </p>
      )}
    </div>
  );
}
