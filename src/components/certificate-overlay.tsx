'use client';

import { useEffect, useMemo, memo } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { RefreshCcw } from 'lucide-react';
import { useEngineState } from '@/lib/hooks/useEngineState';

interface CertificateOverlayProps {
  isOpen: boolean;
  tableStarRatings: Record<number, number>;
  quizResults: Record<number, { correct: number; total: number }>;
  onPlayAgain: () => void;
  onPlaySound: (type: string) => void;
}

function CertificateOverlayInner({
  isOpen,
  tableStarRatings,
  quizResults,
  onPlayAgain,
  onPlaySound,
}: CertificateOverlayProps) {
  const { engineState, isEngineLoaded } = useEngineState();
  const { t } = useTranslation();

  useEffect(() => {
    if (isOpen) {
      onPlaySound('certificate');
    }
  }, [isOpen, onPlaySound]);

  const { totalStars, grade } = useMemo(() => {
    let total = 0;
    for (let i = 1; i <= 10; i++) {
      total += tableStarRatings[i] || 1;
    }
    let g = '';
    if (total >= 27) g = 'A';
    else if (total >= 22) g = 'B';
    else if (total >= 17) g = 'C';
    else if (total >= 10) g = 'D';
    else g = 'E';
    return { totalStars: total, grade: g };
  }, [tableStarRatings]);

  if (!isOpen) return null;

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="fixed inset-0 z-[1200] bg-gradient-to-br from-surface to-mist/50 flex items-center justify-center p-6">
      <div className="bg-card border-4 border-gold rounded-[24px] p-8 md:p-7 max-w-[480px] w-full text-center shadow-[0_16px_48px_rgba(0,0,0,0.12)] animate-[pop-in_0.4s_cubic-bezier(0.175,0.885,0.32,1.275)]">
        <div className="font-display text-[clamp(28px,7vw,38px)] text-gold [text-shadow:1px_1px_0_rgba(0,0,0,0.2)]">
          {t('tables.certificateOverlay.title')}
        </div>
        <div className="font-body text-sm text-text-muted mt-1 mb-1">
          {t('tables.certificateOverlay.subtitle')}
        </div>

        <div className="font-body text-xs text-text-dim mb-4">
          {dateStr}
        </div>

        <div className="grid grid-cols-5 gap-1.5 my-3">
          {Array.from({ length: 10 }, (_, i) => i + 1).map((tableIndex) => {
            const starCount = tableStarRatings[tableIndex] || 1;
            const quizResult = quizResults[tableIndex];
            return (
              <div
                key={tableIndex}
                className="font-display text-xs bg-surface rounded-lg py-1.5 px-1 border-[1.5px] border-border-card"
              >
                <span className="block text-sm text-orange">{t('tables.certificateOverlay.tableLabel', { number: tableIndex })}</span>
                <span className="text-[10px] tracking-wider">{'⭐'.repeat(starCount)}</span>
                {quizResult && (
                  <span className="block text-[10px] text-text-dim mt-0.5">
                    {t('tables.certificateOverlay.quizScore', { correct: quizResult.correct, total: quizResult.total })}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <p className="font-display text-lg text-orange my-2">
          <Trans
            i18nKey="tables.certificateOverlay.totalScore"
            values={{ total: totalStars, grade }}
            components={[<strong key="grade" className="text-xl" />]}
          />
        </p>

        {isEngineLoaded && engineState.achievements.filter((a) => a.unlockedAt).length > 0 && (
          <div className="mb-3">
            <p className="font-body text-xs text-text-dim mb-1">{t('tables.certificateOverlay.badgesEarned')}</p>
            <div className="flex flex-wrap justify-center gap-1.5">
              {engineState.achievements.filter((a) => a.unlockedAt).slice(0, 6).map((badge) => (
                <span key={badge.id} className="inline-flex items-center gap-1 bg-warm-bg rounded-full px-2 py-0.5 text-[11px] font-body text-text-secondary border border-warm-border">
                  {badge.icon} {t(`achievements.${badge.id}.label`)}
                </span>
              ))}
            </div>
          </div>
        )}

        <p className="font-body text-xs text-text-dim mb-1">
          {t('tables.certificateOverlay.starsEarned', { stars: engineState.stars })}
        </p>

        <p className="font-body text-xs text-text-dim">{t('tables.certificateOverlay.starsExplanation')}</p>

        <button
          onClick={onPlayAgain}
          className="inline-flex items-center justify-center gap-2 font-display text-lg py-3.5 px-10 rounded-full border-none bg-coral text-white cursor-pointer mt-4 transition-all duration-150 shadow-[0_4px_16px_rgba(255,107,82,0.4)] hover:scale-105 hover:bg-coral-hover active:scale-95"
        >
          <RefreshCcw className="w-5 h-5" strokeWidth={2.5} />
          {t('tables.certificateOverlay.playAgain')}
        </button>
      </div>
    </div>
  );
}

export const CertificateOverlay = memo(CertificateOverlayInner);
