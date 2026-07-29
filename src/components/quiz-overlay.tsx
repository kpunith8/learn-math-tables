'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

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

export function QuizOverlay({ questions, onComplete, onSkip, onPlaySound }: QuizOverlayProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const dialogRef = useRef<HTMLDivElement>(null);
  const focusableRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (dialogRef.current) {
      const firstButton = dialogRef.current.querySelector('button');
      firstButton?.focus();
    }
  }, [currentIndex, isFinished]);

  const handleAnswer = useCallback(
    (option: string) => {
      if (hasAnswered || isFinished) return;
      setHasAnswered(true);
      setSelectedAnswer(option);

      const currentQuestion = questions[currentIndex];
      if (!currentQuestion) return;

      const correctValue = String(currentQuestion.correctAnswer);
      if (option === correctValue) {
        setCorrectAnswers((prev) => prev + 1);
        onPlaySound('quiz-correct');
      } else {
        onPlaySound('quiz-wrong');
        setShowHint(true);
      }

      const displayDelay = option === correctValue ? 800 : 1800;
      setTimeout(() => {
        if (currentIndex + 1 >= questions.length) {
          setIsFinished(true);
          onPlaySound('quiz-done');
        } else {
          setCurrentIndex((prev) => prev + 1);
          setHasAnswered(false);
          setSelectedAnswer(null);
          setShowHint(false);
        }
      }, displayDelay);
    },
    [hasAnswered, isFinished, currentIndex, questions, onPlaySound]
  );

  if (!questions.length) return null;

  const currentQuestion = questions[currentIndex];

  return (
    <div
      className="fixed inset-0 z-[1100] bg-black/50 flex items-center justify-center p-5"
      role="dialog"
      aria-modal="true"
      aria-label="Quiz"
    >
      <div
        ref={dialogRef}
        className="bg-white rounded-3xl p-7 md:p-8 max-w-[420px] w-full shadow-[0_12px_40px_rgba(0,0,0,0.2)] text-center animate-[pop-in_0.35s_cubic-bezier(0.175,0.885,0.32,1.275)]"
      >
        <div className="font-display text-sm text-text-dim mb-1" aria-live="polite">
          {isFinished ? 'Quiz Complete!' : `Question ${currentIndex + 1} of ${questions.length}`}
        </div>

        {!isFinished && currentQuestion && (
          <div className="min-h-[280px] flex flex-col">
            <div className="quiz-question font-display text-[clamp(26px,6vw,34px)] text-orange my-3 mb-5">
              {currentQuestion.label}
            </div>

            <div className="grid grid-cols-2 gap-2.5" role="radiogroup" aria-label="Answer options">
              {currentQuestion.options.map((option) => {
                const optionStr = String(option);
                const isCorrect = option === currentQuestion.correctAnswer;
                const isWrong = selectedAnswer === optionStr && !isCorrect;
                const revealed = hasAnswered && (isCorrect || isWrong);

                let stateClass = 'bg-card-hover border-border-card text-text-secondary hover:border-indigo-light hover:bg-surface hover:scale-[1.03]';
                let stateText = '';

                if (revealed) {
                  if (isCorrect) {
                    stateClass = 'correct bg-quiz-correct-bg border-quiz-correct-border text-quiz-correct-text';
                    stateText = '(Correct)';
                  } else {
                    stateClass = 'wrong bg-quiz-wrong-bg border-quiz-wrong-border text-quiz-wrong-text';
                    stateText = '(Wrong)';
                  }
                }

                return (
                  <button
                    key={option}
                    ref={!hasAnswered ? focusableRef : undefined}
                    onClick={() => handleAnswer(optionStr)}
                    disabled={hasAnswered}
                    role="radio"
                    aria-checked={selectedAnswer === optionStr}
                    aria-label={`${option}${revealed ? ` ${stateText}` : ''}`}
                    className={`font-display text-xl py-3.5 rounded-[14px] border-[2.5px] cursor-pointer transition-all duration-150 ${stateClass} ${hasAnswered ? 'cursor-default hover:scale-100' : 'active:scale-95'}`}
                  >
                    {option}
                    {revealed && (
                      <span className="sr-only">{stateText}</span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="min-h-[40px] mt-3 flex items-start" aria-live="polite" aria-atomic="true">
              {showHint && (
                <div className="font-body text-sm text-orange bg-warm-bg rounded-[10px] py-2 px-3.5 border-[1.5px] border-warm-border text-center w-full animate-[popup-in_0.25s_ease-out]">
                  {currentQuestion.hint}
                </div>
              )}
            </div>

            <button
              onClick={onSkip}
              className={`mt-4 font-body text-[13px] text-text-dim bg-transparent border-none cursor-pointer py-1.5 px-3 rounded-lg transition-colors duration-150 hover:text-orange ${hasAnswered ? 'invisible' : ''}`}
            >
              Skip quiz →
            </button>
          </div>
        )}

        {isFinished && (
          <div className="mt-3">
            <div className="font-display text-[24px] text-orange my-3">
              {correctAnswers === questions.length
                ? `Perfect score! ${correctAnswers}/${questions.length}`
                : correctAnswers >= 3
                  ? `Great job! ${correctAnswers}/${questions.length}`
                  : `Keep practising! ${correctAnswers}/${questions.length}`}
            </div>
            <p className="sr-only">
              You got {correctAnswers} out of {questions.length} correct.
            </p>
            <button
              onClick={() => onComplete(correctAnswers, questions.length)}
              className="font-display text-base py-3 px-8 rounded-full border-none bg-indigo text-white cursor-pointer transition-all duration-150 shadow-[0_4px_12px_rgba(79,70,229,0.3)] hover:scale-105 active:scale-95"
            >
              Continue
            </button>
          </div>
        )}
      </div>
    </div>
  );
}