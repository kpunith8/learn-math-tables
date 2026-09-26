'use client';

import { GripVertical } from 'lucide-react';
import { DraggableItem } from './drag-core';

interface CountBadgeProps {
  value: number;
  accent: string;
  disabled?: boolean;
  wrongFlash?: boolean;
  onDropToAnswer: (value: number) => void;
  onTapBadge: (value: number) => void;
}

/** A draggable number answer chip. Tap also attempts the answer (touch/keyboard fallback). */
export function CountBadge({ value, accent, disabled, wrongFlash, onDropToAnswer, onTapBadge }: CountBadgeProps) {
  return (
    <div className={wrongFlash ? 'play-shake' : ''}>
      <DraggableItem
        id={`badge-${value}`}
        label={`Number ${value}`}
        disabled={disabled}
        testId={`play-badge-${value}`}
        onDrop={(id, zoneId) => {
          if (zoneId === 'answer-slot') onDropToAnswer(value);
        }}
        onTap={() => onTapBadge(value)}
        className="rounded-full"
      >
        <span
          className="min-w-[56px] min-h-[56px] px-4 inline-flex items-center justify-center gap-1 rounded-full font-display text-xl text-white shadow-[0_4px_12px_rgba(27,20,71,0.25)]"
          style={{ background: accent }}
        >
          <GripVertical className="w-4 h-4 opacity-70" aria-hidden="true" />
          {value}
        </span>
      </DraggableItem>
    </div>
  );
}
