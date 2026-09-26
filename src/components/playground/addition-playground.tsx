'use client';

import { useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, ArrowRight, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAudio } from '@/lib/hooks/useAudio';
import type { PracticeProblem } from '@/lib/operations/types';
import { PlaygroundShell } from './PlaygroundShell';
import { DropZone, flyClone } from './drag-core';
import { Manipulative } from './Manipulative';
import { CountBadge } from './CountBadge';
import { buildTokens, makeAnswerOptions, type Token } from './playground-utils';
import { getMascotHint } from '@/components/mascot-message';

const TOTAL_ROUNDS = 5;

interface AdditionPlaygroundProps {
  problems: PracticeProblem[];
  accent: string;
  onPractice: () => void;
  onHome: () => void;
}

export function AdditionPlayground({ problems, accent, onPractice, onHome }: AdditionPlaygroundProps) {
  const { t } = useTranslation();
  const { playSound } = useAudio();
  const [roundIndex, setRoundIndex] = useState(0);
  const [droppedIds, setDroppedIds] = useState<Set<string>>(new Set());
  const [answered, setAnswered] = useState(false);
  const [lastWrong, setLastWrong] = useState<number | null>(null);
  const [wrongCount, setWrongCount] = useState(0);

  const rounds = useMemo(() => problems.slice(0, TOTAL_ROUNDS), [problems]);
  const problem = rounds[Math.min(roundIndex, rounds.length - 1)];
  const done = rounds.length > 0 && roundIndex >= rounds.length;

  const { tokensA, tokensB } = useMemo(
    () => (problem ? buildTokens(problem.operand1, problem.operand2) : { tokensA: [], tokensB: [] }),
    [problem]
  );
  const allTokens = useMemo(() => [...tokensA, ...tokensB], [tokensA, tokensB]);
  const droppedSum = useMemo(
    () => allTokens.filter((tok) => droppedIds.has(tok.id)).reduce((s, tok) => s + tok.value, 0),
    [allTokens, droppedIds]
  );
  const manipulated = problem != null && droppedIds.size === allTokens.length && allTokens.length > 0;

  const options = useMemo(() => (problem ? makeAnswerOptions(problem.result) : []), [problem]);

  const dropToken = useCallback(
    (token: Token) => {
      if (answered || droppedIds.has(token.id)) return;
      flyClone(`play-token-${token.id}`, 'play-dropzone');
      setDroppedIds((prev) => new Set(prev).add(token.id));
      playSound('click');
      try {
        navigator.vibrate?.(10);
      } catch {}
    },
    [answered, droppedIds, playSound]
  );

  const handleDropToken = useCallback(
    (token: Token, zoneId: string | null) => {
      if (zoneId === 'merge-pot') dropToken(token);
      // Misses snap back automatically (transform clears in DraggableItem).
    },
    [dropToken]
  );

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
    setDroppedIds(new Set());
    setAnswered(false);
    setLastWrong(null);
    playSound('click');
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [playSound]);

  const replay = useCallback(() => {
    setRoundIndex(0);
    setDroppedIds(new Set());
    setAnswered(false);
    setLastWrong(null);
    playSound('click');
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [playSound]);

  const remaining = (tokens: Token[]) => tokens.filter((tok) => !droppedIds.has(tok.id));

  return (
    <PlaygroundShell
      operation="addition"
      accent={accent}
      roundLabel={done ? t('playground.sessionDone') : t('playground.roundOf', { current: Math.min(roundIndex + 1, TOTAL_ROUNDS), total: TOTAL_ROUNDS })}
      currentRound={Math.min(roundIndex, TOTAL_ROUNDS - 1)}
      totalRounds={TOTAL_ROUNDS}
      hint={getMascotHint(t, 'addition')}
      done={done}
      onReplay={replay}
      onPractice={onPractice}
      onHome={onHome}
    >
      {!done && problem && (
        <div className="w-full max-w-[480px] flex flex-col items-center gap-4">
          <div className="font-display text-[clamp(22px,6vw,32px)] text-center" style={{ color: accent }} data-testid="play-equation">
            {problem.operand1} + {problem.operand2} = ?
          </div>

          {!manipulated ? (
            <>
              <p className="font-body text-sm text-text-secondary text-center">{t('playground.dragHint')}</p>
              <div className="grid grid-cols-2 gap-3 w-full">
                <div className="bg-card rounded-2xl border-2 border-mist p-3">
                  <p className="font-display text-sm text-ink text-center mb-2">
                    <Plus className="w-4 h-4 inline-block mr-1" aria-hidden="true" />
                    {problem.operand1}
                  </p>
                  <div className="flex flex-wrap gap-1.5 justify-center min-h-[60px]">
                    {remaining(tokensA).map((tok) => (
                      <Manipulative key={tok.id} token={tok} emoji={problem.emoji} accent={accent} onDropToken={handleDropToken} onTapToken={dropToken} />
                    ))}
                  </div>
                </div>
                <div className="bg-card rounded-2xl border-2 border-mist p-3">
                  <p className="font-display text-sm text-ink text-center mb-2">
                    <Plus className="w-4 h-4 inline-block mr-1" aria-hidden="true" />
                    {problem.operand2}
                  </p>
                  <div className="flex flex-wrap gap-1.5 justify-center min-h-[60px]">
                    {remaining(tokensB).map((tok) => (
                      <Manipulative key={tok.id} token={tok} emoji={problem.emoji} accent={accent} onDropToken={handleDropToken} onTapToken={dropToken} />
                    ))}
                  </div>
                </div>
              </div>
              <DropZone id="merge-pot" label={t('playground.mergePot')} accent={accent} testId="play-dropzone" className="w-full">
                <p className="font-display text-base text-ink">{t('playground.mergePot')}</p>
                <p key={droppedIds.size} className="font-display text-3xl mt-1 animate-[pop-in_0.25s_ease-out]" style={{ color: accent }} aria-live="polite">
                  {droppedSum}
                </p>
              </DropZone>
            </>
          ) : !answered ? (
            <>
              <p className="font-body text-sm text-text-secondary text-center">{t('playground.tapHint')}</p>
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
                {problem.operand1} + {problem.operand2} = {problem.result}
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
