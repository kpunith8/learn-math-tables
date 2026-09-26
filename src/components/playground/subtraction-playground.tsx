'use client';

import { useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, ArrowRight, Cookie } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAudio } from '@/lib/hooks/useAudio';
import type { PracticeProblem } from '@/lib/operations/types';
import { PlaygroundShell } from './PlaygroundShell';
import { DropZone, flyClone } from './drag-core';
import { Manipulative, TokenFace } from './Manipulative';
import { CountBadge } from './CountBadge';
import { buildTokens, makeAnswerOptions, type Token } from './playground-utils';
import { getMascotHint } from '@/components/mascot-message';

const TOTAL_ROUNDS = 5;

interface SubtractionPlaygroundProps {
  problems: PracticeProblem[];
  accent: string;
  onPractice: () => void;
  onHome: () => void;
}

export function SubtractionPlayground({ problems, accent, onPractice, onHome }: SubtractionPlaygroundProps) {
  const { t } = useTranslation();
  const { playSound } = useAudio();
  const [roundIndex, setRoundIndex] = useState(0);
  const [removedIds, setRemovedIds] = useState<Set<string>>(new Set());
  const [answered, setAnswered] = useState(false);
  const [lastWrong, setLastWrong] = useState<number | null>(null);
  const [wrongCount, setWrongCount] = useState(0);

  const rounds = useMemo(() => problems.slice(0, TOTAL_ROUNDS), [problems]);
  const problem = rounds[Math.min(roundIndex, rounds.length - 1)];
  const done = rounds.length > 0 && roundIndex >= rounds.length;

  // The bar shows exactly the items to remove (`b`), grouped as tens +
  // singles — always directly draggable, no break-apart needed. What's left
  // (`a − b`) is revealed grouped once everything is removed.
  const { tokensA } = useMemo(
    () => (problem ? buildTokens(problem.operand2, 0) : { tokensA: [], tokensB: [] }),
    [problem]
  );
  const removedSum = useMemo(
    () => tokensA.filter((tok) => removedIds.has(tok.id)).reduce((s, tok) => s + Math.abs(tok.value), 0),
    [tokensA, removedIds]
  );
  const manipulated = problem != null && removedIds.size === tokensA.length && tokensA.length > 0;
  const remainingValue = problem ? problem.operand1 - removedSum : 0;

  const leftoverTokens = useMemo(
    () => (problem ? buildTokens(problem.result, 0).tokensA : []),
    [problem]
  );

  const options = useMemo(() => (problem ? makeAnswerOptions(problem.result) : []), [problem]);

  const removeToken = useCallback(
    (token: Token) => {
      if (!problem || answered || removedIds.has(token.id)) return;
      flyClone(`play-token-${token.id}`, 'play-dropzone');
      setRemovedIds((prev) => new Set(prev).add(token.id));
      playSound('click');
      try {
        navigator.vibrate?.(10);
      } catch {}
    },
    [answered, playSound, problem, removedIds]
  );

  const handleDropToken = useCallback(
    (token: Token, zoneId: string | null) => {
      if (zoneId === 'eat-zone') removeToken(token);
    },
    [removeToken]
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
    setRemovedIds(new Set());
    setAnswered(false);
    setLastWrong(null);
    playSound('click');
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [playSound]);

  const replay = useCallback(() => {
    setRoundIndex(0);
    setRemovedIds(new Set());
    setAnswered(false);
    setLastWrong(null);
    playSound('click');
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [playSound]);

  return (
    <PlaygroundShell
      operation="subtraction"
      accent={accent}
      roundLabel={done ? t('playground.sessionDone') : t('playground.roundOf', { current: Math.min(roundIndex + 1, TOTAL_ROUNDS), total: TOTAL_ROUNDS })}
      currentRound={Math.min(roundIndex, TOTAL_ROUNDS - 1)}
      totalRounds={TOTAL_ROUNDS}
      hint={getMascotHint(t, 'subtraction')}
      done={done}
      onReplay={replay}
      onPractice={onPractice}
      onHome={onHome}
    >
      {!done && problem && (
        <div className="w-full max-w-[480px] flex flex-col items-center gap-4">
          <div className="font-display text-[clamp(22px,6vw,32px)] text-center" style={{ color: accent }} data-testid="play-equation">
            {problem.operand1} − {problem.operand2} = ?
          </div>

          {!manipulated ? (
            <>
              <p className="font-body text-sm text-text-secondary text-center">
                {t('playground.removeHint', { count: problem.operand2 })}
              </p>
              <div className="w-full bg-card rounded-2xl border-2 border-mist p-3">
                <p className="font-display text-sm text-ink text-center mb-2" aria-live="polite">
                  {t('playground.remaining', { count: remainingValue })}
                </p>
                <div className="flex flex-wrap gap-1.5 justify-center min-h-[60px]">
                  {tokensA
                    .filter((tok) => !removedIds.has(tok.id))
                    .map((tok) => (
                      <Manipulative key={tok.id} token={tok} emoji={problem.emoji} accent={accent} onDropToken={handleDropToken} onTapToken={removeToken} />
                    ))}
                </div>
              </div>
              <DropZone id="eat-zone" label={t('playground.eatZone')} accent={accent} testId="play-dropzone" className="w-full">
                <p className="font-display text-base text-ink flex items-center justify-center gap-1.5">
                  <Cookie className="w-5 h-5" aria-hidden="true" />
                  {t('playground.eatZone')}
                </p>
                <p key={removedIds.size} className="font-display text-3xl mt-1 animate-[pop-in_0.25s_ease-out]" style={{ color: accent }} aria-live="polite">
                  {removedSum} / {problem.operand2}
                </p>
              </DropZone>
            </>
          ) : !answered ? (
            <>
              <div className="w-full bg-card rounded-2xl border-2 border-mist p-3">
                <p className="font-display text-sm text-ink text-center mb-2" aria-live="polite">
                  {t('playground.remaining', { count: problem.result })}
                </p>
                <div className="flex flex-wrap gap-1.5 justify-center min-h-[60px]">
                  {leftoverTokens.map((tok) => (
                    <TokenFace key={tok.id} token={tok} emoji={problem.emoji} accent={accent} small />
                  ))}
                </div>
              </div>
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
                {problem.operand1} − {problem.operand2} = {problem.result}
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
