'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

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
        <div className="text-[36px] mb-2">🔍</div>
        <h2 className="font-display text-lg text-text-primary font-bold mb-1">
          {t('tables.patternDiscovery.title', { table: tableNumber })}
        </h2>

        <div className="font-display text-base text-coral font-semibold my-3 tracking-wide">
          {pattern}
        </div>

        <p className="font-display text-sm text-orange mb-3">{t(`tables.patternDiscovery.patterns.${tableNumber}.discovery`)}</p>

        {!showReveal && (
          <>
            <p className="font-body text-xs text-text-muted mb-1">{t(`tables.patternDiscovery.patterns.${tableNumber}.example`)}</p>
            <div className="h-px bg-mist/50 my-3" />
            <Button
              onClick={() => setShowReveal(true)}
              variant="indigo"
              size="sm"
            >
              {t('tables.patternDiscovery.showPatternButton')}
            </Button>
          </>
        )}

        {showReveal && (
          <div className="animate-[pop-in_0.3s_ease-out]">
            <div className="bg-warm-bg rounded-xl border border-warm-border p-3 mb-3">
              <p className="font-body text-sm text-text-secondary">{t(`tables.patternDiscovery.patterns.${tableNumber}.reveal`)}</p>
            </div>
            <Button
              onClick={onComplete}
              variant="indigo"
            >
              {t('tables.patternDiscovery.startTableButton', { table: tableNumber })}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
