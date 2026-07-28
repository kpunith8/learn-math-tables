'use client';

import { useMemo } from 'react';

interface EmojiGroupProps {
  emoji: string;
  count: number;
  groups?: number;
  mode?: 'row' | 'groups' | 'split';
  equation?: { operand1: number; operand2: number; result: number; symbol: string };
}

export function EmojiGroup({ emoji, count, groups, mode = 'row', equation }: EmojiGroupProps) {
  const rendered = useMemo(() => {
    if (equation) {
      const { operand1, operand2, result, symbol } = equation;
      if (operand1 >= 0 && operand2 >= 0 && result >= 0) {
        return (
          <span className="emoji-group-equation text-[clamp(16px,3vw,22px)] leading-[1.8] break-all">
            {emoji.repeat(operand1)} {symbol} {emoji.repeat(operand2)} = {emoji.repeat(result)}
          </span>
        );
      }
      return null;
    }

    if (mode === 'row') {
      return <span className="emoji-group-row text-[clamp(16px,3vw,22px)] leading-[1.8]">{emoji.repeat(count)}</span>;
    }
    if (mode === 'groups' && groups) {
      const perGroup = count / groups;
      return (
        <div className="emoji-group-container flex flex-wrap gap-4 justify-center">
          {Array.from({ length: groups }, (_, i) => (
            <div key={i} className="emoji-group-group flex flex-col items-center">
              <span className="emoji-group-emojis text-[clamp(16px,3vw,22px)] leading-[1.8]">{emoji.repeat(perGroup)}</span>
              <span className="emoji-group-label text-[11px] text-[#999] font-body mt-1">{i + 1}</span>
            </div>
          ))}
        </div>
      );
    }
    if (mode === 'split' && groups) {
      const perGroup = count / groups;
      return (
        <div className="emoji-split-container flex flex-col items-center gap-2">
          <div className="emoji-split-all text-[clamp(16px,3vw,22px)] leading-[1.8]">{emoji.repeat(count)}</div>
          <div className="emoji-split-groups flex flex-wrap gap-4 justify-center">
            {Array.from({ length: groups }, (_, i) => (
              <div key={i} className="emoji-split-group flex flex-col items-center">
                <span className="emoji-split-emojis text-[clamp(16px,3vw,22px)] leading-[1.8]">{emoji.repeat(perGroup)}</span>
                <span className="emoji-split-label text-[11px] text-[#999] font-body mt-1">{perGroup}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return <span className="text-[clamp(16px,3vw,22px)] leading-[1.8]">{emoji.repeat(count)}</span>;
  }, [emoji, count, groups, mode, equation]);

  return rendered;
}
