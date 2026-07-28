'use client';

import { useState, useCallback, useEffect } from 'react';

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

  useEffect(() => {
    if (isFinished) {
      onPlaySound('quiz-done');
    }
  }, [isFinished, onPlaySound]);

  if (!questions.length) return null;

  const currentQuestion = questions[currentIndex];

  return (
    <div className="quiz-overlay fixed inset-0 z-[1100] bg-black/50 flex items-center justify-center p-5 opacity-100 pointer-events-auto transition-opacity duration-300">
        <div className="quiz-dialog bg-white rounded-3xl p-7 md:p-8 max-w-[420px] w-full shadow-[0_12px_40px_rgba(0,0,0,0.2)] text-center animate-[pop-in_0.35s_cubic-bezier(0.175,0.885,0.32,1.275)]">
          <div className="quiz-progress-header font-display text-sm text-[#aaa] mb-1">
            {isFinished ? 'Quiz Complete!' : `Question ${currentIndex + 1} of ${questions.length}`}
          </div>

        {!isFinished && currentQuestion && (
          <div className="min-h-[280px] flex flex-col">
            <div className="quiz-question font-display text-[clamp(26px,6vw,34px)] text-[#C2410C] my-3 mb-5">
              {currentQuestion.label}
            </div>
            <div className="quiz-options grid grid-cols-2 gap-2.5">
              {currentQuestion.options.map((option) => {
                const optionStr = String(option);
                const isCorrect = option === currentQuestion.correctAnswer;
                const isWrong = selectedAnswer === optionStr && !isCorrect;

                return (
                  <button
                    key={option}
                    onClick={() => handleAnswer(optionStr)}
                    disabled={hasAnswered}
                    className={`quiz-option font-display text-xl py-3.5 rounded-[14px] border-[2.5px] cursor-pointer transition-all duration-150
                      ${isCorrect && hasAnswered
                        ? 'correct bg-[#C8E6C9] border-[#4CAF50] text-[#2E7D32]'
                        : isWrong
                          ? 'wrong bg-[#FFCDD2] border-[#E53935] text-[#B71C1C]'
                          : 'bg-[#FAFAFA] border-[#E2E8F0] text-[#555] hover:border-[#6366F1] hover:bg-[#F5F5F5] hover:scale-[1.03]'
                      }
                      ${hasAnswered ? 'cursor-default hover:scale-100' : 'active:scale-95'}`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
            <div className="min-h-[40px] mt-3 flex items-start">
              {showHint && (
                <div className="quiz-hint font-body text-sm text-[#C2410C] bg-[#FFF7ED] rounded-[10px] py-2 px-3.5 border-[1.5px] border-[#FED7AA] text-center w-full animate-[popup-in_0.25s_ease-out]">
                  {currentQuestion.hint}
                </div>
              )}
            </div>
            <button
              onClick={onSkip}
              className={`quiz-skip mt-4 font-body text-[13px] text-[#aaa] bg-transparent border-none cursor-pointer py-1.5 px-3 rounded-lg transition-colors duration-150 hover:text-[#C2410C] ${hasAnswered ? 'invisible' : ''}`}
            >
              Skip quiz →
            </button>
          </div>
        )}

        {isFinished && (
          <div className="quiz-result mt-3">
            <div className="quiz-score font-display text-[24px] text-[#C2410C] my-3">
              {correctAnswers === questions.length
                ? `🏆 Perfect score! ${correctAnswers}/${questions.length} 🏆`
                : correctAnswers >= 3
                  ? `👍 Great job! ${correctAnswers}/${questions.length} 👍`
                  : `💪 Keep practising! ${correctAnswers}/${questions.length} 💪`}
            </div>
            <button
              onClick={() => onComplete(correctAnswers, questions.length)}
              className="quiz-continue font-display text-base py-3 px-8 rounded-full border-none bg-[#4F46E5] text-white cursor-pointer transition-all duration-150 shadow-[0_4px_12px_rgba(79,70,229,0.3)] hover:scale-105 active:scale-95"
            >
              Continue 🚀
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
