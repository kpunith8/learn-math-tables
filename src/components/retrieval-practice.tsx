'use client';

import { useState, useEffect, useCallback, useMemo, useRef, startTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { getWrongAnswerMessage } from '@/components/celebration-message';
import { CelebrationMessage } from '@/components/celebration-message';

interface RetrievalPracticeProps {
  tableNumber: number;
  weakFacts?: string[];
  onComplete: (results: Array<{ fact: string; correct: boolean }>) => void;
}

function shuffleArray<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

export function RetrievalPractice({ tableNumber, weakFacts, onComplete }: RetrievalPracticeProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { t } = useTranslation();
  const [showAnswer, setShowAnswer] = useState(true);
  const [inputValue, setInputValue] = useState('');
  const [phase, setPhase] = useState<'show' | 'recall' | 'result'>('show');
  const [results, setResults] = useState<Array<{ fact: string; correct: boolean }>>([]);
  const [answerStatus, setAnswerStatus] = useState<'correct' | 'wrong' | null>(null);
  const resultsRef = useRef(results);

  useEffect(() => {
    resultsRef.current = results;
  }, [results]);

  const questions = useMemo(() => {
    const multipliers = weakFacts && weakFacts.length > 0
      ? weakFacts.map((f) => parseInt(f.split('x')[1], 10))
      : Array.from({ length: 10 }, (_, i) => i + 1);

    const uniqueMultipliers = [...new Set(multipliers)];
    const selected = shuffleArray(uniqueMultipliers).slice(0, 5);
    return selected.map((m) => ({ multiplier: m, revealed: false }));
  }, [weakFacts]);

  const currentQuestion = questions[currentIndex];

  useEffect(() => {
    if (!currentQuestion) return;
    if (phase === 'show') {
      startTransition(() => setShowAnswer(true));
      const timer = setTimeout(() => {
        startTransition(() => {
          setShowAnswer(false);
          setPhase('recall');
          setInputValue('');
        });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, currentQuestion, phase]);

  const handleSubmit = useCallback(() => {
    if (!currentQuestion) return;
    const answer = parseInt(inputValue, 10);
    const correctAnswer = tableNumber * currentQuestion.multiplier;
    const correct = answer === correctAnswer;
    const fact = `${tableNumber}×${currentQuestion.multiplier}`;
    const newResult = { fact, correct };

    setAnswerStatus(correct ? 'correct' : 'wrong');
    setPhase('result');
    setResults((prev) => [...prev, newResult]);

    setTimeout(() => {
      if (currentIndex + 1 >= questions.length) {
        onComplete(resultsRef.current.concat(newResult));
      } else {
        setCurrentIndex((prev) => prev + 1);
        setPhase('show');
        setAnswerStatus(null);
      }
    }, 1500);
  }, [currentQuestion, inputValue, tableNumber, currentIndex, questions.length, onComplete]);

  if (questions.length === 0) return null;
  if (!currentQuestion) {
    return (
      <div className="flex justify-center p-4">
        <div className="bg-card rounded-2xl border-2 border-leaf/20 p-5 max-w-[420px] w-full text-center">
          <CelebrationMessage size="small" label={t('tables.retrievalPractice.reviewComplete')} />
          <Button onClick={() => onComplete(results)} variant="indigo" size="xl" className="mt-4">
            {t('common.buttons.continue')}
          </Button>
        </div>
      </div>
    );
  }

  const correctAnswer = tableNumber * currentQuestion.multiplier;

  return (
    <div className="flex justify-center p-4">
      <div className="bg-card rounded-2xl border-2 border-coral/20 p-5 max-w-[420px] w-full text-center">
        <h2 className="font-display text-sm text-coral mb-2">
          {t('tables.retrievalPractice.title')}
        </h2>
        <p className="font-body text-xs text-text-dim mb-3">
          {t('tables.retrievalPractice.questionOf', { current: currentIndex + 1, total: questions.length })}
        </p>

        <div className="font-display text-[clamp(24px,5vw,32px)] text-text-primary mb-4">
          {tableNumber} × {currentQuestion.multiplier}
        </div>

        {phase === 'show' && showAnswer && (
          <div className="animate-[pop-in_0.3s_ease-out]">
            <div className="bg-indigo/5 rounded-xl border-2 border-indigo/20 p-4 mb-3">
              <div className="font-display text-[28px] text-indigo font-bold">
                = {correctAnswer}
              </div>
            </div>
            <p className="font-body text-xs text-text-dim">{t('tables.retrievalPractice.rememberThisAnswer')}</p>
          </div>
        )}

        {phase === 'recall' && (
          <div className="animate-[pop-in_0.3s_ease-out]">
            <p className="font-body text-sm text-text-secondary mb-3">{t('tables.retrievalPractice.whatIsTheAnswer')}</p>
            <div className="flex items-center justify-center gap-2">
              <span className="font-display text-xl text-text-primary">{tableNumber} × {currentQuestion.multiplier} = </span>
              <input
                type="text"
                inputMode="numeric"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSubmit();
                }}
                className="w-[80px] text-center font-display text-xl py-2 rounded-xl border-2 border-border-card focus:border-indigo focus:outline-none"
                aria-label={t('common.aria.enterYourAnswer')}
                autoFocus
              />
            </div>
            <Button
              onClick={handleSubmit}
              variant="indigo"
              size="sm"
              className="mt-3"
              disabled={inputValue === ''}
            >
              <span className="inline-flex items-center justify-center gap-1.5">
                {t('tables.retrievalPractice.checkAnswer')}
                <Check className="w-4 h-4" strokeWidth={2.5} />
              </span>
            </Button>
          </div>
        )}

        {phase === 'result' && (
          <div className="animate-[pop-in_0.3s_ease-out]">
            {answerStatus === 'correct' ? (
              <CelebrationMessage size="small" label={t('tables.retrievalPractice.correct')} />
            ) : (
              <div className="bg-quiz-wrong-bg rounded-xl border-2 border-quiz-wrong-border p-3">
                <p className="font-body text-sm text-quiz-wrong-text">
                  {getWrongAnswerMessage(t)}
                </p>
                <p className="font-display text-lg text-text-primary mt-2">
                  {tableNumber} × {currentQuestion.multiplier} = {correctAnswer}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
