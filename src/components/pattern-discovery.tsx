'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { ArrowRight, Search } from 'lucide-react';

const buildPattern = (tableNumber: number): string =>
  Array.from({ length: 10 }, (_, i) => (i + 1) * tableNumber).join(', ');

interface PatternDiscoveryProps {
  tableNumber: number;
  onComplete: () => void;
}

export function PatternDiscovery({ tableNumber, onComplete }: PatternDiscoveryProps) {
  const [showReveal, setShowReveal] = useState(false);
  const { t } = useTranslation();
  const pattern = buildPattern(tableNumber);

  return (
    <div className="flex justify-center p-4">
      <div className="bg-card rounded-2xl border-2 border-coral/20 p-5 max-w-[420px] w-full text-center">
        <Search className="w-9 h-9 mx-auto mb-2 text-ink" strokeWidth={2} aria-hidden="true" />
        <h2 className="font-display text-lg text-text-primary font-bold mb-1">
          {t('tables.patternDiscovery.title', { table: tableNumber })}
        </h2>

        <div className="font-display text-base text-coral font-semibold my-3 tracking-wide">
          {pattern}
        </div>

        <p className="font-display text-sm text-error mb-3">{t(`tables.patternDiscovery.patterns.${tableNumber}.discovery`)}</p>

        {!showReveal && (
          <>
            <p className="font-body text-xs text-text-muted mb-1">{t(`tables.patternDiscovery.patterns.${tableNumber}.example`)}</p>
            <div className="h-px bg-mist/50 my-3" />
            <Button
              onClick={() => setShowReveal(true)}
              variant="indigo"
              size="sm"
            >
              <span className="inline-flex items-center justify-center gap-1.5">
                {t('tables.patternDiscovery.showPatternButton')}
                <ArrowRight className="w-4 h-4" />
              </span>
            </Button>
          </>
        )}

        {showReveal && (
          <div className="animate-[pop-in_0.3s_ease-out] motion-reduce:animate-none">
            <div className="bg-warm-bg rounded-xl border border-warm-border p-3 mb-3">
              <p className="font-body text-sm text-text-secondary">{t(`tables.patternDiscovery.patterns.${tableNumber}.reveal`)}</p>
            </div>
            <Button
              onClick={onComplete}
              variant="indigo"
            >
              <span className="inline-flex items-center justify-center gap-1.5">
                {t('tables.patternDiscovery.startTableButton', { table: tableNumber })}
                <ArrowRight className="w-4 h-4" />
              </span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
