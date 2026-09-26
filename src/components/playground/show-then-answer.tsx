'use client';

import { useState, useMemo, useCallback, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, ArrowRight, LayoutGrid, UtensilsCrossed } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAudio } from '@/lib/hooks/useAudio';
import type { PracticeProblem } from '@/lib/operations/types';
import type { Operation } from '@/lib/operations/types';
import { PlaygroundShell } from './PlaygroundShell';
import { DropZone, flyClone } from './drag-core';
import { CountBadge } from './CountBadge';
import { ShowClip, type ClipStep } from './ShowClip';
import { TokenFace } from './Manipulative';
import { buildTokens, makeAnswerOptions } from './playground-utils';
import { getMascotHint } from '@/components/mascot-message';

const TOTAL_ROUNDS = 5;

function Chip({ label, accent }: { label: string; accent: string }) {
  return (
    <span
      className="inline-flex items-center justify-center min-w-[52px] min-h-[52px] px-2.5 rounded-xl font-display text-base text-white shadow-[0_2px_6px_rgba(27,20,71,0.2)]"
      style={{ background: accent }}
    >
      {label}
    </span>
  );
}

function buildMultiplicationSteps(p: PracticeProblem, accent: string): ClipStep[] {
  const { operand1: a, operand2: b, result, emoji } = p;
  const small = a > 0 && a <= 6 && b > 0 && b <= 6;
  const groupsVisual = small ? (
    <div className="flex flex-col gap-1.5 items-center" aria-hidden="true">
      {Array.from({ length: a }, (_, r) => (
        <div key={r} className="flex gap-1 justify-center">
          {Array.from({ length: b }, (_, c) => (
            <span key={c} className="text-[22px] leading-none">
              {emoji}
            </span>
          ))}
        </div>
      ))}
    </div>
  ) : (
    <div className="flex flex-wrap gap-1.5 justify-center max-w-[300px]" aria-hidden="true">
      {Array.from({ length: Math.min(Math.abs(a), 12) }, (_, i) => (
        <Chip key={i} label={`×${b}`} accent={accent} />
      ))}
      {Math.abs(a) > 12 && <Chip label={`+${Math.abs(a) - 12}`} accent={accent} />}
      {a === 0 && <Chip label="0 groups" accent={accent} />}
    </div>
  );

  const shown = Math.min(Math.abs(a) || 1, 4);
  const partials = Array.from({ length: shown }, (_, k) => (k + 1) * b);
  const skipVisual = (
    <div className="flex flex-wrap gap-1.5 justify-center items-center" aria-hidden="true">
      {partials.map((v, i) => (
        <Chip key={i} label={String(v)} accent={accent} />
      ))}
      {(Math.abs(a) || 1) > 4 && (
        <>
          <span className="font-display text-lg text-text-dim">…</span>
          <Chip label={String(result)} accent={accent} />
        </>
      )}
    </div>
  );

  return [
    {
      title: `${a} groups of ${b}`,
      caption: a === 0 || b === 0 ? 'Zero groups means zero items — the answer is 0!' : `Count the groups: there are ${a} groups with ${b} in each.`,
      visual: groupsVisual,
    },
    {
      title: 'Skip-count to go fast',
      caption: `Skip-count by ${b}: ${partials.join(', ')}${(Math.abs(a) || 1) > 4 ? ` … ${result}` : ''}. Multiplication is fast adding!`,
      visual: skipVisual,
    },
    {
      title: `${a} × ${b} = ${result}`,
      caption: `All together that makes ${result}. Now drag the answer!`,
      visual: (
        <span className="font-display text-4xl" style={{ color: accent }} aria-hidden="true">
          {result}
        </span>
      ),
    },
  ];
}

