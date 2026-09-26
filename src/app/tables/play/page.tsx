'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { Sparkles } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useAppContext } from '@/lib/contexts/AppContext';
import { TableSelector } from '@/components/table-selector';
import { pickEmojis, resetEmojiPool } from '@/lib/operations/emoji-pool';
import { shuffleArray } from '@/lib/operations/utils';
import type { PracticeProblem } from '@/lib/operations/types';

// Client-only (like QuizOverlay): problems are randomized, so SSR HTML stays deterministic.
const ShowThenAnswerPlayground = dynamic(
  () => import('@/components/playground/show-then-answer').then((m) => m.ShowThenAnswerPlayground),
  { ssr: false }
);

const KINGDOM = '#F5AB3C';

export default function TablesPlayPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { state, isLoaded, switchToTable } = useAppContext();

  const problems = useMemo<PracticeProblem[]>(() => {
    if (!isLoaded) return [];
    resetEmojiPool();
    const emojis = pickEmojis(5);
    const groups = shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]).slice(0, 5);
    return groups.map((group, i) => ({
      operand1: state.currentTable,
      operand2: group,
      operation: 'multiplication' as const,
      result: state.currentTable * group,
      blanks: ['result' as const],
      emojiSafe: true,
      explanation: `${state.currentTable} × ${group} = ${state.currentTable * group}.`,
      emoji: emojis[i],
      tip: t('operations.practiceTip.multiplication'),
    }));
  }, [isLoaded, state.currentTable, t]);

  if (!isLoaded) return null;

  const patternTip = t(`tables.patternDiscovery.patterns.${state.currentTable}.reveal`, '');

  return (
    <div className="font-body min-h-screen bg-paper">
      <div className="max-w-[560px] mx-auto px-4 pt-4">
        <TableSelector
          currentTable={state.currentTable}
          completedTables={state.completedTables}
          difficulty={state.difficulty}
          practiceMode={state.practiceMode}
          onSelectTable={switchToTable}
        />
      </div>
      <ShowThenAnswerPlayground
        key={`${state.currentTable}-${problems.map((p) => p.operand2).join(',')}`}
        operation="multiplication"
        problems={problems}
        accent={KINGDOM}
        symbol="×"
        headerTitle={t('home.trail.worlds.tables.name')}
        tip={
          patternTip ? (
            <div className="w-full bg-card rounded-2xl border-2 border-gold/50 p-3.5 flex items-start gap-2" role="note">
              <Sparkles className="w-5 h-5 shrink-0 text-gold" aria-hidden="true" />
              <p className="font-body text-sm text-text-secondary">{patternTip}</p>
            </div>
          ) : undefined
        }
        onPractice={() => router.push('/tables')}
        onHome={() => router.push('/')}
      />
    </div>
  );
}
