'use client';

import { useState, useRef, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Play, ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface ClipStep {
  title: string;
  caption: string;
  visual: ReactNode;
}

interface ShowClipProps {
  steps: ClipStep[];
  accent: string;
  onDone: () => void;
}

/**
 * Press-to-play animated explainer. Never autoplays. Dots + explicit
 * Back/Next buttons (44px targets); native horizontal swipe advances steps
 * on touch devices. Honors prefers-reduced-motion via global CSS.
 */
export function ShowClip({ steps, accent, onDone }: ShowClipProps) {
  const { t } = useTranslation();
  const [started, setStarted] = useState(false);
  const [index, setIndex] = useState(0);
  const touchX = useRef<number | null>(null);

  if (!started) {
    return (
      <div className="w-full max-w-[420px] bg-card rounded-2xl border-2 border-mist p-6 text-center">
        <p className="font-body text-sm text-text-secondary mb-4">{t('playground.showLabel')}</p>
        <Button onClick={() => setStarted(true)} variant="indigo" size="xl" data-testid="clip-play">
          <Play className="w-5 h-5" />
          {t('playground.pressPlay')}
        </Button>
      </div>
    );
  }

  const step = steps[index];
  const last = index === steps.length - 1;

  const go = (next: number) => {
    setIndex(Math.max(0, Math.min(steps.length - 1, next)));
  };

  return (
    <div
      className="w-full max-w-[420px] bg-card rounded-2xl border-2 border-mist p-5"
      onTouchStart={(e) => {
        touchX.current = e.touches[0].clientX;
      }}
      onTouchEnd={(e) => {
        if (touchX.current == null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        touchX.current = null;
        if (dx < -40) {
          if (last) onDone();
          else go(index + 1);
        } else if (dx > 40) {
          go(index - 1);
        }
      }}
    >
      <div key={index} className="animate-[popup-in_0.25s_ease-out]">
        <h3 className="font-display text-base text-ink text-center">{step.title}</h3>
        <div className="my-3 py-3 px-2 bg-mist/40 rounded-xl min-h-[120px] flex items-center justify-center">
          {step.visual}
        </div>
        <p className="font-body text-sm text-text-secondary text-center leading-relaxed">{step.caption}</p>
      </div>

      <div className="flex justify-center gap-2 mt-3" role="tablist" aria-label="Show steps">
        {steps.map((_, i) => (
          <button
            key={i}
            role="tab"
            aria-selected={i === index}
            aria-label={`Step ${i + 1}`}
            data-testid={`clip-dot-${i}`}
            onClick={() => go(i)}
            className="flex items-center justify-center w-11 h-11 cursor-pointer"
          >
            <span
              className="w-2.5 h-2.5 rounded-full transition-colors duration-200"
              style={{ background: i === index ? accent : 'var(--color-mist)' }}
            />
          </button>
        ))}
      </div>

      <div className="mt-2 flex items-center justify-between gap-3">
        <Button onClick={() => go(index - 1)} disabled={index === 0} variant="secondary" size="lg" data-testid="clip-back">
          <ArrowLeft className="w-4 h-4" />
          {t('playground.stepBack')}
        </Button>
        <button
          onClick={onDone}
          className="font-body text-xs text-text-dim underline underline-offset-2 cursor-pointer min-h-[44px] px-2"
          data-testid="clip-skip"
        >
          {t('playground.skipShow')}
        </button>
        {last ? (
          <Button onClick={onDone} variant="indigo" size="lg" data-testid="clip-next">
            <Check className="w-4 h-4" />
            {t('common.buttons.letsGo')}
          </Button>
        ) : (
          <Button onClick={() => go(index + 1)} variant="indigo" size="lg" data-testid="clip-next">
            {t('playground.stepNext')}
            <ArrowRight className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