function buildDivisionSteps(p: PracticeProblem, accent: string): ClipStep[] {
  const { operand1: a, operand2: b, result, emoji } = p;
  // Same tens-grouping as addition/subtraction: 10-blocks + singles (e.g.
  // 23 → 10, 10, 1, 1, 1), never a capped emoji row with a "+N" chip.
  const totalTokens = buildTokens(a, 0).tokensA;
  const totalVisual = (
    <div className="flex flex-wrap gap-1.5 justify-center max-w-[300px]" aria-hidden="true">
      {totalTokens.map((tok) => (
        <TokenFace key={tok.id} token={tok} emoji={emoji} accent={accent} small />
      ))}
    </div>
  );

  // Each plate shows its fair share grouped the same way (mini faces) when it
  // fits; otherwise plates stay labeled with the share count.
  const perPlate = buildTokens(result, 0).tokensA;
  const showPlateContents = b * perPlate.length <= 36;
  const shownPlates = Math.min(b, 9);
  const dealVisual = (
    <div className="flex flex-wrap gap-1.5 justify-center max-w-[300px]" aria-hidden="true">
      {Array.from({ length: shownPlates }, (_, i) => (
        <span
          key={i}
          className="inline-flex flex-col items-center justify-center min-w-[52px] min-h-[52px] px-2 py-1.5 rounded-xl border-2 bg-card font-display text-sm text-ink gap-1"
          style={{ borderColor: accent }}
        >
          <span className="inline-flex items-center gap-1">
            <UtensilsCrossed className="w-4 h-4" aria-hidden="true" />
            {result}
          </span>
          {showPlateContents && (
            <span className="flex flex-wrap gap-0.5 justify-center max-w-[110px]">
              {perPlate.map((tok) => (
                <TokenFace key={`${i}-${tok.id}`} token={tok} emoji={emoji} accent={accent} small />
              ))}
            </span>
          )}
        </span>
      ))}
      {b > shownPlates && <Chip label={`+${b - shownPlates}`} accent={accent} />}
    </div>
  );

  return [
    {
      title: `Share ${a} fairly`,
      caption: `${a} items for ${b} groups — everyone must get the same amount!`,
      visual: totalVisual,
    },
    {
      title: 'Deal one by one',
      caption: `Give one to each group, then repeat — each group ends up with ${result}.`,
      visual: dealVisual,
    },
    {
      title: `${a} ÷ ${b} = ${result}`,
      caption: `Each group gets ${result}. Now drag the answer!`,
      visual: (
        <span className="font-display text-4xl" style={{ color: accent }} aria-hidden="true">
          {result}
        </span>
      ),
    },
  ];
}

interface ShowThenAnswerProps {
  operation: Operation;
  problems: PracticeProblem[];
  accent: string;
  symbol: string;
  tip?: ReactNode;
  onPractice: () => void;
  onHome: () => void;
  headerTitle?: string;
}

