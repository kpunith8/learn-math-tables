'use client';

import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MascotMessage, getMascotHint, getMascotCelebration } from '@/components/mascot-message';
import { getWrongAnswerMessage, getEncouragementMessage } from '@/components/celebration-message';

export interface QuizQuestion {
  label: string;
  correctAnswer: number;
  options: number[];
  hint: string;
}

interface QuizOverlayProps {
  questions: QuizQuestion[];
  onComplete: (correct: number, total: number) => void;
  onSkip: () => void;
  onPlaySound: (type: string) => void;
}

type QuizPhase = 'answering' | 'wrong-hint' | 'retry' | 'correct' | 'finished';

export function QuizOverlay({ questions, onComplete, onSkip, onPlaySound }: QuizOverlayProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { t } = useTranslation();
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [phase, setPhase] = useState<QuizPhase>('answering');
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [retryCorrect, setRetryCorrect] = useState(false);
  const [hintText, setHintText] = useState('');

  const currentQuestion = questions[currentIndex];

  const goToNext = useCallback(() => {
    if (currentIndex + 1 >= questions.length) {
      setPhase('finished');
      onPlaySound('quiz-done');
    } else {
      setCurrentIndex((prev) => prev + 1);
      setPhase('answering');
      setSelectedAnswer(null);
      setRetryCorrect(false);
      setHintText('');
    }
  }, [currentIndex, questions.length, onPlaySound]);

  const handleAnswer = useCallback(
    (option: string) => {
      if (phase !== 'answering') return;
      const isCorrect = Number(option) === currentQuestion.correctAnswer;

      if (isCorrect) {
        setCorrectAnswers((prev) => prev + 1);
        setSelectedAnswer(option);
        setPhase('correct');
        onPlaySound('quiz-correct');
      } else {
        setSelectedAnswer(option);
        setHintText(currentQuestion.hint);
        setPhase('wrong-hint');
        onPlaySound('quiz-wrong');
      }
    },
    [phase, currentQuestion, onPlaySound]
  );

  const handleRetry = useCallback(() => {
    setPhase('retry');
    setSelectedAnswer(null);
  }, []);

  const handleRetryAnswer = useCallback(
    (option: string) => {
      if (phase !== 'retry') return;
      const isCorrect = Number(option) === currentQuestion.correctAnswer;
      setSelectedAnswer(option);

      if (isCorrect) {
        setCorrectAnswers((prev) => prev + 1);
        setRetryCorrect(true);
      }
      setRetryCorrect(isCorrect);
      setTimeout(() => goToNext(), 1000);
    },
    [phase, currentQuestion, goToNext]
  );

  if (!questions.length) return null;

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onSkip(); }}>
      <DialogContent showCloseButton={false} className="max-w-[420px] p-7 md:p-8 text-center">
        <div className="font-display text-sm text-text-dim mb-1" aria-live="polite">
          {phase === 'finished' ? t('quiz.quizComplete') : t('quiz.questionOf', { current: currentIndex + 1, total: questions.length })}
        </div>

        {phase === 'finished' && (
          <div className="mt-3">
            <MascotMessage
              message={correctAnswers === questions.length
                ? t('quiz.results.perfect')
                : correctAnswers >= 3
                  ? t('quiz.results.good')
                  : t('quiz.results.keepTrying')
              }
              mood={correctAnswers === questions.length ? 'excited' : 'happy'}
              className="mb-4"
            />
            <div className="font-display text-[24px] text-orange my-3">
              {correctAnswers === questions.length
                ? t('quiz.results.perfectScoreLine', { correct: correctAnswers, total: questions.length })
                : correctAnswers >= 3
                  ? t('quiz.results.goodScoreLine', { correct: correctAnswers, total: questions.length })
                  : t('quiz.results.keepPractisingLine', { correct: correctAnswers, total: questions.length })}
            </div>
            <Button
              onClick={() => onComplete(correctAnswers, questions.length)}
              variant="indigo"
              size="xl"
            >
              {t('common.buttons.continue')}
            </Button>
          </div>
        )}

        {(phase === 'answering' || phase === 'wrong-hint') && currentQuestion && (
          <div className="min-h-[280px] flex flex-col">
            <div className="font-display text-[clamp(26px,6vw,34px)] text-orange my-3 mb-5">
              {currentQuestion.label}
            </div>

            <div className="grid grid-cols-2 gap-2.5" role="radiogroup" aria-label={t('common.aria.answerOptions')}>
              {currentQuestion.options.map((option) => {
                const isSelected = selectedAnswer === String(option);
                const isCorrect = option === currentQuestion.correctAnswer;
                const isWrong = isSelected && phase === 'wrong-hint';

                let stateClass = 'bg-card border-mist text-text-secondary hover:border-coral hover:bg-paper hover:scale-[1.03]';

                if (isCorrect && phase === 'wrong-hint') {
                  stateClass = 'bg-quiz-correct-bg border-quiz-correct-border text-quiz-correct-text';
                } else if (isWrong) {
                  stateClass = 'bg-quiz-wrong-bg border-quiz-wrong-border text-quiz-wrong-text';
                }

                return (
                  <button
                    key={option}
                    onClick={() => handleAnswer(String(option))}
                    disabled={phase !== 'answering' || isSelected}
                    role="radio"
                    aria-checked={isSelected}
                    className={`font-display text-xl py-3.5 rounded-[14px] border-[2.5px] cursor-pointer transition-all duration-150 ${stateClass} ${phase !== 'answering' ? 'cursor-default' : 'active:scale-95'}`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>

            {phase === 'wrong-hint' && (
              <div className="mt-4 space-y-2">
                <p className="font-body text-sm text-orange bg-warm-bg rounded-[10px] py-2 px-3.5 border-[1.5px] border-warm-border text-center">
                  {getWrongAnswerMessage(t)}
                </p>
                <p className="font-body text-sm text-text-secondary bg-surface rounded-[10px] py-2 px-3.5 border border-border-card text-center">
                  💡 {hintText}
                </p>
                <MascotMessage message={getMascotHint(t)} mood="encouraging" className="mx-auto" />
                <Button
                  onClick={handleRetry}
                  variant="orange"
                  size="xl"
                  className="mt-2"
                >
                  {t('quiz.tryAgain')}
                </Button>
              </div>
            )}
          </div>
        )}

        {phase === 'retry' && currentQuestion && (
          <div className="min-h-[280px] flex flex-col">
            <p className="font-body text-sm text-text-secondary mb-2">
              {getEncouragementMessage(t)}
            </p>
            <div className="font-display text-[clamp(26px,6vw,34px)] text-orange my-2 mb-4">
              {currentQuestion.label}
            </div>

            <div className="grid grid-cols-2 gap-2.5" role="radiogroup" aria-label={t('common.aria.answerOptions')}>
              {currentQuestion.options.map((option) => {
                const isSelected = selectedAnswer === String(option);
                const isCorrect = option === currentQuestion.correctAnswer;
                const revealed = isSelected;

                let stateClass = 'bg-card border-mist text-text-secondary hover:border-coral hover:bg-paper hover:scale-[1.03]';

                if (revealed) {
                  stateClass = isCorrect
                    ? 'bg-quiz-correct-bg border-quiz-correct-border text-quiz-correct-text'
                    : 'bg-quiz-wrong-bg border-quiz-wrong-border text-quiz-wrong-text';
                }

                return (
                  <button
                    key={option}
                    onClick={() => handleRetryAnswer(String(option))}
                    disabled={selectedAnswer !== null}
                    role="radio"
                    aria-checked={isSelected}
                    className={`font-display text-xl py-3.5 rounded-[14px] border-[2.5px] cursor-pointer transition-all duration-150 ${stateClass} ${selectedAnswer ? 'cursor-default' : 'active:scale-95'}`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>

            {retryCorrect && (
              <div className="mt-3 animate-[pop-in_0.3s_ease-out]">
                <MascotMessage message={getMascotCelebration(t)} mood="excited" className="mx-auto" />
              </div>
            )}
          </div>
        )}

        {phase === 'correct' && currentQuestion && (
          <div className="min-h-[280px] flex flex-col items-center justify-center">
            <MascotMessage message={getMascotCelebration(t)} mood="excited" className="mb-4" />
            <Button
              onClick={goToNext}
              variant="indigo"
              size="xl"
            >
              {currentIndex + 1 >= questions.length ? t('quiz.seeResults') : t('quiz.next')}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
