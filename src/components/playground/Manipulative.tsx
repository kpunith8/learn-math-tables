'use client';

import { DraggableItem } from './drag-core';
import type { Token } from './playground-utils';

interface TokenFaceProps {
  token: Token;
  emoji: string;
  accent: string;
  small?: boolean;
}

/**
 * Static manipulative face (non-interactive). Singles render the emoji;
 * tens render a labeled 10-block; negatives get a red tint. The glyph IS
 * the countable object, so no lucide icon here by design.
 */
export function TokenFace({ token, emoji, accent, small }: TokenFaceProps) {
  const isTen = token.kind === 'ten' || token.kind === 'neg-ten';
  const negative = token.kind === 'neg-single' || token.kind === 'neg-ten';
  const size = small ? 'min-w-[36px] min-h-[36px]' : 'min-w-[52px] min-h-[52px]';
  const glyph = small ? 'text-[18px]' : 'text-[26px]';

  if (isTen) {
    // A ten is ten real mini-emojis in a 5×2 frame — countable like singles,
    // grouped like a ten. 23 reads as two full frames plus three singles.
    return (
      <span
        className={`inline-flex items-center justify-center ${small ? 'min-w-[44px] min-h-[44px] p-1' : 'min-w-[56px] min-h-[56px] p-1.5'} rounded-xl border-2 bg-card shadow-[0_3px_8px_rgba(27,20,71,0.2)] ${
          negative ? 'border-red-400' : 'border-mist'
        }`}
        style={{ borderColor: negative ? undefined : accent }}
        aria-hidden="true"
      >
        <span className={`grid grid-cols-5 ${small ? 'gap-0 text-[8px] leading-[1.15]' : 'gap-px text-[11px] leading-[1.15]'}`} aria-hidden="true">
          {Array.from({ length: 10 }, (_, i) => (
            <span key={i} className="leading-[1.15]">
              {emoji}
            </span>
          ))}
        </span>
      </span>
    );
  }
  if (token.value === 0) {
    return (
      <span
        className={`inline-flex items-center justify-center ${size} rounded-xl border-2 border-dashed border-mist font-display text-lg text-text-dim bg-card`}
        aria-hidden="true"
      >
        0
      </span>
    );
  }
  return (
    <span
      className={`inline-flex items-center justify-center ${size} ${glyph} rounded-xl border-2 bg-card shadow-[0_2px_6px_rgba(27,20,71,0.12)] ${
        negative ? 'border-red-400' : 'border-mist'
      }`}
      aria-hidden="true"
    >
      {emoji}
    </span>
  );
}

interface ManipulativeProps {
  token: Token;
  emoji: string;
  accent: string;
  disabled?: boolean;
  onDropToken: (token: Token, zoneId: string | null) => void;
  onTapToken: (token: Token) => void;
}

/** One draggable manipulative. Tap also auto-places it (touch/keyboard fallback). */
export function Manipulative({ token, emoji, accent, disabled, onDropToken, onTapToken }: ManipulativeProps) {
  const isTen = token.kind === 'ten' || token.kind === 'neg-ten';

  return (
    <DraggableItem
      id={token.id}
      label={isTen ? `Block of ${token.value}` : `${emoji} piece`}
      disabled={disabled}
      testId={`play-token-${token.id}`}
      onDrop={(_, zoneId) => onDropToken(token, zoneId)}
      onTap={() => onTapToken(token)}
      className="rounded-xl"
    >
      <TokenFace token={token} emoji={emoji} accent={accent} />
    </DraggableItem>
  );
}