export function ShowThenAnswerPlayground({ operation, problems, accent, symbol, tip, onPractice, onHome, headerTitle }: ShowThenAnswerProps) {
  const { t } = useTranslation();
  const { playSound } = useAudio();
  const [roundIndex, setRoundIndex] = useState(0);
  const [clipDone, setClipDone] = useState(false);
  const [answered, setAnswered] = useState(false);
  const [lastWrong, setLastWrong] = useState<number | null>(null);
  const [wrongCount, setWrongCount] = useState(0);

  const rounds = useMemo(() => problems.slice(0, TOTAL_ROUNDS), [problems]);
  const problem = rounds[Math.min(roundIndex, rounds.length - 1)];
  const done = rounds.length > 0 && roundIndex >= rounds.length;

  const steps = useMemo(
    () => (problem ? (operation === 'multiplication' ? buildMultiplicationSteps(problem, accent) : buildDivisionSteps(problem, accent)) : []),
    [accent, operation, problem]
  );
  const options = useMemo(() => (problem ? makeAnswerOptions(problem.result) : []), [problem]);

  const handleClipDone = useCallback(() => {
    setClipDone(true);
    playSound('click');
  }, [playSound]);

  const attemptAnswer = useCallback(
    (value: number) => {
      if (!problem || answered) return;
      flyClone(`play-badge-${value}`, 'play-answer-slot');
      if (value === problem.result) {
        setAnswered(true);
        setLastWrong(null);
        playSound('quiz-correct');
        try {
          navigator.vibrate?.(20);
        } catch {}
      } else {
        setLastWrong(value);
        setWrongCount((c) => c + 1);
        playSound('quiz-wrong');
      }
    },
    [answered, playSound, problem]
  );

  const nextRound = useCallback(() => {
    setRoundIndex((i) => i + 1);
    setClipDone(false);
    setAnswered(false);
    setLastWrong(null);
    playSound('click');
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [playSound]);

  const replay = useCallback(() => {
    setRoundIndex(0);
    setClipDone(false);
    setAnswered(false);
    setLastWrong(null);
    playSound('click');
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [playSound]);

  return (
    <PlaygroundShell
      operation={operation}
      accent={accent}
      headerTitle={headerTitle}
      roundLabel={done ? t('playground.sessionDone') : t('playground.roundOf', { current: Math.min(roundIndex + 1, TOTAL_ROUNDS), total: TOTAL_ROUNDS })}
      currentRound={Math.min(roundIndex, TOTAL_ROUNDS - 1)}
      totalRounds={TOTAL_ROUNDS}
      hint={getMascotHint(t, operation)}
      done={done}
      onReplay={replay}
      onPractice={onPractice}
      onHome={onHome}
    >
      {!done && problem && (
        <div className="w-full max-w-[480px] flex flex-col items-center gap-4">
          <div className="font-display text-[clamp(22px,6vw,32px)] text-center" style={{ color: accent }} data-testid="play-equation">
            {problem.operand1} {symbol} {problem.operand2} = ?
          </div>

          {tip}

          {!clipDone ? (
            <ShowClip key={`${roundIndex}-${problem.operand1}-${problem.operand2}`} steps={steps} accent={accent} onDone={handleClipDone} />
          ) : !answered ? (
            <>
              <p className="font-body text-sm text-text-secondary text-center">
                {operation === 'multiplication' ? (
                  <span className="inline-flex items-center gap-1">
                    <LayoutGrid className="w-4 h-4" aria-hidden="true" />
                    {t('playground.tapHint')}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1">
                    <UtensilsCrossed className="w-4 h-4" aria-hidden="true" />
                    {t('playground.tapHint')}
                  </span>
                )}
              </p>
              <DropZone id="answer-slot" label={t('playground.answerSlot')} accent={accent} testId="play-answer-slot" className="w-full">
                <p className="font-display text-base text-ink">{t('playground.answerSlot')}</p>
                <p className="font-display text-3xl mt-1" style={{ color: accent }}>
                  ?
                </p>
              </DropZone>
              {lastWrong != null && (
                <p className="font-body text-sm text-orange" role="alert">
                  {t('playground.wrongBadge')}
                </p>
              )}
              <div className="flex items-center justify-center gap-3 flex-wrap">
                {options.map((value) => (
                  <CountBadge
                    key={`${value}-${value === lastWrong ? wrongCount : 0}`}
                    value={value}
                    accent={accent}
                    wrongFlash={value === lastWrong}
                    onDropToAnswer={attemptAnswer}
                    onTapBadge={attemptAnswer}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="w-full bg-card rounded-2xl border-2 border-leaf/40 p-5 text-center animate-[pop-in_0.25s_ease-out]" role="status">
              <p className="font-display text-lg text-leaf flex items-center justify-center gap-1.5">
                <Check className="w-6 h-6" strokeWidth={2.5} />
                {t('playground.correctRound')}
              </p>
              <p className="font-display text-2xl mt-1" style={{ color: accent }}>
                {problem.operand1} {symbol} {problem.operand2} = {problem.result}
              </p>
              <Button onClick={nextRound} variant="indigo" size="xl" className="mt-4" data-testid="play-next-round">
                {roundIndex + 1 >= TOTAL_ROUNDS ? t('playground.sessionDone') : t('common.buttons.next')}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      )}

      {done && (
        <div className="w-full max-w-[420px] bg-card rounded-2xl border-2 border-gold/50 p-6 text-center animate-[pop-in_0.3s_ease-out]" role="status">
          <p className="font-display text-lg text-ink">{t('playground.sessionDone')}</p>
          <p className="font-body text-sm text-text-secondary mt-1">{t('playground.tapHint')}</p>
        </div>
      )}
    </PlaygroundShell>
  );
}

export function MultiplicationPlayground(props: Omit<ShowThenAnswerProps, 'operation' | 'symbol'>) {
  return <ShowThenAnswerPlayground {...props} operation="multiplication" symbol="×" />;
}

export function DivisionPlayground(props: Omit<ShowThenAnswerProps, 'operation' | 'symbol'>) {
  return <ShowThenAnswerPlayground {...props} operation="division" symbol="÷" />;
}
